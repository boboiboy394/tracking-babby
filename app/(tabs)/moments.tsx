import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useMomentStore } from '../../src/stores/momentStore';
import { colors } from '../../src/constants/colors';
import { typography } from '../../src/constants/typography';
import type { Moment } from '../../src/types';

export default function MomentsTab() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { moments, isLoading, fetchFeed, removeMoment } = useMomentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchFeed(user.id);
    }
  }, [user, fetchFeed]);

  const onRefresh = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchFeed(user.id);
    setRefreshing(false);
  }, [user, fetchFeed]);

  const handleMomentPress = useCallback((moment: Moment) => {
    router.push({
      pathname: '/moments-view' as any,
      params: { momentId: moment.id },
    });
  }, [router]);

  const handleLongPress = useCallback((momentId: string) => {
    setShowMenu(momentId);
  }, []);

  const handleDelete = useCallback(async (momentId: string) => {
    setShowMenu(null);
    Alert.alert('Xóa khoảnh khắc', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await removeMoment(momentId);
        },
      },
    ]);
  }, [removeMoment]);

  const keyExtractor = useCallback((item: Moment) => item.id, []);

  const renderMoment = useCallback(({ item }: { item: Moment }) => (
    <Pressable
      style={({ pressed }) => [
        styles.momentCard,
        pressed && styles.momentCardPressed,
      ]}
      onPress={() => handleMomentPress(item)}
      onLongPress={() => handleLongPress(item.id)}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.momentImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.momentOverlay}>
        <Text style={styles.momentChildName}>{item.child_name || 'Baby'}</Text>
        {item.caption ? (
          <Text style={styles.momentCaption} numberOfLines={1}>
            {item.caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  ), [handleMomentPress, handleLongPress]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="camera-outline" size={48} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Chưa có khoảnh khắc nào</Text>
      <Text style={styles.emptyText}>Lưu giữ những khoảnh khắc đáng nhớ của bé</Text>
      <Pressable
        style={({ pressed }) => [
          styles.createButton,
          pressed && styles.createButtonPressed,
        ]}
        onPress={() => router.push('/moments' as any)}
      >
        <Ionicons name="add" size={20} color={colors.white} />
        <Text style={styles.createButtonText}>Thêm khoảnh khắc</Text>
      </Pressable>
    </View>
  ), [router]);

  const ListHeaderComponent = useMemo(() => (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Khoảnh khắc</Text>
        <Text style={styles.subtitle}>Những moment đáng nhớ</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
        onPress={() => router.push('/moments' as any)}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </Pressable>
    </View>
  ), [router]);

  if (isLoading && moments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moments}
        keyExtractor={keyExtractor}
        renderItem={renderMoment}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    ...typography.displayMedium,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textLight,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  createButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
  },
  list: {
    padding: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  momentCard: {
    width: '48%',
    aspectRatio: 0.85,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  momentCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  momentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  momentChildName: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  momentCaption: {
    ...typography.labelSmall,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});
