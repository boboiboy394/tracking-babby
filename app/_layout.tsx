import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { colors } from '../src/constants/colors';
import { supabase } from '../src/services/supabase';

export default function RootLayout() {
  const { checkAuth, isLoading, user, setUser, setProfile } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="login"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="register"
          options={{ presentation: 'modal' }}
        />
      </Stack>
    </>
  );
}
