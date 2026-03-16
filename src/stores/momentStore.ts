import { create } from 'zustand';
import type { Moment } from '../types';
import { momentService } from '../services/moments';
import { useAuthStore } from './authStore';

interface MomentState {
  moments: Moment[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;

  setMoments: (moments: Moment[]) => void;
  setCurrentIndex: (index: number) => void;
  fetchFeed: (userId: string) => Promise<void>;
  addMoment: (moment: Moment) => void;
  removeMoment: (momentId: string) => Promise<void>;
  nextMoment: () => void;
  prevMoment: () => void;
}

export const useMomentStore = create<MomentState>((set, get) => ({
  moments: [],
  currentIndex: 0,
  isLoading: false,
  error: null,

  setMoments: (moments) => set({ moments }),
  setCurrentIndex: (index) => set({ currentIndex: index }),

  fetchFeed: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const moments = await momentService.getFeed(userId);
      set({ moments, currentIndex: 0, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addMoment: (moment) => {
    const { moments } = get();
    set({ moments: [moment, ...moments] });
  },

  removeMoment: async (momentId) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      await momentService.deleteMoment(momentId, user.id);
      const { moments } = get();
      set({ moments: moments.filter(m => m.id !== momentId) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  nextMoment: () => {
    const { moments, currentIndex } = get();
    if (currentIndex < moments.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevMoment: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },
}));
