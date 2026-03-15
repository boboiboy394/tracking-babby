import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { colors } from '../../constants/colors';

type FeedingType = 'milk' | 'porridge' | 'solid';

export function FeedingForm() {
  const [type, setType] = useState<FeedingType>('milk');
  const [amount, setAmount] = useState('');
  const [times, setTimes] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedChild } = useChildStore();

  const handleSubmit = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'feeding',
        {
          type,
          amount_ml: type === 'milk' ? parseInt(amount) : undefined,
          times: parseInt(times),
        },
        notes
      );
      setAmount('');
      setTimes('1');
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
        <Text style={styles.label}>Loại thức ăn</Text>
        <View style={styles.typeSelector}>
          {(['milk', 'porridge', 'solid'] as FeedingType[]).map((t) => (
            <Button
              key={t}
              title={t === 'milk' ? '🍼 Sữa' : t === 'porridge' ? '🍲 Cháo' : '🍚 Ăn cơm'}
              variant={type === t ? 'primary' : 'outline'}
              onPress={() => setType(t)}
              style={styles.typeButton}
            />
          ))}
        </View>

        {type === 'milk' && (
          <Input
            label="Số ml"
            placeholder="120"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        )}

        <Input
          label="Số lần trong ngày"
          placeholder="1"
          value={times}
          onChangeText={setTimes}
          keyboardType="numeric"
        />

        <Input
          label="Ghi chú (tùy chọn)"
          placeholder="Bé bú ít hơn bình thường..."
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
  label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeButton: { flex: 1 },
  submitButton: { marginTop: 16 },
});
