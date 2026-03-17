import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Avatar } from '../../src/components/common/Avatar';
import { colors } from '../../src/constants/colors';
import { differenceInMonths } from 'date-fns';
import { trackingService } from '../../src/services/tracking';
import { vaccineService } from '../../src/services/vaccineSchedule';

interface GrowthData {
  height_cm: number;
  weight_kg: number;
  head_circumference_cm?: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuthStore();
  const { children, selectedChild, fetchChildren, isLoading } = useChildStore();

  const [growthData, setGrowthData] = useState<GrowthData | null>(null);
  const [loadingGrowth, setLoadingGrowth] = useState(false);
  const [nextVaccine, setNextVaccine] = useState<{ item: any; scheduledDate: Date; daysUntil: number } | null>(null);
  const [loadingVaccine, setLoadingVaccine] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChildren(user.id);
    }
  }, [user, fetchChildren]);

  // Fetch growth data when child changes
  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!selectedChild) return;
      setLoadingGrowth(true);
      try {
        // Try to get current month data first
        const currentMonthData = await trackingService.getCurrentMonthGrowth(selectedChild.id);
        if (currentMonthData) {
          setGrowthData(currentMonthData.data as GrowthData);
        } else {
          // Fallback to latest data
          const latestData = await trackingService.getLatestGrowth(selectedChild.id);
          if (latestData) {
            setGrowthData(latestData.data as GrowthData);
          }
        }
      } catch (error) {
        console.error('Error fetching growth data:', error);
      }
      setLoadingGrowth(false);
    };

    fetchGrowthData();
  }, [selectedChild?.id]);

  // Fetch next vaccine when child changes
  useEffect(() => {
    const fetchVaccineData = async () => {
      if (!selectedChild) return;
      setLoadingVaccine(true);
      try {
        const vaccinatedList = await trackingService.getVaccinatedList(selectedChild.id);
        const birthDate = new Date(selectedChild.birth_date);
        const next = vaccineService.getNextVaccine(birthDate, vaccinatedList);
        setNextVaccine(next);
      } catch (error) {
        console.error('Error fetching vaccine data:', error);
      }
      setLoadingVaccine(false);
    };

    fetchVaccineData();
  }, [selectedChild?.id]);

  const handleRefresh = useCallback(() => {
    if (user) {
      fetchChildren(user.id);
    }
  }, [user, fetchChildren]);

  const calculateAge = useCallback((birthDate: string) => {
    const months = differenceInMonths(new Date(), new Date(birthDate));
    if (months < 12) {
      return `${months} tháng tuổi`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} tuổi ${remainingMonths} tháng`;
  }, []);

  const childAge = useMemo(() => {
    if (!selectedChild) return null;
    return calculateAge(selectedChild.birth_date);
  }, [selectedChild, calculateAge]);

  const greeting = useMemo(() => {
    return `Xin chào, ${profile?.full_name || 'Mẹ/Bố'}!`;
  }, [profile?.full_name]);

  const handleSelectChild = useCallback((child: typeof selectedChild) => {
    useChildStore.getState().setSelectedChild(child);
  }, []);

  const handleGoToProfile = useCallback(() => router.push('/(tabs)/profile'), []);
  const handleGoToTracking = useCallback(() => router.push('/(tabs)/tracking'), []);
  const handleGoToAI = useCallback(() => router.push('/feature/ai'), []);
  const handleGoToTimeslice = useCallback(() => router.push('/feature/timeslice'), []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: 60 + insets.top }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          {selectedChild ? (
            <Text style={styles.childName}>Theo dõi bé {selectedChild.name}</Text>
          ) : null}
        </View>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name || ''} size={48} />
      </View>

      {selectedChild ? (
        <Card style={styles.childCard}>
          <View style={styles.childHeader}>
            <Avatar uri={selectedChild.photo_url} name={selectedChild.name} size={64} />
            <View style={styles.childInfo}>
              <Text style={styles.childNameLarge}>{selectedChild.name}</Text>
              <Text style={styles.childAge}>{childAge}</Text>
            </View>
          </View>

          {children.length > 1 && (
            <View style={styles.childSelector}>
              {children.map((child) => (
                <Pressable
                  key={child.id}
                  style={({ pressed }) => [
                    styles.childChip,
                    selectedChild.id === child.id && styles.childChipActive,
                    { opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={() => handleSelectChild(child)}
                >
                  <Text
                    style={[
                      styles.childChipText,
                      selectedChild.id === child.id && styles.childChipTextActive,
                    ]}
                  >
                    {child.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyTitle}>Chưa có bé nào</Text>
          <Text style={styles.emptyText}>Thêm bé để bắt đầu theo dõi</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={handleGoToProfile}
          >
            <Text style={styles.addButtonText}>+ Thêm bé</Text>
          </Pressable>
        </Card>
      )}

      <Text style={styles.sectionTitle}>Hành động nhanh</Text>
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={handleGoToTracking}
        >
          <Text style={styles.actionIcon}>🍼</Text>
          <Text style={styles.actionText}>Thêm bữa ăn</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={handleGoToTimeslice}
        >
          <Text style={styles.actionIcon}>🎬</Text>
          <Text style={styles.actionText}>Tạo Video</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            { opacity: pressed ? 0.8 : 1 }
          ]}
          onPress={handleGoToAI}
        >
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionText}>Phân tích AI</Text>
        </Pressable>
      </View>

      {/* Growth Card */}
      <Card style={styles.growthCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>📈 Tăng trưởng tháng này</Text>
          <Text style={styles.seeAll} onPress={handleGoToTracking}>Xem chi tiết</Text>
        </View>
        {loadingGrowth ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : growthData ? (
          <View style={styles.growthStats}>
            <View style={styles.growthStat}>
              <Text style={styles.growthValue}>{growthData.height_cm} cm</Text>
              <Text style={styles.growthLabel}>Chiều cao</Text>
            </View>
            <View style={styles.growthDivider} />
            <View style={styles.growthStat}>
              <Text style={styles.growthValue}>{growthData.weight_kg} kg</Text>
              <Text style={styles.growthLabel}>Cân nặng</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noData}>
            <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
            <Text style={styles.noDataSubtext}>Cập nhật ngay tại mục Cao/Cân</Text>
          </View>
        )}
      </Card>

      {/* Vaccine Card */}
      <Card style={styles.vaccineCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💉 Vaccine sắp tới</Text>
          <Text style={styles.seeAll} onPress={handleGoToTracking}>Xem lịch</Text>
        </View>
        {loadingVaccine ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : nextVaccine ? (
          <View style={styles.vaccineInfo}>
            <View style={styles.vaccineItem}>
              <Text style={styles.vaccineName}>{nextVaccine.item.vaccines.join(', ')}</Text>
              <Text style={styles.vaccineDate}>
                {vaccineService.formatDate(nextVaccine.scheduledDate)}
              </Text>
              <Text style={[
                styles.vaccineStatus,
                nextVaccine.daysUntil <= 0 && styles.vaccineStatusUrgent,
                nextVaccine.daysUntil <= 7 && nextVaccine.daysUntil > 0 && styles.vaccineStatusSoon,
              ]}>
                {vaccineService.getStatusText(nextVaccine.daysUntil)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.vaccineText}>✅ Đã tiêm đầy đủ theo lịch!</Text>
        )}
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
  noData: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  noDataSubtext: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  vaccineInfo: {
    alignItems: 'center',
  },
  vaccineItem: {
    alignItems: 'center',
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  vaccineDate: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
  vaccineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  vaccineStatusUrgent: {
    color: colors.error,
  },
  vaccineStatusSoon: {
    color: colors.warning,
  },
  vaccineText: {
    fontSize: 14,
    color: colors.success,
    textAlign: 'center',
  },
});
