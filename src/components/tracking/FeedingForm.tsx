import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable } from 'react-native';
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

type FeedingType = 'milk' | 'porridge' | 'solid';

interface FeedingLog {
  id: string;
  record_date: string;
  data: any;
  notes: string | null;
}

export function FeedingForm() {
  const [type, setType] = useState<FeedingType>('milk');
  const [amount, setAmount] = useState('');
  const [times, setTimes] = useState('1');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<FeedingLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { selectedChild } = useChildStore();
  const { showToast, ToastComponent } = useToast();

  // Fetch feeding logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedChild) return;
      setLoadingLogs(true);
      try {
        const records = await trackingService.getFeedingHistory(selectedChild.id, 50);
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

    if (type === 'milk' && !amount) {
      showToast('Vui lòng nhập số ml sữa', 'error');
      return;
    }

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
        notes,
        recordDate
      );
      setAmount('');
      setTimes('1');
      setNotes('');
      setRecordDate(new Date().toISOString());
      showToast('Đã lưu thành công!', 'success');

      // Refresh logs
      const records = await trackingService.getFeedingHistory(selectedChild.id, 50);
      setLogs(records);
    } catch (error) {
      showToast('Lỗi: ' + (error as Error).message, 'error');
    }
    setLoading(false);
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'milk': return '🍼 Sữa';
      case 'porridge': return '🍲 Cháo';
      case 'solid': return '🍚 Ăn cơm';
      default: return t;
    }
  };

  const renderLogItem = ({ item }: { item: FeedingLog }) => (
    <View style={styles.logItem}>
      <Text style={styles.logDate}>
        {format(new Date(item.record_date), 'dd MMMM, HH:mm', { locale: vi })}
      </Text>
      <View style={styles.logData}>
        <Text style={styles.logType}>{getTypeLabel(item.data.type)}</Text>
        {item.data.amount_ml && (
          <Text style={styles.logValue}>🥛 {item.data.amount_ml}ml</Text>
        )}
        <Text style={styles.logValue}>🔢 {item.data.times} lần</Text>
      </View>
      {item.notes && <Text style={styles.logNotes}>📝 {item.notes}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {ToastComponent}
      <Card style={styles.card}>
        <Text style={styles.label}>Loại thức ăn</Text>
        <View style={styles.typeSelector}>
          {(['milk', 'porridge', 'solid'] as FeedingType[]).map((t) => (
            <Button
              key={t}
              title={getTypeLabel(t)}
              variant={type === t ? 'primary' : 'outline'}
              onPress={() => setType(t)}
              style={styles.typeButton}
            />
          ))}
        </View>

        <DatePickerInput
          label="Ngày ghi nhận"
          value={recordDate}
          onChange={setRecordDate}
        />

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

      {/* Feeding Logs Section */}
      {logs.length > 0 && (
        <Card style={styles.logsCard}>
          <Text style={styles.logsTitle}>📋 Lịch sử ăn/uống</Text>
          {logs.slice(0, 10).map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logDate}>
                {format(new Date(log.record_date), 'dd MMMM, HH:mm', { locale: vi })}
              </Text>
              <View style={styles.logData}>
                <Text style={styles.logType}>{getTypeLabel(log.data.type)}</Text>
                {log.data.amount_ml && (
                  <Text style={styles.logValue}>🥛 {log.data.amount_ml}ml</Text>
                )}
                <Text style={styles.logValue}>🔢 {log.data.times} lần</Text>
              </View>
              {log.notes && <Text style={styles.logNotes}>📝 {log.notes}</Text>}
            </View>
          ))}
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
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeButton: { flex: 1 },
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
  logData: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  logType: { fontSize: 14, fontWeight: '600', color: colors.text },
  logValue: { fontSize: 14, color: colors.text },
  logNotes: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontStyle: 'italic' },
  moreText: { textAlign: 'center', color: colors.primary, fontSize: 14, marginTop: 8 },
});
