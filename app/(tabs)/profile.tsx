import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Avatar } from '../../src/components/common/Avatar';
import { Input } from '../../src/components/common/Input';
import { colors } from '../../src/constants/colors';
import { typography } from '../../src/constants/typography';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, profile, logout } = useAuthStore();
  const { children, addChild, deleteChild, selectedChild } = useChildStore();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);

  const handleAddChild = useCallback(async () => {
    if (!newChildName || !newChildBirthDate) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await addChild({
        name: newChildName,
        birth_date: newChildBirthDate,
        gender: newChildGender,
        photo_url: null,
        clinic_id: null,
      });
      setShowAddChild(false);
      setNewChildName('');
      setNewChildBirthDate('');
      Alert.alert('Thành công', 'Đã thêm bé!');
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  }, [newChildName, newChildBirthDate, newChildGender, addChild]);

  const handleDeleteChild = useCallback((childId: string) => {
    Alert.alert(
      'Xóa bé',
      'Bạn có chắc muốn xóa? Tất cả dữ liệu theo dõi sẽ bị mất.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteChild(childId),
        },
      ]
    );
  }, [deleteChild]);

  const handleLogout = useCallback(() => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: logout },
    ]);
  }, [logout]);

  const handleGoToFamily = useCallback(() => router.push('/family' as any), [router]);
  const handleGoToFriends = useCallback(() => router.push('/friends' as any), [router]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: 60 + insets.top, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Hồ sơ</Text>

      {/* User Card */}
      <Card style={styles.userCard} variant="elevated">
        <View style={styles.userInfo}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name || ''} size={64} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{profile?.full_name || 'Mẹ/Bố'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <Pressable style={({ pressed }) => [
            styles.editButton,
            pressed && styles.editButtonPressed,
          ]}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </Pressable>
        </View>
      </Card>

      {/* Children Section */}
      <Text style={styles.sectionTitle}>Danh sách bé</Text>
      {children.map((child) => (
        <Card key={child.id} style={styles.childCard} variant="elevated">
          <View style={styles.childRow}>
            <Avatar uri={child.photo_url} name={child.name} size={52} />
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.name}</Text>
              <View style={styles.childMeta}>
                <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                <Text style={styles.childBirth}> Sinh ngày: {child.birth_date}</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
              ]}
              onPress={() => handleDeleteChild(child.id)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </Pressable>
          </View>
        </Card>
      ))}

      {showAddChild ? (
        <Card style={styles.addCard} variant="elevated">
          <Input
            label="Tên bé"
            placeholder="Nguyễn Văn A"
            value={newChildName}
            onChangeText={setNewChildName}
          />
          <Input
            label="Ngày sinh"
            placeholder="2024-01-15"
            value={newChildBirthDate}
            onChangeText={setNewChildBirthDate}
            helper="Định dạng: YYYY-MM-DD"
          />
          <View style={styles.genderSelector}>
            <Pressable
              style={({ pressed }) => [
                styles.genderOption,
                newChildGender === 'male' && styles.genderOptionActive,
                pressed && styles.genderOptionPressed,
              ]}
              onPress={() => setNewChildGender('male')}
            >
              <Ionicons
                name="male"
                size={20}
                color={newChildGender === 'male' ? colors.white : colors.info}
              />
              <Text style={[
                styles.genderText,
                newChildGender === 'male' && styles.genderTextActive,
              ]}>Bé trai</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.genderOption,
                newChildGender === 'female' && styles.genderOptionActive,
                pressed && styles.genderOptionPressed,
              ]}
              onPress={() => setNewChildGender('female')}
            >
              <Ionicons
                name="female"
                size={20}
                color={newChildGender === 'female' ? colors.white : colors.primary}
              />
              <Text style={[
                styles.genderText,
                newChildGender === 'female' && styles.genderTextActive,
              ]}>Bé gái</Text>
            </Pressable>
          </View>
          <View style={styles.addActions}>
            <Button
              title="Hủy"
              variant="ghost"
              onPress={() => setShowAddChild(false)}
            />
            <Button
              title="Thêm bé"
              onPress={handleAddChild}
              loading={loading}
            />
          </View>
        </Card>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={() => setShowAddChild(true)}
        >
          <Ionicons name="add-circle" size={22} color={colors.primary} />
          <Text style={styles.addButtonText}>Thêm bé</Text>
        </Pressable>
      )}

      {/* Family & Friends */}
      <Text style={styles.sectionTitle}>Gia đình & Bạn bè</Text>
      <Card style={styles.settingsCard} variant="outlined">
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            pressed && styles.settingRowPressed,
          ]}
          onPress={handleGoToFamily}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="people" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.settingText}>Gia đình</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <View style={styles.settingDivider} />
        <Pressable
          style={({ pressed }) => [
            styles.settingRow,
            pressed && styles.settingRowPressed,
          ]}
          onPress={handleGoToFriends}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="heart" size={20} color={colors.accentDark} />
            </View>
            <Text style={styles.settingText}>Bạn bè</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </Card>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Cài đặt</Text>
      <Card style={styles.settingsCard} variant="outlined">
        <Pressable style={({ pressed }) => [
          styles.settingRow,
          pressed && styles.settingRowPressed,
        ]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.info + '20' }]}>
              <Ionicons name="notifications" size={20} color={colors.info} />
            </View>
            <Text style={styles.settingText}>Thông báo</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <View style={styles.settingDivider} />
        <Pressable style={({ pressed }) => [
          styles.settingRow,
          pressed && styles.settingRowPressed,
        ]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.settingText}>Bảo mật</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
        <View style={styles.settingDivider} />
        <Pressable style={({ pressed }) => [
          styles.settingRow,
          pressed && styles.settingRowPressed,
        ]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="help-circle" size={20} color={colors.primary} />
            </View>
            <Text style={styles.settingText}>Trợ giúp</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </Card>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      <Text style={styles.version}>Baby Tracker v1.0.0</Text>
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
  },
  title: {
    ...typography.displayMedium,
    color: colors.text,
    marginBottom: 24,
  },
  userCard: {
    marginBottom: 28,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    ...typography.headline,
    color: colors.text,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: 4,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  sectionTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    marginBottom: 14,
  },
  childCard: {
    marginBottom: 12,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
    marginLeft: 14,
  },
  childName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  childMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  childBirth: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginLeft: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  addCard: {
    marginBottom: 16,
  },
  genderSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  genderOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderOptionPressed: {
    opacity: 0.8,
  },
  genderText: {
    ...typography.buttonSmall,
    color: colors.text,
  },
  genderTextActive: {
    color: colors.white,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    marginBottom: 28,
  },
  addButtonPressed: {
    opacity: 0.8,
    backgroundColor: colors.primary + '10',
  },
  addButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  settingsCard: {
    marginBottom: 28,
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowPressed: {
    backgroundColor: colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    marginBottom: 20,
  },
  logoutButtonPressed: {
    opacity: 0.7,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
  version: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
  },
});
