import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FeedingForm } from '../../src/components/tracking/FeedingForm';
import { GrowthForm } from '../../src/components/tracking/GrowthForm';
import { MilestoneForm } from '../../src/components/tracking/MilestoneForm';
import { VaccinationForm } from '../../src/components/tracking/VaccinationForm';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';

type TabType = 'feeding' | 'growth' | 'milestone' | 'vaccination';

const TABS: { key: TabType; label: string; emoji: string }[] = [
  { key: 'feeding', label: 'Sữa/Ăn', emoji: '🍼' },
  { key: 'growth', label: 'Cao/Cân', emoji: '📏' },
  { key: 'milestone', label: 'Mốc', emoji: '🎯' },
  { key: 'vaccination', label: 'Tiêm', emoji: '💉' },
];

export default function TrackingScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('feeding');

  const renderForm = () => {
    switch (activeTab) {
      case 'feeding': return <FeedingForm />;
      case 'growth': return <GrowthForm />;
      case 'milestone': return <MilestoneForm />;
      case 'vaccination': return <VaccinationForm />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>➕ Thêm mới</Text>
      </View>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            title={`${tab.emoji} ${tab.label}`}
            variant={activeTab === tab.key ? 'primary' : 'ghost'}
            size="small"
            onPress={() => setActiveTab(tab.key)}
            style={styles.tab}
          />
        ))}
      </View>
      {renderForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 50 },
  header: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { flex: 1 },
});
