import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedingForm } from '../../src/components/tracking/FeedingForm';
import { GrowthForm } from '../../src/components/tracking/GrowthForm';
import { MilestoneForm } from '../../src/components/tracking/MilestoneForm';
import { VaccinationForm } from '../../src/components/tracking/VaccinationForm';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';
import { typography } from '../../src/constants/typography';

type TabType = 'feeding' | 'growth' | 'milestone' | 'vaccination';

interface TabConfig {
  key: TabType;
  label: string;
  icon: string;
  iconColor: string;
}

const TABS: TabConfig[] = [
  { key: 'feeding', label: 'Sữa/Ăn', icon: 'water', iconColor: colors.secondary },
  { key: 'growth', label: 'Cao/Cân', icon: 'resize', iconColor: colors.info },
  { key: 'milestone', label: 'Mốc', icon: 'flag', iconColor: colors.accent },
  { key: 'vaccination', label: 'Tiêm', icon: 'medical', iconColor: colors.primary },
];

export default function TrackingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('feeding');

  const renderForm = () => {
    switch (activeTab) {
      case 'feeding':
        return <FeedingForm />;
      case 'growth':
        return <GrowthForm />;
      case 'milestone':
        return <MilestoneForm />;
      case 'vaccination':
        return <VaccinationForm />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thêm mới</Text>
        <Text style={styles.subtitle}>Ghi lại hoạt động của bé</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              title={tab.label}
              variant={isActive ? 'primary' : 'outline'}
              size="small"
              onPress={() => setActiveTab(tab.key)}
              style={styles.tab}
              textStyle={isActive ? styles.tabTextActive : styles.tabText}
            >
              <View style={styles.tabContent}>
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? colors.white : colors.primary}
                />
                <Text style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}>
                  {tab.label}
                </Text>
              </View>
            </Button>
          );
        })}
      </ScrollView>
      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    ...typography.displayMedium,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textLight,
    marginTop: 4,
  },
  tabsContainer: {
    maxHeight: 52,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 10,
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabTextActive: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  tabText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.white,
  },
  tabLabelInactive: {
    color: colors.primary,
  },
  formContainer: {
    flex: 1,
    marginTop: 16,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
});
