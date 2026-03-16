import { supabase } from './supabase';
import type { Moment } from '../types';

export const momentService = {
  async getFeed(userId: string): Promise<Moment[]> {
    // Get user IDs to fetch moments from:
    // 1. User's own moments
    // 2. Family members' moments
    // 3. Friends' moments (accepted)

    // Get family member IDs
    const { data: userFamilyGroups } = await supabase
      .from('family_members')
      .select('group_id')
      .eq('user_id', userId)
      .limit(1);

    let familyIds: string[] = [];
    if (userFamilyGroups && userFamilyGroups.length > 0) {
      const groupId = userFamilyGroups[0].group_id;
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('group_id', groupId);
      familyIds = familyMembers?.map(f => f.user_id) || [];
    }

    // Get friend IDs (accepted friendships)
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id, user_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    const friendIds = friendships?.map(f => f.friend_id) || [];

    // Combine all user IDs
    const allUserIds = [userId, ...familyIds, ...friendIds];
    const uniqueUserIds = [...new Set(allUserIds)];

    const { data, error } = await supabase
      .from('moments')
      .select(`
        *,
        child:children(name),
        user:profiles(full_name, avatar_url)
      `)
      .in('user_id', uniqueUserIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data?.map(m => ({
      ...m,
      child_name: m.child?.name,
      user_name: m.user?.full_name,
      user_avatar: m.user?.avatar_url,
    })) || [];
  },

  async createMoment(
    userId: string,
    childId: string,
    imageUrl: string,
    caption?: string,
    shareWithFamily: boolean = true,
    shareWithFriends: string[] = []
  ): Promise<Moment> {
    // Insert moment
    const { data: moment, error } = await supabase
      .from('moments')
      .insert({
        user_id: userId,
        child_id: childId,
        image_url: imageUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto share with family - get user's family group
    if (shareWithFamily) {
      const { data: familyGroups } = await supabase
        .from('family_groups')
        .select('id')
        .eq('created_by', userId)
        .limit(1);

      if (familyGroups && familyGroups.length > 0) {
        const groupId = familyGroups[0].id;

        const { data: familyMembers } = await supabase
          .from('family_members')
          .select('user_id')
          .eq('group_id', groupId);

        if (familyMembers?.length) {
          const shares = familyMembers
            .filter((m: { user_id: string }) => m.user_id !== userId)
            .map((m: { user_id: string }) => ({
              moment_id: moment.id,
              shared_with_id: m.user_id,
              shared_type: 'family',
            }));

          if (shares.length > 0) {
            await supabase.from('moment_shares').insert(shares);
          }
        }
      }
    }

    // Share with selected friends
    if (shareWithFriends.length > 0) {
      const friendShares = shareWithFriends.map(friendId => ({
        moment_id: moment.id,
        shared_with_id: friendId,
        shared_type: 'friend',
      }));

      await supabase.from('moment_shares').insert(friendShares);
    }

    return moment;
  },

  async deleteMoment(momentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('moments')
      .delete()
      .eq('id', momentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async uploadImage(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `moments/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('moments')
      .upload(filename, blob);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('moments')
      .getPublicUrl(filename);

    return publicUrl;
  },
};
