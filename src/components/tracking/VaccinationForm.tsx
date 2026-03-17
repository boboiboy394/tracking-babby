import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { DatePickerInput } from '../common/DatePickerInput';
import { useToast } from '../common/Toast';
import { colors } from '../../constants/colors';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const VACCINES = [
  'Vaccine 5 bệnh (COMBO 5)',
  'Vaccine 6 bệnh (COMBO 6)',
  'Vaccine Cúm',
  'Vaccine COVID-19',
  'Vaccine Viêm gan B',
  'Vaccine Viêm não Nhật Bản',
  'Khác',
];

interface VaccinationLog {
  id: string;
  record_date: string;
  data: any;
  notes: string | null;
}

export function VaccinationForm() {
  const [vaccineName, setVaccineName] = useState(VACCINES[0]);
  const [doseNumber, setDoseNumber] = useState('1');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString());
  const [hospital, setHospital] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<VaccinationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { selectedChild } = useChildStore();
  const { showToast, ToastComponent } = useToast();

  // Fetch vaccination logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedChild) return;
      setLoadingLogs(true);
      try {
        const records = await trackingService.getVaccinations(selectedChild.id);
        setLogs(records);
      } catch (error) {
        showToast('Không thể tải lịch sử', 'error');
      }
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [selectedChild?.id, selectedChild]);

  const handleSubmit = async () => {
    if (!selectedChild) return;

    if (!vaccineName) {
      showToast('Vui lòng chọn vaccine', 'error');
      return;
    }

    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'vaccination',
        {
          vaccine_name: vaccineName,
          dose_number: parseInt(doseNumber) || 1,
          date: recordDate,
          hospital: hospital || undefined,
          location: location || undefined,
        },
        notes,
        recordDate
      );
      setDoseNumber('1');
      setNotes('');
      setHospital('');
      setLocation('');
      setRecordDate(new Date().toISOString());
      showToast('Đã lưu thành công!', 'success');

      // Refresh logs
      const records = await trackingService.getVaccinations(selectedChild.id);
      setLogs(records);
    } catch (error) {
      showToast('Lỗi: ' + (error as Error).message, 'error');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      {ToastComponent}
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

        <DatePickerInput
          label="Ngày tiêm"
          value={recordDate}
          onChange={setRecordDate}
        />

        <Input
          label="Mũi thứ"
          placeholder="1"
          value={doseNumber}
          onChangeText={setDoseNumber}
          keyboardType="numeric"
        />

        <Input
          label="Bệnh viện/Nơi tiêm"
          placeholder="Bệnh viện Nhi Đồng 1"
          value={hospital}
          onChangeText={setHospital}
        />

        <Input
          label="Địa điểm"
          placeholder="TP. Hồ Chí Minh"
          value={location}
          onChangeText={setLocation}
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

      {/* Vaccination Logs Section */}
      {logs.length > 0 && (
        <Card style={styles.logsCard}>
          <Text style={styles.logsTitle}>💉 Lịch sử tiêm chủng</Text>
          {loadingLogs ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            logs.slice(0, 10).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logDate}>
                  {format(new Date(log.record_date), 'dd MMMM yyyy', { locale: vi })}
                </Text>
                <Text style={styles.logVaccine}>{log.data.vaccine_name}</Text>
                <View style={styles.logDetails}>
                  <Text style={styles.logDetail}>💉 Mũi {log.data.dose_number}</Text>
                  {log.data.hospital && (
                    <Text style={styles.logDetail}>🏥 {log.data.hospital}</Text>
                  )}
                  {log.data.location && (
                    <Text style={styles.logDetail}>📍 {log.data.location}</Text>
                  )}
                </View>
                {log.notes && <Text style={styles.logNotes}>📝 {log.notes}</Text>}
              </View>
            ))
          )}
          {logs.length > 10 && (
            <Text style={styles.moreText}>+ {logs.length - 10} bản ghi khác</Text>
          )}
        </Card>
      )}
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
  logsCard: { margin: 16, marginTop: 0 },
  logsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  logItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  logVaccine: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 },
  logDetails: { gap: 4 },
  logDetail: { fontSize: 14, color: colors.textMuted },
  logNotes: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  moreText: { textAlign: 'center', color: colors.primary, fontSize: 14, marginTop: 8 },
});
