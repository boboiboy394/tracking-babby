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
import { familyService } from '../src/services/family';
import { Button } from '../src/components/common/Button';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/constants/colors';
import type { FamilyGroup, FamilyMember } from '../src/types';

export default function FamilyScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [groups, setGroups] = useState<FamilyGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<(FamilyMember & { user_name?: string; user_avatar?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [addMemberUsername, setAddMemberUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await familyService.getGroups(user.id);
      setGroups(data);
      if (data.length > 0 && !selectedGroup) {
        selectGroup(data[0]);
      }
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  const selectGroup = async (group: FamilyGroup) => {
    setSelectedGroup(group);
    try {
      const data = await familyService.getMembers(group.id);
      setMembers(data);
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    setSaving(true);
    try {
      const group = await familyService.createGroup(user.id, newGroupName.trim());
      setGroups([group, ...groups]);
      setSelectedGroup(group);
      setMembers([]);
      setShowCreateModal(false);
      setNewGroupName('');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setSaving(false);
  };

  const handleAddMember = async () => {
    if (!addMemberUsername.trim() || !selectedGroup) return;
    setSaving(true);
    try {
      const member = await familyService.addMember(selectedGroup.id, addMemberUsername.trim());
      setMembers([...members, member]);
      setAddMemberUsername('');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setSaving(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thành viên này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await familyService.removeMember(memberId);
            setMembers(members.filter(m => m.id !== memberId));
          } catch (error) {
            Alert.alert('Lỗi', (error as Error).message);
          }
        },
      },
    ]);
  };

  const renderMember = ({ item }: { item: FamilyMember & { user_name?: string; user_avatar?: string } }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user_name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View>
          <Text style={styles.memberName}>{item.user_name || 'Unknown'}</Text>
          <Text style={styles.memberRole}>{item.role === 'admin' ? 'Quản lý' : 'Thành viên'}</Text>
        </View>
      </View>
      {item.role !== 'admin' && (
        <TouchableOpacity onPress={() => handleRemoveMember(item.id)}>
          <Text style={styles.removeBtn}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gia đình</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : groups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có nhóm gia đình</Text>
          <Button title="Tạo nhóm mới" onPress={() => setShowCreateModal(true)} />
        </View>
      ) : (
        <>
          {/* Group Selector */}
          <FlatList
            horizontal
            data={groups}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            style={styles.groupList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.groupChip,
                  selectedGroup?.id === item.id && styles.groupChipActive,
                ]}
                onPress={() => selectGroup(item)}
              >
                <Text
                  style={[
                    styles.groupChipText,
                    selectedGroup?.id === item.id && styles.groupChipTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Members List */}
          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Thành viên ({members.length})</Text>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={renderMember}
              ListFooterComponent={
                <View style={styles.addMemberSection}>
                  <TextInput
                    style={styles.input}
                    placeholder="Thêm thành viên (username)"
                    value={addMemberUsername}
                    onChangeText={setAddMemberUsername}
                  />
                  <Button
                    title={saving ? '...' : 'Thêm'}
                    onPress={handleAddMember}
                    disabled={saving || !addMemberUsername.trim()}
                  />
                </View>
              }
            />
          </View>
        </>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tạo nhóm gia đình</Text>
            <TextInput
              style={styles.input}
              placeholder="Tên nhóm"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.modalButtons}>
              <Button title="Hủy" onPress={() => setShowCreateModal(false)} variant="secondary" />
              <Button title={saving ? '...' : 'Tạo'} onPress={handleCreateGroup} disabled={saving} />
            </View>
          </View>
        </View>
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
  addButton: { fontSize: 28, color: colors.primary },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: colors.textMuted, marginBottom: 16 },
  groupList: { maxHeight: 50, paddingHorizontal: 16 },
  groupChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  groupChipActive: { backgroundColor: colors.primary },
  groupChipText: { fontSize: 14 },
  groupChipTextActive: { color: colors.white },
  membersSection: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  memberName: { fontSize: 16, fontWeight: '500' },
  memberRole: { fontSize: 12, color: colors.textMuted },
  removeBtn: { fontSize: 18, color: colors.error },
  addMemberSection: { flexDirection: 'row', gap: 8, marginTop: 16 },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
});
