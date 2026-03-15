import { create } from 'zustand';
import { authService, AuthUser } from '../services/auth';
import { Profile } from '../types';

interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, password);
      const profile = await authService.getProfile(user.id);
      set({ user, profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register({ email, password, full_name: fullName });
      const profile = await authService.getProfile(user.id);
      set({ user, profile, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, profile: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const profile = await authService.getProfile(user.id);
        set({ user, profile, isLoading: false });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    } catch {
      set({ user: null, profile: null, isLoading: false });
    }
  },
}));
