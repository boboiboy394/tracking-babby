import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { colors } from '../../constants/colors';

export function GrowthForm() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [head, setHead] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedChild } = useChildStore();

  const handleSubmit = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'growth',
        {
          height_cm: parseFloat(height),
          weight_kg: parseFloat(weight),
          head_circumference_cm: head ? parseFloat(head) : undefined,
        },
        notes
      );
      setHeight('');
      setWeight('');
      setHead('');
      setNotes('');
      alert('Đã lưu thành công!');
    } catch (error) {
      alert('Lỗi: ' + (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Input
          label="Chiều cao (cm)"
          placeholder="75"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
        <Input
          label="Cân nặng (kg)"
          placeholder="10.5"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />
        <Input
          label="Vòng đầu (cm) - tùy chọn"
          placeholder="45"
          value={head}
          onChangeText={setHead}
          keyboardType="numeric"
        />
        <Input
          label="Ghi chú"
          placeholder="..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button
          title="💾 Lưu"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { margin: 16 },
  submitButton: { marginTop: 16 },
});
