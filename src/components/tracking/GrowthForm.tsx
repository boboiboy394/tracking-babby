import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, FlatList, Pressable } from 'react-native';
import { useChildStore } from '../../stores/childStore';
import { trackingService } from '../../services/tracking';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { DatePickerInput } from '../common/DatePickerInput';
import { useToast } from '../common/Toast';
import { colors } from '../../constants/colors';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TrackingLog {
  id: string;
  record_date: string;
  data: any;
  notes: string | null;
}

export function GrowthForm() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [head, setHead] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { selectedChild } = useChildStore();
  const { showToast, ToastComponent } = useToast();

  // Fetch latest growth data when selectedChild changes
  useEffect(() => {
    let isMounted = true;

    const fetchLatestGrowth = async () => {
      if (!selectedChild) {
        if (isMounted) {
          setHeight('');
          setWeight('');
          setHead('');
          setNotes('');
        }
        return;
      }

      if (isMounted) {
        setLoadingData(true);
      }

      try {
        const records = await trackingService.getGrowthHistory(selectedChild.id, 1);
        if (isMounted) {
          if (records && records.length > 0) {
            const latest = records[0];
            const data = latest.data as { height_cm?: number; weight_kg?: number; head_circumference_cm?: number };
            setHeight(data.height_cm?.toString() || '');
            setWeight(data.weight_kg?.toString() || '');
            setHead(data.head_circumference_cm?.toString() || '');
            setNotes(latest.notes || '');
          } else {
            setHeight('');
            setWeight('');
            setHead('');
            setNotes('');
          }
        }
      } catch (error) {
        console.error('Error fetching growth data:', error);
      }

      if (isMounted) {
        setLoadingData(false);
      }
    };

    fetchLatestGrowth();

    return () => {
      isMounted = false;
    };
  }, [selectedChild?.id]);

  // Fetch monthly logs when selectedChild changes
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedChild) return;
      setLoadingLogs(true);
      try {
        const records = await trackingService.getGrowthHistory(selectedChild.id, 100);
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

    if (!height || !weight) {
      showToast('Vui lòng nhập chiều cao và cân nặng', 'error');
      return;
    }

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
        notes,
        recordDate
      );
      setHeight('');
      setWeight('');
      setHead('');
      setNotes('');
      setRecordDate(new Date().toISOString());
      showToast('Đã lưu thành công!', 'success');

      // Refresh logs
      const records = await trackingService.getGrowthHistory(selectedChild.id, 100);
      setLogs(records);
    } catch (error) {
      showToast('Lỗi: ' + (error as Error).message, 'error');
    }
    setLoading(false);
  };

  // Group logs by month
  const groupedLogs = logs.reduce((acc, log) => {
    const monthKey = format(new Date(log.record_date), 'MMMM yyyy', { locale: vi });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(log);
    return acc;
  }, {} as Record<string, TrackingLog[]>);

  const renderLogItem = ({ item }: { item: TrackingLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logDate}>
        {format(new Date(item.record_date), 'dd MMMM, HH:mm', { locale: vi })}
      </Text>
      <View style={styles.logData}>
        <Text style={styles.logValue}>📏 {item.data.height_cm}cm</Text>
        <Text style={styles.logValue}>⚖️ {item.data.weight_kg}kg</Text>
        {item.data.head_circumference_cm && (
          <Text style={styles.logValue}>⭕ {item.data.head_circumference_cm}cm</Text>
        )}
      </View>
      {item.notes && <Text style={styles.logNotes}>📝 {item.notes}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {ToastComponent}
      <Card style={styles.card}>
        {selectedChild && (
          <Text style={styles.childName}>📏 Đo {selectedChild.name}</Text>
        )}

        {loadingData && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        <DatePickerInput
          label="Ngày ghi nhận"
          value={recordDate}
          onChange={setRecordDate}
        />

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
          disabled={loadingData}
          style={styles.submitButton}
        />
      </Card>

      {/* Monthly Logs Section */}
      {logs.length > 0 && (
        <Card style={styles.logsCard}>
          <Text style={styles.logsTitle}>📊 Lịch sử theo tháng</Text>
          {loadingLogs ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            Object.entries(groupedLogs).map(([month, monthLogs]) => (
              <View key={month} style={styles.monthGroup}>
                <Text style={styles.monthTitle}>{month}</Text>
                {monthLogs.map((log) => (
                  <View key={log.id} style={styles.logItem}>
                    <Text style={styles.logDate}>
                      {format(new Date(log.record_date), 'dd, HH:mm')}
                    </Text>
                    <View style={styles.logData}>
                      <Text style={styles.logValue}>📏 {log.data.height_cm}cm</Text>
                      <Text style={styles.logValue}>⚖️ {log.data.weight_kg}kg</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  card: { margin: 16 },
  childName: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  loadingOverlay: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  loadingText: { marginLeft: 8, color: colors.textMuted, fontSize: 14 },
  submitButton: { marginTop: 16 },
  logsCard: { margin: 16, marginTop: 0 },
  logsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  monthGroup: { marginBottom: 12 },
  monthTitle: { fontSize: 14, fontWeight: '600', color: colors.primary, marginBottom: 8 },
  logItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  logData: { flexDirection: 'row', gap: 12 },
  logValue: { fontSize: 14, fontWeight: '500', color: colors.text },
  logNotes: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
});
