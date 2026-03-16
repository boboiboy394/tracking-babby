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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useMomentStore } from '../src/stores/momentStore';
import { colors } from '../src/constants/colors';
import type { Moment } from '../src/types';

const { width, height } = Dimensions.get('window');

export default function MomentsViewScreen() {
  const router = useRouter();
  const { momentId } = useLocalSearchParams<{ momentId: string }>();
  const { user } = useAuthStore();
  const { moments, isLoading, fetchFeed, removeMoment } = useMomentStore();

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user && moments.length === 0) {
      fetchFeed(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (momentId && moments.length > 0) {
      const index = moments.findIndex(m => m.id === momentId);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [momentId, moments]);

  const currentMoment = moments[currentIndex];

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / height);
    setCurrentIndex(index);
  };

  const handleDelete = () => {
    if (!currentMoment) return;
    Alert.alert('Xóa khoảnh khắc', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await removeMoment(currentMoment.id);
          router.back();
        },
      },
    ]);
  };

  const renderMoment = ({ item }: { item: Moment }) => (
    <View style={styles.momentContainer}>
      <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
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
          <Text style={styles.caption}>{item.caption}</Text>
        )}
      </View>
    </View>
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
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        renderItem={renderMoment}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialScrollIndex={momentId ? moments.findIndex(m => m.id === momentId) : 0}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  momentContainer: { width, height },
  image: { width: '100%', height: '100%' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  closeButton: { fontSize: 24, color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  deleteButton: { fontSize: 24 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 50,
  },
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
  childName: { fontSize: 20, fontWeight: '600', color: colors.white, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  userName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 2 },
  caption: { fontSize: 16, color: colors.white, marginTop: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
});
