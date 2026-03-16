import { supabase } from './supabase';
import type { FamilyGroup, FamilyMember } from '../types';

export const familyService = {
  async getGroups(userId: string): Promise<FamilyGroup[]> {
    const { data, error } = await supabase
      .from('family_groups')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createGroup(userId: string, name: string): Promise<FamilyGroup> {
    const { data, error } = await supabase
      .from('family_groups')
      .insert({
        name,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin
    await supabase.from('family_members').insert({
      group_id: data.id,
      user_id: userId,
      role: 'admin',
    });

    return data;
  },

  async getMembers(groupId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        user:profiles(full_name, avatar_url, username)
      `)
      .eq('group_id', groupId);

    if (error) throw error;

    return data?.map(m => ({
      ...m,
      user_name: m.user?.full_name,
      user_avatar: m.user?.avatar_url,
    })) || [];
  },

  async addMember(groupId: string, username: string): Promise<FamilyMember> {
    // Find user by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  },
};
