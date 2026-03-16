import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { friendService } from '../src/services/friends';
import { Button } from '../src/components/common/Button';
import { colors } from '../src/constants/colors';
import type { Friendship } from '../src/types';

interface ExtendedFriendship extends Friendship {
  friend_name?: string;
  friend_avatar?: string;
  friend_username?: string;
  user_name?: string;
  user_avatar?: string;
  user_username?: string;
  id: string;
}

export default function FriendsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<ExtendedFriendship[]>([]);
  const [requests, setRequests] = useState<ExtendedFriendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{id: string; username: string; full_name: string; avatar_url: string}[]>([]);
  const [searching, setSearching] = useState(false);
  const [tab, setTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        friendService.getFriends(user.id),
        friendService.getPendingRequests(user.id),
      ]);
      setFriends(friendsData);
      setRequests(requestsData);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await friendService.searchUsers(searchQuery.trim());
      setSearchResults(results.filter(r => r.id !== user?.id));
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setSearching(false);
  };

  const handleSendRequest = async (username: string) => {
    if (!user) return;
    try {
      await friendService.sendRequest(user.id, username);
      Alert.alert('Thành công', 'Đã gửi lời mời kết bạn!');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await friendService.acceptRequest(requestId);
      const acceptedRequest = requests.find(r => r.id === requestId);
      if (acceptedRequest) {
        setFriends([...friends, { ...acceptedRequest, status: 'accepted' } as ExtendedFriendship]);
      }
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await friendService.rejectRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn hủy kết bạn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Hủy kết bạn',
        style: 'destructive',
        onPress: async () => {
          try {
            await friendService.removeFriend(friendshipId);
            setFriends(friends.filter(f => f.id !== friendshipId));
          } catch (error) {
            Alert.alert('Lỗi', (error as Error).message);
          }
        },
      },
    ]);
  };

  const renderFriend = ({ item }: { item: ExtendedFriendship }) => {
    const name = item.friend_name || item.friend_username || 'Unknown';
    return (
      <View style={styles.friendRow}>
        <View style={styles.friendInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View>
            <Text style={styles.friendName}>{name}</Text>
            {item.friend_username && <Text style={styles.friendUsername}>@{item.friend_username}</Text>}
          </View>
        </View>
        <TouchableOpacity onPress={() => handleRemoveFriend(item.id)}>
          <Text style={styles.removeBtn}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRequest = ({ item }: { item: ExtendedFriendship }) => {
    const name = item.user_name || item.user_username || 'Unknown';
    return (
      <View style={styles.friendRow}>
        <View style={styles.friendInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0]?.toUpperCase() || '?'}</Text>
          </View>
          <View>
            <Text style={styles.friendName}>{name}</Text>
            {item.user_username && <Text style={styles.friendUsername}>@{item.user_username}</Text>}
          </View>
        </View>
        <View style={styles.requestButtons}>
          <TouchableOpacity
            style={[styles.requestBtn, styles.acceptBtn]}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Text style={styles.requestBtnText}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.requestBtn, styles.rejectBtn]}
            onPress={() => handleRejectRequest(item.id)}
          >
            <Text style={styles.requestBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bạn bè</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bạn bè (username)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <Button title="Tìm" onPress={handleSearch} disabled={searching || !searchQuery.trim()} />
        </View>
        {searchResults.length > 0 && (
          <View style={styles.searchResults}>
            {searchResults.map((result) => (
              <View key={result.id} style={styles.searchResultRow}>
                <View style={styles.friendInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{result.full_name?.[0]?.toUpperCase() || result.username[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View>
                    <Text style={styles.friendName}>{result.full_name || result.username}</Text>
                    <Text style={styles.friendUsername}>@{result.username}</Text>
                  </View>
                </View>
                <Button title="Kết bạn" onPress={() => handleSendRequest(result.username)} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'friends' && styles.tabActive]}
          onPress={() => setTab('friends')}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextActive]}>
            Bạn bè ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'requests' && styles.tabActive]}
          onPress={() => setTab('requests')}
        >
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>
            Lời mời ({requests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Chưa có bạn bè</Text>
            <Text style={styles.emptySubtext}>Tìm kiếm bạn bè bằng username</Text>
          </View>
        ) : (
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={renderFriend}
            contentContainerStyle={styles.list}
          />
        )
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Không có lời mời nào</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequest}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
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
  backButton: { fontSize: 24, color: colors.text },
  title: { fontSize: 20, fontWeight: '600' },
  searchSection: { padding: 16, paddingTop: 0 },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  searchResults: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textMuted },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: colors.textMuted },
  emptySubtext: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  friendInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontWeight: '600', fontSize: 18 },
  friendName: { fontSize: 16, fontWeight: '500' },
  friendUsername: { fontSize: 12, color: colors.textMuted },
  removeBtn: { fontSize: 18, color: colors.error },
  requestButtons: { flexDirection: 'row', gap: 8 },
  requestBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { backgroundColor: colors.success },
  rejectBtn: { backgroundColor: colors.error },
  requestBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
