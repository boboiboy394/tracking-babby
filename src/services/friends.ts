import { supabase } from './supabase';
import type { Friendship } from '../types';

export const friendService = {
  async getFriends(userId: string): Promise<Friendship[]> {
    // Get accepted friendships
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:profiles(id, full_name, avatar_url, username)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(f => ({
      ...f,
      friend_name: f.friend?.full_name,
      friend_avatar: f.friend?.avatar_url,
      friend_username: f.friend?.username,
    })) || [];
  },

  async getPendingRequests(userId: string): Promise<Friendship[]> {
    // Get pending requests where user is the receiver
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        user:profiles(id, full_name, avatar_url, username)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(f => ({
      ...f,
      friend_name: f.user?.full_name,
      friend_avatar: f.user?.avatar_url,
      friend_username: f.user?.username,
    })) || [];
  },

  async searchUsers(query: string): Promise<{id: string; username: string; full_name: string; avatar_url: string}[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .ilike('username', `%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async sendRequest(userId: string, friendUsername: string): Promise<void> {
    // Find friend by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', friendUsername)
      .single();

    if (profileError || !profile) {
      throw new Error('User not found');
    }
    if (profile.id === userId) {
      throw new Error('Cannot add yourself');
    }

    const { error } = await supabase.from('friendships').insert({
      user_id: userId,
      friend_id: profile.id,
      status: 'pending',
    });

    if (error) throw error;
  },

  async acceptRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) throw error;
  },

  async rejectRequest(requestId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) throw error;
  },

  async removeFriend(friendshipId: string): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId);

    if (error) throw error;
  },
};
