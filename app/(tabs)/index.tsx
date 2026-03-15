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
import { differenceInMonths } from 'date-fns';

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
