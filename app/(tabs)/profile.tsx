import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { Avatar } from '../../src/components/common/Avatar';
import { Input } from '../../src/components/common/Input';
import { colors } from '../../src/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, logout } = useAuthStore();
  const { children, addChild, deleteChild, selectedChild } = useChildStore();
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('');
  const [newChildGender, setNewChildGender] = useState<'male' | 'female'>('male');
  const [loading, setLoading] = useState(false);

  const handleAddChild = async () => {
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
  };

  const handleDeleteChild = (childId: string) => {
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
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>👤 Profile</Text>

      {/* User Info */}
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <Avatar uri={profile?.avatar_url} name={profile?.full_name || ''} size={64} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{profile?.full_name || 'Mẹ/Bố'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </Card>

      {/* Children List */}
      <Text style={styles.sectionTitle}>Danh sách bé</Text>
      {children.map((child) => (
        <Card key={child.id} style={styles.childCard}>
          <View style={styles.childRow}>
            <Avatar uri={child.photo_url} name={child.name} size={48} />
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childBirth}>
                Sinh ngày: {child.birth_date}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteChild(child.id)}>
              <Text style={styles.deleteButton}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {/* Add Child */}
      {showAddChild ? (
        <Card style={styles.addCard}>
          <Input
            label="Tên bé"
            placeholder="Nguyễn Văn A"
            value={newChildName}
            onChangeText={setNewChildName}
          />
          <Input
            label="Ngày sinh (YYYY-MM-DD)"
            placeholder="2024-01-15"
            value={newChildBirthDate}
            onChangeText={setNewChildBirthDate}
          />
          <View style={styles.genderSelector}>
            <Button
              title="👦 Bé trai"
              variant={newChildGender === 'male' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setNewChildGender('male')}
              style={styles.genderButton}
            />
            <Button
              title="👧 Bé gái"
              variant={newChildGender === 'female' ? 'primary' : 'outline'}
              size="small"
              onPress={() => setNewChildGender('female')}
              style={styles.genderButton}
            />
          </View>
          <View style={styles.addActions}>
            <Button
              title="Hủy"
              variant="ghost"
              onPress={() => setShowAddChild(false)}
            />
            <Button
              title="Thêm"
              onPress={handleAddChild}
              loading={loading}
            />
          </View>
        </Card>
      ) : (
        <Button
          title="➕ Thêm bé"
          variant="outline"
          onPress={() => setShowAddChild(true)}
          style={styles.addButton}
        />
      )}

      {/* Family & Friends */}
      <Text style={styles.sectionTitle}>Gia đình & Bạn bè</Text>
      <Card style={styles.settingsCard}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => router.push('/family')}
        >
          <Text style={styles.settingText}>👨‍👩‍👧‍👦 Gia đình</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => router.push('/friends')}
        >
          <Text style={styles.settingText}>👥 Bạn bè</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Cài đặt</Text>
      <Card style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>🔔 Thông báo</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>🔒 Bảo mật</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingRow}>
          <Text style={styles.settingText}>❓ Trợ giúp</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <Button
        title="Đăng xuất"
        variant="ghost"
        onPress={handleLogout}
        style={styles.logoutButton}
      />

      <Text style={styles.version}>Baby Tracker v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 20 },
  userCard: { marginBottom: 24 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  userDetails: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 18, fontWeight: '600', color: colors.text },
  userEmail: { fontSize: 14, color: colors.textLight, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  childCard: { marginBottom: 12 },
  childRow: { flexDirection: 'row', alignItems: 'center' },
  childInfo: { flex: 1, marginLeft: 12 },
  childName: { fontSize: 16, fontWeight: '600', color: colors.text },
  childBirth: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  deleteButton: { fontSize: 20, padding: 8 },
  addCard: { marginBottom: 16 },
  genderSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  genderButton: { flex: 1 },
  addActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  addButton: { marginBottom: 24 },
  settingsCard: { marginBottom: 24 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  settingText: { fontSize: 16, color: colors.text },
  settingArrow: { fontSize: 24, color: colors.textMuted },
  logoutButton: { marginBottom: 16 },
  version: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
});
