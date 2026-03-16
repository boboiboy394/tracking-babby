import { createClient } from '@supabase/supabase-js';
import { config } from '../constants/config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

export const getSupabaseClient = () => supabase;
