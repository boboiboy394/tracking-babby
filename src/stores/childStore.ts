import { create } from 'zustand';
import type { Child } from '../types';
import { supabase } from '../services/supabase';
import { useAuthStore } from './authStore';

interface ChildState {
  children: Child[];
  selectedChild: Child | null;
  isLoading: boolean;

  // Actions
  setChildren: (children: Child[]) => void;
  setSelectedChild: (child: Child | null) => void;
  fetchChildren: (parentId: string) => Promise<void>;
  addChild: (child: Omit<Child, 'id' | 'created_at' | 'parent_id'>) => Promise<Child>;
  updateChild: (id: string, data: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
}

export const useChildStore = create<ChildState>((set, get) => ({
  children: [],
  selectedChild: null,
  isLoading: false,

  setChildren: (children) => set({ children }),
  setSelectedChild: (child) => set({ selectedChild: child }),

  fetchChildren: async (parentId: string) => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching children:', error);
      set({ isLoading: false });
      return;
    }

    set({ children: data || [], isLoading: false });

    // Auto-select first child if none selected
    if (data && data.length > 0 && !get().selectedChild) {
      set({ selectedChild: data[0] });
    }
  },

  addChild: async (childData) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('children')
      .insert({
        ...childData,
        parent_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const children = [...get().children, data];
    set({ children });

    return data;
  },

  updateChild: async (id, data) => {
    const { error } = await supabase
      .from('children')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    const children = get().children.map(c =>
      c.id === id ? { ...c, ...data } : c
    );
    set({ children });

    if (get().selectedChild?.id === id) {
      set({ selectedChild: { ...get().selectedChild!, ...data } as Child });
    }
  },

  deleteChild: async (id) => {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const children = get().children.filter(c => c.id !== id);
    set({ children });

    if (get().selectedChild?.id === id) {
      set({ selectedChild: children[0] || null });
    }
  },
}));
