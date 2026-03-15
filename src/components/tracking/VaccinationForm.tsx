import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { colors } from '../../constants/colors';

const VACCINES = [
  'Vaccine 5 bệnh (COMBO 5)',
  'Vaccine 6 bệnh (COMBO 6)',
  'Vaccine Cúm',
  'Vaccine COVID-19',
  'Vaccine Viêm gan B',
  'Vaccine Viêm não Nhật Bản',
  'Khác',
];

export function VaccinationForm() {
  const [vaccineName, setVaccineName] = useState(VACCINES[0]);
  const [doseNumber, setDoseNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedChild } = useChildStore();

  const handleSubmit = async () => {
    if (!selectedChild) return;
    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'vaccination',
        {
          vaccine_name: vaccineName,
          dose_number: parseInt(doseNumber),
          date: new Date().toISOString(),
        },
        notes
      );
      setDoseNumber('1');
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
        <Text style={styles.label}>Tên vaccine</Text>
        <View style={styles.vaccineList}>
          {VACCINES.map((v) => (
            <Button
              key={v}
              title={v}
              variant={vaccineName === v ? 'primary' : 'outline'}
              onPress={() => setVaccineName(v)}
              style={styles.vaccineButton}
              size="small"
            />
          ))}
        </View>
        <Input
          label="Mũi thứ"
          placeholder="1"
          value={doseNumber}
          onChangeText={setDoseNumber}
          keyboardType="numeric"
        />
        <Input
          label="Ghi chú"
          placeholder="Phản ứng sau tiêm..."
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
  vaccineList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  vaccineButton: { marginBottom: 4 },
  submitButton: { marginTop: 16 },
});
