import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useMomentStore } from '../../src/stores/momentStore';
import { colors } from '../../src/constants/colors';
import type { Moment } from '../../src/types';

const { width, height } = Dimensions.get('window');

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
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchFeed(user.id);
    setRefreshing(false);
  };

  const handleMomentPress = (moment: Moment) => {
    // Navigate to full-screen view
    router.push({
      pathname: '/moments-view',
      params: { momentId: moment.id },
    });
  };

  const handleLongPress = (momentId: string) => {
    setShowMenu(momentId);
  };

  const handleDelete = async (momentId: string) => {
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
  };

  const renderMoment = ({ item }: { item: Moment }) => (
    <TouchableOpacity
      style={styles.momentCard}
      onPress={() => handleMomentPress(item)}
      onLongPress={() => handleLongPress(item.id)}
    >
      <Image source={{ uri: item.image_url }} style={styles.momentImage} />
      <View style={styles.momentOverlay}>
        <Text style={styles.momentChildName}>{item.child_name || 'Baby'}</Text>
        {item.caption && (
          <Text style={styles.momentCaption} numberOfLines={1}>
            {item.caption}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && moments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Khoảnh khắc</Text>
        <TouchableOpacity onPress={() => router.push('/moments')}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {moments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>Chưa có khoảnh khắc nào</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/moments')}
          >
            <Text style={styles.createButtonText}>+ Thêm khoảnh khắc</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          renderItem={renderMoment}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  title: { fontSize: 24, fontWeight: '700' },
  addButton: { fontSize: 28, color: colors.primary },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: colors.textMuted, marginBottom: 20 },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  list: { padding: 8 },
  row: { justifyContent: 'space-between', paddingHorizontal: 8 },
  momentCard: {
    width: (width - 40) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  momentImage: { width: '100%', height: '100%' },
  momentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  momentChildName: { color: colors.white, fontSize: 14, fontWeight: '600' },
  momentCaption: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
});
