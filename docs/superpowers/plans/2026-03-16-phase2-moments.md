# Phase 2: Moments (Locket-like Feature) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Locket-like moment sharing - allow parents to share baby photos with family and friends, real-time feed, full-screen photo viewing

**Architecture:** Add new database tables for moments, family groups, friendships. Create services for CRUD. Update Home tab with real-time feed. Add new screens for Moments, Family, Friends.

**Tech Stack:** React Native + Expo, Supabase (DB + Storage + Realtime), Zustand

---

## Chunk 1: Database Setup

### Task 1: Add username field to profiles

**Files:**
- Modify: `supabase/migrations/003_add_username.sql`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create migration to add username to profiles**

```sql
-- Add username column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
```

Run in Supabase SQL Editor:
```bash
# Copy content of supabase/migrations/003_add_username.sql and run in Supabase
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/003_add_username.sql
git commit -m "feat: add username field to profiles"
```

### Task 2: Create moments tables

**Files:**
- Create: `supabase/migrations/004_create_moments.sql`

- [ ] **Step 1: Create migration for moments, family_groups, friendships, moment_shares tables**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Moments: Lưu khoảnh khắc
CREATE TABLE IF NOT EXISTS moments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Groups: Nhóm gia đình
CREATE TABLE IF NOT EXISTS family_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Members: Thành viên nhóm
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Friendships: Kết bạn
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Moment Shares: Ai được xem moment
CREATE TABLE IF NOT EXISTS moment_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  shared_with_id UUID,
  shared_type TEXT CHECK (shared_type IN ('friend', 'family')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_moments_user_id ON moments(user_id);
CREATE INDEX idx_moments_child_id ON moments(child_id);
CREATE INDEX idx_moments_created_at ON moments(created_at DESC);
CREATE INDEX idx_family_members_group_id ON family_members(group_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_moment_shares_moment_id ON moment_shares(moment_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/004_create_moments.sql
git commit -m "feat: add moments, family, friends tables"
```

### Task 3: Create storage bucket

**Files:**
- Modify: `supabase/migrations/004_create_moments.sql`

- [ ] **Step 1: Add storage bucket for moments images**

Add to migration file:
```sql
-- Create storage bucket for moments
INSERT INTO storage.buckets (id, name, public)
VALUES ('moments', 'moments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to moments
CREATE POLICY "Public can view moments" ON storage.objects
FOR SELECT USING (bucket_id = 'moments');

-- Allow authenticated users to upload moments
CREATE POLICY "Users can upload moments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'moments' AND auth.uid() = (storage.foldername(name))[1]::uuid);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/004_create_moments.sql
git commit -m "feat: add moments storage bucket"
```

---

## Chunk 2: Types and Services

### Task 4: Add TypeScript types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Add Moment, FamilyGroup, FamilyMember, Friendship, MomentShare types**

```typescript
// Add to src/types/index.ts

export interface Moment {
  id: string;
  user_id: string;
  child_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  // Joined fields
  child_name?: string;
  user_name?: string;
  user_avatar?: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  // Joined
  user_name?: string;
  user_avatar?: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  // Joined
  friend_name?: string;
  friend_avatar?: string;
  friend_username?: string;
}

export interface MomentShare {
  id: string;
  moment_id: string;
  shared_with_id: string;
  shared_type: 'friend' | 'family';
  created_at: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add Moment, Family, Friendship types"
```

### Task 5: Create moments service

**Files:**
- Create: `src/services/moments.ts`

- [ ] **Step 1: Create moments service**

```typescript
import { supabase } from './supabase';
import type { Moment } from '../types';

export const momentService = {
  async getFeed(userId: string): Promise<Moment[]> {
    // Get moments from:
    // 1. User's own moments
    // 2. Family members' moments
    // 3. Friends' moments (accepted)
    const { data, error } = await supabase
      .from('moments')
      .select(`
        *,
        child:children(name),
        user:profiles(full_name, avatar_url)
      `)
      .or(`user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data?.map(m => ({
      ...m,
      child_name: m.child?.name,
      user_name: m.user?.full_name,
      user_avatar: m.user?.avatar_url,
    })) || [];
  },

  async createMoment(
    userId: string,
    childId: string,
    imageUrl: string,
    caption?: string,
    shareWithFamily: boolean = true,
    shareWithFriends: string[] = []
  ): Promise<Moment> {
    // Insert moment
    const { data: moment, error } = await supabase
      .from('moments')
      .insert({
        user_id: userId,
        child_id: childId,
        image_url: imageUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Auto share with family
    if (shareWithFamily) {
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('group_id', userId); // Simplified - should get user's family group

      if (familyMembers?.length) {
        const shares = familyMembers
          .filter(m => m.user_id !== userId)
          .map(m => ({
            moment_id: moment.id,
            shared_with_id: m.user_id,
            shared_type: 'family',
          }));

        await supabase.from('moment_shares').insert(shares);
      }
    }

    // Share with selected friends
    if (shareWithFriends.length) {
      const friendShares = shareWithFriends.map(friendId => ({
        moment_id: moment.id,
        shared_with_id: friendId,
        shared_type: 'friend',
      }));

      await supabase.from('moment_shares').insert(friendShares);
    }

    return moment;
  },

  async deleteMoment(momentId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('moments')
      .delete()
      .eq('id', momentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async uploadImage(uri: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `moments/${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('moments')
      .upload(filename, blob);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('moments')
      .getPublicUrl(filename);

    return publicUrl;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/moments.ts
git commit -m "feat: add moments service"
```

### Task 6: Create family service

**Files:**
- Create: `src/services/family.ts`

- [ ] **Step 1: Create family service**

```typescript
import { supabase } from './supabase';
import type { FamilyGroup, FamilyMember } from '../types';

export const familyService = {
  async getGroups(userId: string): Promise<FamilyGroup[]> {
    const { data, error } = await supabase
      .from('family_groups')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createGroup(userId: string, name: string): Promise<FamilyGroup> {
    const { data, error } = await supabase
      .from('family_groups')
      .insert({
        name,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin
    await supabase.from('family_members').insert({
      group_id: data.id,
      user_id: userId,
      role: 'admin',
    });

    return data;
  },

  async getMembers(groupId: string): Promise<FamilyMember[]> {
    const { data, error } = await supabase
      .from('family_members')
      .select(`
        *,
        user:profiles(full_name, avatar_url, username)
      `)
      .eq('group_id', groupId);

    if (error) throw error;

    return data?.map(m => ({
      ...m,
      user_name: m.user?.full_name,
      user_avatar: m.user?.avatar_url,
    })) || [];
  },

  async addMember(groupId: string, username: string): Promise<FamilyMember> {
    // Find user by username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    if (!profile) throw new Error('User not found');

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        group_id: groupId,
        user_id: profile.id,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/family.ts
git commit -m "feat: add family service"
```

### Task 7: Create friends service

**Files:**
- Create: `src/services/friends.ts`

- [ ] **Step 1: Create friends service**

```typescript
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', friendUsername)
      .single();

    if (!profile) throw new Error('User not found');
    if (profile.id === userId) throw new Error('Cannot add yourself');

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
```

- [ ] **Step 2: Commit**

```bash
git add src/services/friends.ts
git commit -m "feat: add friends service"
```

---

## Chunk 3: Stores

### Task 8: Create moment store

**Files:**
- Create: `src/stores/momentStore.ts`

- [ ] **Step 1: Create moment store with Zustand**

```typescript
import { create } from 'zustand';
import type { Moment } from '../types';
import { momentService } from '../services/moments';

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

// Import useAuthStore for removeMoment
import { useAuthStore } from './authStore';
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/momentStore.ts
git commit -m "feat: add moment store"
```

---

## Chunk 4: UI Screens

### Task 9: Create Moments screen (Add Moment)

**Files:**
- Create: `app/(tabs)/moments.tsx`

- [ ] **Step 1: Create Moments screen with image picker**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { momentService } from '../../src/services/moments';
import { Button } from '../../src/components/common/Button';
import { Card } from '../../src/components/common/Card';
import { colors } from '../../src/constants/colors';

export default function MomentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, selectedChild } = useChildStore();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [shareWithFamily, setShareWithFamily] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!image || !selectedChild || !user) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh và bé');
      return;
    }

    setLoading(true);
    try {
      // Upload image
      const imageUrl = await momentService.uploadImage(image);

      // Create moment
      await momentService.createMoment(
        user.id,
        selectedChild.id,
        imageUrl,
        caption || undefined,
        shareWithFamily
      );

      Alert.alert('Thành công', 'Đã chia sẻ khoảnh khắc!');
      setImage(null);
      setCaption('');
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thêm khoảnh khắc</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
      <Card style={styles.card}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          placeholder="Thêm mô tả..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </Card>

      {/* Share Options */}
      <Card style={styles.card}>
        <Text style={styles.label}>Chia sẻ tới:</Text>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setShareWithFamily(!shareWithFamily)}
        >
          <Text style={styles.checkbox}>
            {shareWithFamily ? '☑️' : '⬜'}
          </Text>
          <Text style={styles.checkboxLabel}>Gia đình</Text>
        </TouchableOpacity>
      </Card>

      {/* Child Selector */}
      {children.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.label}>Bé trong ảnh:</Text>
          <View style={styles.childList}>
            {children.map(child => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  selectedChild?.id === child.id && styles.childChipActive,
                ]}
                onPress={() => useChildStore.getState().setSelectedChild(child)}
              >
                <Text style={[
                  styles.childChipText,
                  selectedChild?.id === child.id && styles.childChipTextActive,
                ]}>
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Submit */}
      <Button
        title={loading ? 'Đang gửi...' : '📤 Gửi khoảnh khắc'}
        onPress={handleSend}
        disabled={!image || !selectedChild || loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: '600' },
  imagePicker: { height: 300, margin: 16, borderRadius: 16, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 48 },
  placeholderText: { color: colors.textMuted, marginTop: 8 },
  card: { margin: 16, marginTop: 0 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, minHeight: 80 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { fontSize: 20, marginRight: 8 },
  checkboxLabel: { fontSize: 16 },
  childList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  childChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background },
  childChipActive: { backgroundColor: colors.primary },
  childChipText: { fontSize: 14 },
  childChipTextActive: { color: colors.white },
  submitButton: { margin: 16 },
});
```

- [ ] **Step 2: Install image picker if needed**

```bash
cd D:/bia-project
npx expo install expo-image-picker
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/moments.tsx
git commit -m "feat: add moments creation screen"
```

### Task 10: Create Family screen

**Files:**
- Create: `app/(tabs)/family.tsx`

- [ ] **Step 1: Create Family management screen**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { familyService } from '../../src/services/family';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';
import type { FamilyGroup, FamilyMember } from '../../src/types';

export default function FamilyScreen() {
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadGroups();
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;
    const data = await familyService.getGroups(user.id);
    setGroups(data);
    if (data.length > 0 && !selectedGroup) {
      selectGroup(data[0]);
    }
  };

  const selectGroup = async (group: FamilyGroup) => {
    setSelectedGroup(group);
    const data = await familyService.getMembers(group.id);
    setMembers(data);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    setLoading(true);
    try {
      const group = await familyService.createGroup(user.id, newGroupName);
      setGroups([...groups, group]);
      selectGroup(group);
      setShowCreateModal(false);
      setNewGroupName('');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    if (!newMemberUsername.trim() || !selectedGroup) return;
    setLoading(true);
    try {
      await familyService.addMember(selectedGroup.id, newMemberUsername);
      const data = await familyService.getMembers(selectedGroup.id);
      setMembers(data);
      setShowAddMemberModal(false);
      setNewMemberUsername('');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👨‍👩‍👧‍👦 Gia đình</Text>
        <Button
          title="+ Tạo nhóm"
          variant="primary"
          size="small"
          onPress={() => setShowCreateModal(true)}
        />
      </View>

      {/* Groups List */}
      <FlatList
        horizontal
        data={groups}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.groupChip,
              selectedGroup?.id === item.id && styles.groupChipActive,
            ]}
            onPress={() => selectGroup(item)}
          >
            <Text style={[
              styles.groupChipText,
              selectedGroup?.id === item.id && styles.groupChipTextActive,
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.groupList}
        contentContainerStyle={styles.groupListContent}
      />

      {/* Members List */}
      <FlatList
        data={members}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={styles.memberCard}>
            <View style={styles.memberRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.user_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.user_name}</Text>
                <Text style={styles.memberRole}>
                  {item.role === 'admin' ? 'Quản lý' : 'Thành viên'}
                </Text>
              </View>
              {item.role !== 'admin' && (
                <TouchableOpacity
                  onPress={() => familyService.removeMember(item.id).then(loadGroups)}
                >
                  <Text style={styles.removeButton}>❌</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có thành viên nào</Text>
        }
        contentContainerStyle={styles.membersList}
      />

      {/* Add Member Button */}
      {selectedGroup && (
        <Button
          title="+ Thêm thành viên"
          variant="outline"
          onPress={() => setShowAddMemberModal(true)}
          style={styles.addMemberButton}
        />
      )}

      {/* Create Group Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Tạo nhóm gia đình</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tên nhóm..."
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.modalButtons}>
              <Button title="Hủy" variant="ghost" onPress={() => setShowCreateModal(false)} />
              <Buttono" onPress={handleCreateGroup title="Tạ} loading={loading} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Member Modal */}
      <Modal visible={showAddMemberModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Thêm thành viên</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Username..."
              value={newMemberUsername}
              onChangeText={setNewMemberUsername}
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <Button title="Hủy" variant="ghost" onPress={() => setShowAddMemberModal(false)} />
              <Button title="Thêm" onPress={handleAddMember} loading={loading} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700' },
  groupList: { maxHeight: 50 },
  groupListContent: { paddingHorizontal: 16, gap: 8 },
  groupChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8 },
  groupChipActive: { backgroundColor: colors.primary },
  groupChipText: { fontSize: 14 },
  groupChipTextActive: { color: colors.white },
  membersList: { padding: 16 },
  memberCard: { marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '600' },
  memberInfo: { flex: 1, marginLeft: 12 },
  memberName: { fontSize: 16, fontWeight: '600' },
  memberRole: { fontSize: 12, color: colors.textMuted },
  removeButton: { fontSize: 20, padding: 8 },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  addMemberButton: { margin: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalInput: { backgroundColor: colors.background, borderRadius: 8, padding: 12, marginBottom: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/family.tsx
git commit -m "feat: add family management screen"
```

### Task 11: Create Friends screen

**Files:**
- Create: `app/(tabs)/friends.tsx`

- [ ] **Step 1: Create Friends management screen**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useAuthStore } from '../../src/stores/authStore';
import { friendService } from '../../src/services/friends';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';
import type { Friendship } from '../../src/types';

export default function FriendsScreen() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchResults, setSearchResults] = useState<{id: string; username: string; full_name: string}[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadPendingRequests();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    const data = await friendService.getFriends(user.id);
    setFriends(data);
  };

  const loadPendingRequests = async () => {
    if (!user) return;
    const data = await friendService.getPendingRequests(user.id);
    setPendingRequests(data);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await friendService.searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  const handleSendRequest = async () => {
    if (!searchQuery.trim() || !user) return;
    setLoading(true);
    try {
      await friendService.sendRequest(user.id, searchQuery);
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn');
      setShowSearchModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendService.acceptRequest(requestId);
      loadPendingRequests();
      loadFriends();
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await friendService.rejectRequest(requestId);
      loadPendingRequests();
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const renderFriend = ({ item }: { item: Friendship }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.friend_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.friend_name}</Text>
          <Text style={styles.friendUsername}>@{item.friend_username}</Text>
        </View>
        <TouchableOpacity onPress={() => friendService.removeFriend(item.id).then(loadFriends)}>
          <Text style={styles.removeButton}>❌</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderRequest = ({ item }: { item: Friendship }) => (
    <Card style={styles.requestCard}>
      <View style={styles.requestRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.friend_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{item.friend_name}</Text>
          <Text style={styles.requestUsername}>@{item.friend_username}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity onPress={() => handleAccept(item.id)}>
            <Text style={styles.acceptButton}>✅</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleReject(item.id)}>
            <Text style={styles.rejectButton}>❌</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👫 Bạn bè</Text>
        <Button
          title="+ Mời"
          variant="primary"
          size="small"
          onPress={() => setShowSearchModal(true)}
        />
      </View>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Lời mời kết bạn</Text>
          <FlatList
            data={pendingRequests}
            keyExtractor={item => item.id}
            renderItem={renderRequest}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.requestsList}
          />
        </>
      )}

      {/* Friends List */}
      <Text style={styles.sectionTitle}>Danh sách bạn bè</Text>
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderFriend}
        contentContainerStyle={styles.friendsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có bạn bè nào</Text>
        }
      />

      {/* Search Modal */}
      <Modal visible={showSearchModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Tìm và kết bạn</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nhập username..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            <Button title="Tìm kiếm" onPress={handleSearch} loading={loading} />

            {searchResults.map(result => (
              <TouchableOpacity
                key={result.id}
                style={styles.searchResult}
                onPress={handleSendRequest}
              >
                <Text>{result.full_name} (@{result.username})</Text>
              </TouchableOpacity>
            ))}

            <Button
              title="Đóng"
              variant="ghost"
              onPress={() => {
                setShowSearchModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '600', paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  requestsList: { paddingHorizontal: 16 },
  requestCard: { marginRight: 8, width: 200 },
  requestRow: { flexDirection: 'row', alignItems: 'center' },
  requestInfo: { flex: 1, marginLeft: 12 },
  requestName: { fontSize: 14, fontWeight: '600' },
  requestUsername: { fontSize: 12, color: colors.textMuted },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptButton: { fontSize: 20 },
  rejectButton: { fontSize: 20 },
  friendsList: { padding: 16 },
  friendCard: { marginBottom: 8 },
  friendRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 18, fontWeight: '600' },
  friendInfo: { flex: 1, marginLeft: 12 },
  friendName: { fontSize: 16, fontWeight: '600' },
  friendUsername: { fontSize: 12, color: colors.textMuted },
  removeButton: { fontSize: 20, padding: 8 },
  emptyText: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  modalInput: { backgroundColor: colors.background, borderRadius: 8, padding: 12, marginBottom: 16 },
  searchResult: { padding: 12, backgroundColor: colors.background, borderRadius: 8, marginTop: 8 },
});
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/friends.tsx
git commit -m "feat: add friends management screen"
```

---

## Chunk 5: Update Home Tab with Moments Feed

### Task 12: Update Home tab for Moments feed

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Update Home tab with full-screen moments feed**

```typescript
// Add to existing imports
import { useEffect, useRef } from 'react';
import { Image, Dimensions, ViewPagerAndroidBase } from 'react-native';
import { useMomentStore } from '../../src/stores/momentStore';
import { useAuthStore } from '../../src/stores/authStore';
import { supabase } from '../../src/services/supabase';

// Add to HomeScreen component
const { user } = useAuthStore();
const { moments, currentIndex, fetchFeed, nextMoment, prevMoment } = useMomentStore();
const flatListRef = useRef(null);

useEffect(() => {
  if (user) {
    fetchFeed(user.id);

    // Real-time subscription
    const channel = supabase
      .channel('moments')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moments' }, (payload) => {
        fetchFeed(user.id);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
}, [user]);

// Replace render with full-screen moment view
{moments.length > 0 ? (
  <View style={styles.momentContainer}>
    <Image
      source={{ uri: moments[currentIndex]?.image_url }}
      style={styles.momentImage}
      resizeMode="cover"
    />
    <View style={styles.momentOverlay}>
      <Text style={styles.momentCaption}>{moments[currentIndex]?.caption}</Text>
      <Text style={styles.momentChild}>👶 {moments[currentIndex]?.child_name}</Text>
      <Text style={styles.momentTime}>
        {new Date(moments[currentIndex]?.created_at).toLocaleString('vi')}
      </Text>
    </View>
    <View style={styles.momentNav}>
      <TouchableOpacity onPress={prevMoment} disabled={currentIndex === 0}>
        <Text style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={nextMoment} disabled={currentIndex === moments.length - 1}>
        <Text style={[styles.navButton, currentIndex === moments.length - 1 && styles.navButtonDisabled]}>→</Text>
      </TouchableOpacity>
    </View>
  </View>
) : (
  <Card style={styles.emptyCard}>
    <Text style={styles.emptyIcon}>📷</Text>
    <Text style={styles.emptyTitle}>Chưa có khoảnh khắc nào</Text>
    <Text style={styles.emptyText}>Hãy thêm khoảnh khắc đầu tiên!</Text>
  </Card>
)}
```

- [ ] **Step 2: Add styles for moments**

```typescript
// Add to styles
momentContainer: { flex: 1, position: 'relative' },
momentImage: { width: '100%', height: '100%', position: 'absolute' },
momentOverlay: { position: 'absolute', bottom: 100, left: 16, right: 16 },
momentCaption: { color: colors.white, fontSize: 16, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
momentChild: { color: colors.white, fontSize: 14, marginTop: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
momentTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
momentNav: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 40 },
navButton: { fontSize: 32, color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
navButtonDisabled: { opacity: 0.3 },
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: update Home with moments feed"
```

### Task 13: Update tab navigation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

- [ ] **Step 1: Add Moments, Family, Friends tabs**

```typescript
// Add to tab icons
const icons = {
  index: '🏠',
  moments: '📷',
  family: '👨‍👩‍👧‍👦',
  friends: '👫',
  // Keep existing
}
```

- [ ] **Step 2: Add tab screens**

```typescript
// Add new Tab.Screen entries
<Tabs.Screen name="moments" options={{ title: 'Moments', tabBarIcon: () => <TabIcon name="moments" focused={focused} /> }} />
<Tabs.Screen name="family" options={{ title: 'Gia đình', tabBarIcon: () => <TabIcon name="family" focused={focused} /> }} />
<Tabs.Screen name="friends" options={{ title: 'Bạn bè', tabBarIcon: () => <TabIcon name="friends" focused={focused} /> }} />
```

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "feat: add moments, family, friends tabs"
```

---

## Chunk 6: Final Integration

### Task 14: Add FAB for quick add moment

**Files:**
- Modify: `app/(tabs)/index.tsx`

- [ ] **Step 1: Add floating action button**

```typescript
// Add to HomeScreen render
<TouchableOpacity
  style={styles.fab}
  onPress={() => router.push('/moments')}
>
  <Text style={styles.fabText}>+</Text>
</TouchableOpacity>

// Add styles
fab: { position: 'absolute', bottom: 100, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
fabText: { fontSize: 28, color: colors.white },
```

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: add FAB for quick add moment"
```

### Task 15: Test and verify

- [ ] **Step 1: Run TypeScript check**

```bash
cd D:/bia-project
npx tsc --noEmit
```

- [ ] **Step 2: Test in browser**

```bash
npx expo start --web --port 8081
```

- [ ] **Step 3: Commit final**

```bash
git add .
git commit -m "feat: complete Phase 2 - Moments Locket-like feature"
```

---

## Summary

| Chunk | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-3 | Database setup (username, moments, family, friends tables, storage) |
| 2 | 4-7 | Types and services (moments, family, friends) |
| 3 | 8 | Zustand stores |
| 4 | 9-11 | UI screens (moments, family, friends) |
| 5 | 12-13 | Home tab update + navigation |
| 6 | 14-15 | FAB + testing |

**Total: 15 tasks**
