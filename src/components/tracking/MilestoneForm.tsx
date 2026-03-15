import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { colors } from '../../constants/colors';

type MilestoneType = 'teeth' | 'crawl' | 'walk' | 'talk' | 'roll' | 'sit';

const MILESTONE_TYPES: { key: MilestoneType; label: string; emoji: string }[] = [
  { key: 'teeth', label: '🦷 Mọc răng', emoji: '🦷' },
  { key: 'crawl', label: '🐛 Biết bò', emoji: '🐛' },
  { key: 'walk', label: '🚶 Biết đi', emoji: '🚶' },
  { key: 'talk', label: '🗣️ Biết nói', emoji: '🗣️' },
  { key: 'roll', label: '🔄 Lăn', emoji: '🔄' },
  { key: 'sit', label: '🪑 Biết ngồi', emoji: '🪑' },
];

export function MilestoneForm() {
  const [milestoneType, setMilestoneType] = useState<MilestoneType | ''>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedChild } = useChildStore();

  const handleSubmit = async () => {
    if (!selectedChild || !milestoneType) return;
    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'milestone',
        {
          milestone_type: milestoneType,
          description,
        },
        description
      );
      setMilestoneType('');
      setDescription('');
      alert('Đã lưu thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.label}>Chọn mốc phát triển</Text>
        <View style={styles.typeGrid}>
          {MILESTONE_TYPES.map((m) => (
            <Button
              key={m.key}
              title={`${m.emoji} ${m.label}`}
              variant={milestoneType === m.key ? 'primary' : 'outline'}
              onPress={() => setMilestoneType(m.key)}
              style={styles.typeButton}
            />
          ))}
        </View>
        <Input
          label="Mô tả thêm"
          placeholder="Ngày bé bắt đầu..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Button
          title="💾 Lưu"
          onPress={handleSubmit}
          loading={loading}
          disabled={!milestoneType}
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { margin: 16 },
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeButton: { width: '47%' },
  submitButton: { marginTop: 16 },
});
