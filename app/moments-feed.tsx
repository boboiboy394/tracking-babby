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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMomentStore } from '../src/stores/momentStore';
import { colors } from '../src/constants/colors';
import type { Moment } from '../src/types';

const { width, height } = Dimensions.get('window');

export default function MomentsFeedScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { moments, currentIndex, isLoading, fetchFeed, nextMoment, prevMoment } = useMomentStore();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleLongPress = () => {
    // Show options menu on long press - could navigate to detail
  };

  const renderMoment = ({ item }: { item: Moment }) => (
    <TouchableOpacity
      style={styles.momentContainer}
      activeOpacity={0.9}
      onLongPress={handleLongPress}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.child_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={styles.childName}>{item.child_name || 'Baby'}</Text>
              {item.user_name && (
                <Text style={styles.userName}>by {item.user_name}</Text>
              )}
            </View>
          </View>
          {item.caption && (
            <Text style={styles.caption} numberOfLines={2}>
              {item.caption}
            </Text>
          )}
        </View>
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

  if (moments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có khoảnh khắc nào</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/moments')}
        >
          <Text style={styles.addButtonText}>+ Thêm khoảnh khắc</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        renderItem={renderMoment}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Center Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => router.push('/moments')}
      >
        <Text style={styles.menuButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 },
  emptyText: { fontSize: 18, color: colors.textMuted, marginBottom: 20 },
  addButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  addButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  momentContainer: { width, height: height - 80 },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, paddingTop: 50 },
  closeButton: { fontSize: 24, color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  bottomBar: { padding: 20, paddingBottom: 100, justifyContent: 'flex-end' },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: '600', color: colors.primary },
  childName: { fontSize: 18, fontWeight: '600', color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  userName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  caption: { fontSize: 16, color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  menuButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuButtonText: { fontSize: 32, color: colors.white, fontWeight: '300' },
});
