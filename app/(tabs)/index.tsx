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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Avatar } from '../../src/components/common/Avatar';
import { colors } from '../../src/constants/colors';
import { typography } from '../../src/constants/typography';
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

  useEffect(() => {
    const fetchGrowthData = async () => {
      if (!selectedChild) return;
      setLoadingGrowth(true);
      try {
        const currentMonthData = await trackingService.getCurrentMonthGrowth(selectedChild.id);
        if (currentMonthData) {
          setGrowthData(currentMonthData.data as GrowthData);
        } else {
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          {selectedChild ? (
            <Text style={styles.childName}>Theo dõi bé {selectedChild.name}</Text>
          ) : null}
        </View>
        <Avatar uri={profile?.avatar_url} name={profile?.full_name || ''} size={48} />
      </View>

      {/* Child Card */}
      {selectedChild ? (
        <Card style={styles.childCard} variant="elevated">
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
                    pressed && styles.chipPressed,
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
        <Card style={styles.emptyCard} variant="elevated">
          <View style={styles.emptyIconBg}>
            <Ionicons name="person" size={40} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có bé nào</Text>
          <Text style={styles.emptyText}>Thêm bé để bắt đầu theo dõi</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={handleGoToProfile}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Thêm bé</Text>
          </Pressable>
        </Card>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Hành động nhanh</Text>
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={handleGoToTracking}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="water" size={24} color={colors.secondary} />
          </View>
          <Text style={styles.actionText}>Thêm bữa ăn</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={handleGoToTimeslice}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="videocam" size={24} color={colors.primary} />
          </View>
          <Text style={styles.actionText}>Tạo Video</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={handleGoToAI}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="bulb" size={24} color={colors.accentDark} />
          </View>
          <Text style={styles.actionText}>Phân tích AI</Text>
        </Pressable>
      </View>

      {/* Growth Card */}
      <Card style={styles.statsCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.cardIconBg, { backgroundColor: colors.secondary + '15' }]}>
              <Ionicons name="trending-up" size={18} color={colors.secondary} />
            </View>
            <Text style={styles.cardTitle}>Tăng trưởng tháng này</Text>
          </View>
          <Pressable onPress={handleGoToTracking}>
            <Text style={styles.seeAll}>Xem chi tiết</Text>
          </Pressable>
        </View>
        {loadingGrowth ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : growthData ? (
          <View style={styles.growthStats}>
            <View style={styles.growthStat}>
              <Text style={styles.growthValue}>{growthData.height_cm}</Text>
              <Text style={styles.growthLabel}>cm</Text>
              <Text style={styles.growthUnit}>Chiều cao</Text>
            </View>
            <View style={styles.growthDivider} />
            <View style={styles.growthStat}>
              <Text style={styles.growthValue}>{growthData.weight_kg}</Text>
              <Text style={styles.growthLabel}>kg</Text>
              <Text style={styles.growthUnit}>Cân nặng</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noData}>
            <Ionicons name="add-circle-outline" size={32} color={colors.textMuted} />
            <Text style={styles.noDataText}>Chưa có dữ liệu</Text>
            <Text style={styles.noDataSubtext}>Cập nhật tại mục Cao/Cân</Text>
          </View>
        )}
      </Card>

      {/* Vaccine Card */}
      <Card style={styles.statsCard} variant="elevated">
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <View style={[styles.cardIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="medical" size={18} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Vaccine sắp tới</Text>
          </View>
          <Pressable onPress={handleGoToTracking}>
            <Text style={styles.seeAll}>Xem lịch</Text>
          </Pressable>
        </View>
        {loadingVaccine ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : nextVaccine ? (
          <View style={styles.vaccineInfo}>
            <Text style={styles.vaccineName}>{nextVaccine.item.vaccines.join(', ')}</Text>
            <Text style={styles.vaccineDate}>
              {vaccineService.formatDate(nextVaccine.scheduledDate)}
            </Text>
            <View style={[
              styles.vaccineBadge,
              nextVaccine.daysUntil <= 0 && styles.vaccineBadgeUrgent,
              nextVaccine.daysUntil <= 7 && nextVaccine.daysUntil > 0 && styles.vaccineBadgeSoon,
            ]}>
              <Text style={[
                styles.vaccineBadgeText,
                nextVaccine.daysUntil <= 0 && styles.vaccineBadgeTextUrgent,
                nextVaccine.daysUntil <= 7 && nextVaccine.daysUntil > 0 && styles.vaccineBadgeTextSoon,
              ]}>
                {vaccineService.getStatusText(nextVaccine.daysUntil)}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.vaccineComplete}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.vaccineCompleteText}>Đã tiêm đầy đủ theo lịch!</Text>
          </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    ...typography.bodyMedium,
    color: colors.textLight,
  },
  childName: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
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
    ...typography.headline,
    color: colors.text,
  },
  childAge: {
    ...typography.bodyMedium,
    color: colors.textLight,
    marginTop: 4,
  },
  childSelector: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: 10,
  },
  childChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPressed: {
    opacity: 0.8,
  },
  childChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  childChipText: {
    ...typography.bodySmall,
    color: colors.textLight,
    fontWeight: '500',
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
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.headlineSmall,
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textLight,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 8,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    ...typography.button,
    color: colors.white,
  },
  sectionTitle: {
    ...typography.headlineSmall,
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
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  statsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
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
    ...typography.displayMedium,
    color: colors.text,
    fontWeight: '700',
  },
  growthLabel: {
    ...typography.labelSmall,
    color: colors.textLight,
    marginTop: -4,
  },
  growthUnit: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 4,
  },
  growthDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.divider,
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  noDataText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  noDataSubtext: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  vaccineInfo: {
    alignItems: 'center',
    gap: 6,
  },
  vaccineName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  vaccineDate: {
    ...typography.bodyMedium,
    color: colors.textLight,
  },
  vaccineBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.background,
    marginTop: 4,
  },
  vaccineBadgeUrgent: {
    backgroundColor: colors.error + '20',
  },
  vaccineBadgeSoon: {
    backgroundColor: colors.warning + '20',
  },
  vaccineBadgeText: {
    ...typography.labelSmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  vaccineBadgeTextUrgent: {
    color: colors.error,
  },
  vaccineBadgeTextSoon: {
    color: colors.accentDark,
  },
  vaccineComplete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  vaccineCompleteText: {
    ...typography.bodyMedium,
    color: colors.success,
    fontWeight: '500',
  },
});
