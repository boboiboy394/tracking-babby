import { supabase } from './supabase';
import type { Profile } from '../types';

export interface AuthUser {
  id: string;
  email: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export const authService = {
  async register({ email, password, full_name }: RegisterData): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    // Manually create profile since database trigger may not work
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        full_name: full_name || null,
        role: 'parent',
      });

    if (profileError) {
      console.warn('Profile creation warning:', profileError);
      // Continue anyway - profile might already exist from trigger
    }

    return { id: data.user.id, email };
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    return { id: data.user.id, email: data.user.email || '' };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email || '' };
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
