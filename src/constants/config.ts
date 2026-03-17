export const config = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY || '',
  },

  groq: {
    apiKey: process.env.EXPO_PUBLIC_GROQ_KEY || '',
    model: 'llama-3.1-8b-instant',
  },

  app: {
    name: 'Baby Tracker',
    version: '1.0.0',
  },
};
