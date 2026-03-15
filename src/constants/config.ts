export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ssfghjfxopmzdrlcgioq.supabase.co',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_Y_fqa-v-Yovpr5x3Kscsww_6-4MIFqf',
  },

  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_KEY || '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',
    model: 'llama-3.1-70b-versatile',
  },

  app: {
    name: 'Baby Tracker',
    version: '1.0.0',
  },
};
