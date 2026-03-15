# Baby Tracker App - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete MVP mobile app for tracking baby growth, feeding, milestones, vaccinations with AI-powered insights and chat

**Architecture:** React Native (Expo) with Supabase backend, Claude API for AI features. Mobile-first design with tab navigation. Zustand for state management.

**Tech Stack:** React Native, Expo, Supabase, Zustand, Groq API (LLama 3), React Navigation

**API Keys Configuration:**
- Supabase URL: `https://ssfghjfxopmzdrlcgioq.supabase.co`
- Supabase Key: `sb_publishable_Y_fqa-v-Yovpr5x3Kscsww_6-4MIFqf`
- Groq API: `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`
- Expo Project ID: `22d282a0-d026-44c6-9aa1-dde2c6091658`

---

## File Structure

```
baby-tracker/
├── app/                          # Expo Router (file-based routing)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tab navigator config
│   │   ├── index.tsx            # HomeScreen
│   │   ├── tracking.tsx         # TrackingScreen
│   │   ├── ai.tsx               # AI Analysis Screen
│   │   ├── chat.tsx             # AI Chat Screen
│   │   ├── timeslice.tsx        # Timeslice Screen
│   │   └── profile.tsx          # Profile Screen
│   ├── _layout.tsx              # Root layout with AuthProvider
│   ├── login.tsx                # Login screen
│   ├── register.tsx             # Register screen
│   └── onboarding.tsx           # First-time child setup
├── src/
│   ├── components/              # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Avatar.tsx
│   │   ├── tracking/
│   │   │   ├── FeedingForm.tsx
│   │   │   ├── GrowthForm.tsx
│   │   │   ├── MilestoneForm.tsx
│   │   │   └── VaccinationForm.tsx
│   │   ├── chat/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── QuickQuestions.tsx
│   │   └── timeslice/
│   │       └── MediaPicker.tsx
│   ├── services/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── auth.ts             # Auth service
│   │   ├── children.ts         # Children CRUD
│   │   ├── tracking.ts         # Tracking CRUD
│   │   ├── ai.ts              # AI API calls
│   │   └── storage.ts         # File upload
│   ├── stores/
│   │   ├── authStore.ts        # Auth state
│   │   ├── childStore.ts       # Children state
│   │   └── chatStore.ts        # Chat state
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── constants/
│   │   ├── colors.ts          # Color palette
│   │   └── config.ts          # App config
│   └── utils/
│       ├── date.ts            # Date utilities
│       └── validation.ts     # Form validation
├── supabase/
│   ├── migrations/            # DB migrations
│   └── functions/             # Edge functions
│       ├── get-ai-analysis/
│       │   └── index.ts
│       └── chat-with-ai/
│           └── index.ts
├── package.json
├── app.json
├── tsconfig.json
└── babel.config.js
```

---

---

## Chunk 1: Foundation Setup

### Task 1.1: Initialize Expo Project

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "baby-tracker",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "prebuild": "expo prebuild",
    "lint": "eslint ."
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "@react-navigation/native-stack": "^7.0.0",
    "react-native-screens": "~4.4.0",
    "react-native-safe-area-context": "4.12.0",
    "@supabase/supabase-js": "^2.45.0",
    "zustand": "^4.5.0",
    "date-fns": "^3.6.0",
    "react-native-reanimated": "~3.16.0",
    "react-native-gesture-handler": "~2.20.0",
    "expo-image-picker": "~16.0.0",
    "expo-video-thumbnails": "~8.0.0",
    "expo-av": "~14.0.0",
    "expo-linear-gradient": "~14.0.0",
    "expo-status-bar": "~2.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/react": "~18.3.0",
    "typescript": "~5.3.0"
  },
  "private": true
}
```

- [ ] **Step 2: Create app.json**

```json
{
  "expo": {
    "name": "Baby Tracker",
    "slug": "baby-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "babytracker",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FFF8FA"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.babytracker.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFF8FA"
      },
      "package": "com.babytracker.app"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "22d282a0-d026-44c6-9aa1-dde2c6091658"
      }
    }
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 4: Create babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: All packages installed successfully

- [ ] **Step 6: Commit**

```bash
git add package.json app.json tsconfig.json babel.config.js
git commit -m "feat: initialize Expo project with dependencies

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.2: Create TypeScript Types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

```typescript
// User & Auth Types
export type UserRole = 'parent' | 'nurse' | 'clinic';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

// Child Types
export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  gender: 'male' | 'female' | null;
  photo_url: string | null;
  clinic_id: string | null;
  created_at: string;
}

// Tracking Types
export type RecordType = 'feeding' | 'milestone' | 'vaccination' | 'growth' | 'sleep';

export interface FeedingData {
  type: 'milk' | 'porridge' | 'solid';
  amount_ml?: number;
  times: number;
}

export interface MilestoneData {
  milestone_type: 'teeth' | 'crawl' | 'walk' | 'talk' | 'roll' | 'sit';
  description: string;
  date_achieved?: string;
}

export interface VaccinationData {
  vaccine_name: string;
  dose_number: number;
  date: string;
}

export interface GrowthData {
  height_cm: number;
  weight_kg: number;
  head_circumference_cm?: number;
}

export interface SleepData {
  duration_minutes: number;
  nap_count: number;
}

export type RecordData = FeedingData | MilestoneData | VaccinationData | GrowthData | SleepData;

export interface TrackingRecord {
  id: string;
  child_id: string;
  record_type: RecordType;
  record_date: string;
  data: RecordData;
  notes: string | null;
  created_at: string;
}

// Chat Types
export interface ChatSession {
  id: string;
  child_id: string;
  title: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  child_id: string;
  date_from?: string;
  date_to?: string;
  data_types: RecordType[];
}

export interface AIAnalysisResponse {
  summary: string;
  growth_assessment: string;
  feeding_insights: string;
  recommendations: string[];
  alerts: string[];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript types for app models

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.3: Create Constants (Colors & Config)

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/config.ts`

- [ ] **Step 1: Create colors.ts**

```typescript
export const colors = {
  primary: '#FF6B9D',
  primaryLight: '#FFB8D0',
  primaryDark: '#E84A7F',

  secondary: '#7C4DFF',
  secondaryLight: '#B47CFF',
  secondaryDark: '#5C35CC',

  accent: '#00D9A5',
  accentLight: '#5FFFCF',
  accentDark: '#00B087',

  background: '#FFF8FA',
  surface: '#FFFFFF',

  text: '#2D3436',
  textLight: '#636E72',
  textMuted: '#B2BEC3',

  error: '#FF6B6B',
  warning: '#FDCB6E',
  success: '#00D9A5',
  info: '#74B9FF',

  border: '#E8E8E8',
  divider: '#F0F0F0',

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ColorKey = keyof typeof colors;
```

- [ ] **Step 2: Create config.ts**

```typescript
import 'dotenv/config';

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
```

- [ ] **Step 3: Commit**

```bash
git add src/constants/colors.ts src/constants/config.ts
git commit -m "feat: add color palette and app configuration

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.4: Setup Supabase Client & Auth Service

**Files:**
- Create: `src/services/supabase.ts`
- Create: `src/services/auth.ts`

- [ ] **Step 1: Create supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js';
import { config } from '../constants/config';

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

export const getSupabaseClient = () => supabase;
```

- [ ] **Step 2: Create auth.ts service**

```typescript
import { supabase } from './supabase';
import { Profile } from '../types';

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

    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      email,
      full_name: full_name || null,
      role: 'parent',
    });

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
```

- [ ] **Step 3: Commit**

```bash
git add src/services/supabase.ts src/services/auth.ts
git commit -m "feat: add Supabase client and auth service

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.5: Create Zustand Stores

**Files:**
- Create: `src/stores/authStore.ts`
- Create: `src/stores/childStore.ts`

- [ ] **Step 1: Create authStore.ts**

```typescript
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
```

- [ ] **Step 2: Create childStore.ts**

```typescript
import { create } from 'zustand';
import { Child } from '../types';
import { supabase } from '../services/supabase';

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
      set({ selectedChild: { ...get().selectedChild, ...data } });
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
```

- [ ] **Step 3: Commit**

```bash
git add src/stores/authStore.ts src/stores/childStore.ts
git commit -m "feat: add Zustand stores for auth and children

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.6: Create Common UI Components

**Files:**
- Create: `src/components/common/Button.tsx`
- Create: `src/components/common/Card.tsx`
- Create: `src/components/common/Input.tsx`
- Create: `src/components/common/Avatar.tsx`

- [ ] **Step 1: Create Button.tsx**

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const base = [styles.base, styles[size]];

    switch (variant) {
      case 'secondary':
        base.push(styles.secondary);
        break;
      case 'outline':
        base.push(styles.outline);
        break;
      case 'ghost':
        base.push(styles.ghost);
        break;
      default:
        base.push(styles.primary);
    }

    if (disabled) base.push(styles.disabled);

    return base;
  };

  const getTextStyle = () => {
    const base = [styles.text, styles[`${size}Text`]];

    switch (variant) {
      case 'outline':
        base.push(styles.outlineText);
        break;
      case 'ghost':
        base.push(styles.ghostText);
        break;
      default:
        base.push(styles.primaryText);
    }

    if (disabled) base.push(styles.disabledText);

    return base;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  text: 24,
  {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textMuted,
  },
});
```

- [ ] **Step 2: Create Card.tsx**

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 16 }) => {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

- [ ] **Step 3: Create Input.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
```

- [ ] **Step 4: Create Avatar.tsx**

```typescript
import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  style,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size / 2.5 }]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.primaryLight,
  },
  placeholder: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primary,
    fontWeight: '600',
  },
});
```

- [ ] **Step 5: Commit**

```bash
git add src/components/common/
git commit -m "feat: add common UI components (Button, Card, Input, Avatar)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.7: Create Root Layout & Navigation Setup

**Files:**
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Create app/_layout.tsx**

```typescript
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { colors } from '../src/constants/colors';

export default function RootLayout() {
  const { checkAuth, isLoading, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

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
```

- [ ] **Step 2: Create app/(tabs)/_layout.tsx**

```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    tracking: '📊',
    ai: '🤖',
    timeslice: '🎬',
    profile: '👤',
  };

  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, focused && styles.iconFocused]}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ focused }) => <TabIcon name="tracking" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ focused }) => <TabIcon name="ai" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="timeslice"
        options={{
          title: 'Timeslice',
          tabBarIcon: ({ focused }) => <TabIcon name="timeslice" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx app/\(tabs\)/_layout.tsx
git commit -m "feat: add root layout and tab navigation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.8: Create Login & Register Screens

**Files:**
- Create: `app/login.tsx`
- Create: `app/register.tsx`

- [ ] **Step 1: Create login.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { Button } from '../src/components/common/Button';
import { Input } from '../src/components/common/Input';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>👶</Text>
          <Text style={styles.title}>Baby Tracker</Text>
          <Text style={styles.subtitle}>Theo dõi bé yêu dễ dàng</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Đăng nhập</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input
            label="Email"
            placeholder="nhaphuong@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Đăng nhập"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={styles.link}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Step 2: Create register.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { Button } from '../src/components/common/Button';
import { Input } from '../src/components/common/Input';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/constants/colors';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setError('');
      await register(email, password, fullName);
      router.replace('/(tabs)');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>👶</Text>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Theo dõi bé yêu mỗi ngày</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Đăng ký</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input
            label="Họ tên"
            placeholder="Nguyễn Văn A"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Input
            label="Email"
            placeholder="nhaphuong@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Đăng ký"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: colors.textLight,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add app/login.tsx app/register.tsx
git commit -m "feat: add login and register screens

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.9: Create Home Screen (Dashboard)

**Files:**
- Create: `app/(tabs)/index.tsx`

- [ ] **Step 1: Create HomeScreen**

```typescript
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Avatar } from '../../src/components/common/Avatar';
import { colors } from '../../src/constants/colors';
import { format, differenceInMonths } from 'date-fns';

export default function HomeScreen() {
  const { user, profile } = useAuthStore();
  const { children, selectedChild, fetchChildren, isLoading } = useChildStore();

  useEffect(() => {
    if (user) {
      fetchChildren(user.id);
    }
  }, [user]);

  const calculateAge = (birthDate: string) => {
    const months = differenceInMonths(new Date(), new Date(birthDate));
    if (months < 12) {
      return `${months} tháng tuổi`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} tuổi ${remainingMonths} tháng`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => user && fetchChildren(user.id)} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {profile?.full_name || 'Mẹ/Bố'}!</Text>
          {selectedChild && (
            <Text style={styles.childName}>Theo dõi bé {selectedChild.name}</Text>
          )}
        </View>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name || ''} size={48} />
      </View>

      {/* Child Card */}
      {selectedChild ? (
        <Card style={styles.childCard}>
          <View style={styles.childHeader}>
            <Avatar uri={selectedChild.photo_url} name={selectedChild.name} size={64} />
            <View style={styles.childInfo}>
              <Text style={styles.childNameLarge}>{selectedChild.name}</Text>
              <Text style={styles.childAge}>{calculateAge(selectedChild.birth_date)}</Text>
            </View>
          </View>

          {children.length > 1 && (
            <View style={styles.childSelector}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childChip,
                    selectedChild.id === child.id && styles.childChipActive,
                  ]}
                  onPress={() => useChildStore.getState().setSelectedChild(child)}
                >
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild.id === child.id && styles.childChipTextActive,
                    ]}
                  >
                    {child.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyTitle}>Chưa có bé nào</Text>
          <Text style={styles.emptyText}>Thêm bé để bắt đầu theo dõi</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.addButtonText}>+ Thêm bé</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hành động nhanh</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/tracking')}
        >
          <Text style={styles.actionIcon}>🍼</Text>
          <Text style={styles.actionText}>Thêm bữa ăn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/ai')}
        >
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionText}>Phân tích AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/tracking')}
        >
          <Text style={styles.actionIcon}>📏</Text>
          <Text style={styles.actionText}>Cân nặng</Text>
        </TouchableOpacity>
      </View>

      {/* Growth Summary */}
      <Card style={styles.growthCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📈 Tăng trưởng tháng này</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tracking')}>
            <Text style={styles.seeAll}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.growthStats}>
          <View style={styles.growthStat}>
            <Text style={styles.growthValue}>-- cm</Text>
            <Text style={styles.growthLabel}>Chiều cao</Text>
          </View>
          <View style={styles.growthDivider} />
          <View style={styles.growthStat}>
            <Text style={styles.growthValue}>-- kg</Text>
            <Text style={styles.growthLabel}>Cân nặng</Text>
          </View>
        </View>
      </Card>

      {/* Next Vaccination */}
      <Card style={styles.vaccineCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💉 Vaccine sắp tới</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tracking')}>
            <Text style={styles.seeAll}>Xem lịch</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.vaccineText}>Chưa có lịch tiêm</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textLight,
  },
  childName: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
  },
  childCard: {
    marginBottom: 24,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childInfo: {
    marginLeft: 16,
    flex: 1,
  },
  childNameLarge: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  childAge: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
  childSelector: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 8,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  childChipActive: {
    backgroundColor: colors.primary,
  },
  childChipText: {
    fontSize: 14,
    color: colors.textLight,
  },
  childChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  growthCard: {
    marginBottom: 16,
  },
  vaccineCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  growthStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthStat: {
    flex: 1,
    alignItems: 'center',
  },
  growthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  growthLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  growthDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.divider,
  },
  vaccineText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat: add home screen dashboard

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 1.10: Create Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create SQL migration**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'nurse', 'clinic')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CHILDREN
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  clinic_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRACKING RECORDS
CREATE TABLE IF NOT EXISTS tracking_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('feeding', 'milestone', 'vaccination', 'growth', 'sleep')),
  record_date TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AI CHAT
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Parents see own children" ON children
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "Parents insert own children" ON children
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents update own children" ON children
  FOR UPDATE USING (parent_id = auth.uid());

CREATE POLICY "Parents delete own children" ON children
  FOR DELETE USING (parent_id = auth.uid());

-- For clinics - see linked children
CREATE POLICY "Clinics see linked children" ON children
  FOR SELECT USING (clinic_id = auth.uid());

-- Tracking records policies
CREATE POLICY "Parents see own tracking records" ON tracking_records
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents insert tracking records" ON tracking_records
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents update tracking records" ON tracking_records
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents delete tracking records" ON tracking_records
  FOR DELETE USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Chat policies
CREATE POLICY "Parents see own chat sessions" ON chat_sessions
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents create chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents see own chat messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );

CREATE POLICY "Parents insert chat messages" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_tracking_records_child_id ON tracking_records(child_id);
CREATE INDEX idx_tracking_records_type ON tracking_records(record_type);
CREATE INDEX idx_tracking_records_date ON tracking_records(record_date);
CREATE INDEX idx_chat_sessions_child_id ON chat_sessions(child_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add Supabase database schema with RLS policies

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Chunk 1 Summary

✅ Complete:
- Task 1.1: Initialize Expo Project
- Task 1.2: Create TypeScript Types
- Task 1.3: Create Constants (Colors & Config)
- Task 1.4: Setup Supabase Client & Auth Service
- Task 1.5: Create Zustand Stores
- Task 1.6: Create Common UI Components
- Task 1.7: Create Root Layout & Navigation
- Task 1.8: Create Login & Register Screens
- Task 1.9: Create Home Screen
- Task 1.10: Create Supabase Database Schema

---

## Chunk 2: Core Tracking Features

### Task 2.1: Create Tracking Services

**Files:**
- Modify: `src/services/tracking.ts`

- [ ] **Step 1: Create tracking service**

```typescript
import { supabase } from './supabase';
import { TrackingRecord, RecordType, RecordData } from '../types';

export const trackingService = {
  async getRecords(
    childId: string,
    options?: {
      type?: RecordType;
      dateFrom?: string;
      dateTo?: string;
      limit?: number;
    }
  ): Promise<TrackingRecord[]> {
    let query = supabase
      .from('tracking_records')
      .select('*')
      .eq('child_id', childId)
      .order('record_date', { ascending: false });

    if (options?.type) {
      query = query.eq('record_type', options.type);
    }

    if (options?.dateFrom) {
      query = query.gte('record_date', options.dateFrom);
    }

    if (options?.dateTo) {
      query = query.lte('record_date', options.dateTo);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async addRecord(
    childId: string,
    recordType: RecordType,
    data: RecordData,
    notes?: string,
    recordDate?: string
  ): Promise<TrackingRecord> {
    const { data: record, error } = await supabase
      .from('tracking_records')
      .insert({
        child_id: childId,
        record_type: recordType,
        data,
        notes: notes || null,
        record_date: recordDate || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return record;
  },

  async updateRecord(
    id: string,
    data: Partial<{ data: RecordData; notes: string; record_date: string }>
  ): Promise<void> {
    const { error } = await supabase
      .from('tracking_records')
      .update(data)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('tracking_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getGrowthHistory(childId: string, limit = 12): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'growth', limit });
  },

  async getFeedingHistory(childId: string, limit = 30): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'feeding', limit });
  },

  async getMilestones(childId: string): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'milestone' });
  },

  async getVaccinations(childId: string): Promise<TrackingRecord[]> {
    return this.getRecords(childId, { type: 'vaccination' });
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/tracking.ts
git commit -m "feat: add tracking service for CRUD operations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2.2: Create Tracking Screen

**Files:**
- Create: `app/(tabs)/tracking.tsx`

```typescript
// Full implementation with tab navigation for different tracking types
// See plan document for complete code
```

---

*Plan continues with Chunk 2 (Core Tracking), Chunk 3 (AI Features), Chunk 4 (Polish)*

---
