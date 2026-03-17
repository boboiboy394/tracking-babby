import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';

type MilestoneType = 'teeth' | 'crawl' | 'walk' | 'talk' | 'roll' | 'sit';

interface MilestoneLog {
  id: string;
  record_date: string;
  data: any;
  notes: string | null;
}

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
  const [recordDate, setRecordDate] = useState(new Date().toISOString());
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<MilestoneLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const { selectedChild } = useChildStore();
  const { showToast, ToastComponent } = useToast();

  // Fetch milestone logs
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedChild) return;
      setLoadingLogs(true);
      try {
        const records = await trackingService.getMilestones(selectedChild.id);
        setLogs(records);
      } catch (error) {
        showToast('Không thể tải lịch sử', 'error');
      }
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [selectedChild?.id, selectedChild]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const handlePickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedChild || !milestoneType) {
      showToast('Vui lòng chọn mốc phát triển', 'error');
      return;
    }

    setLoading(true);
    try {
      await trackingService.addRecord(
        selectedChild.id,
        'milestone',
        {
          milestone_type: milestoneType,
          description,
          media_url: media || undefined,
          media_type: media ? (media.endsWith('.mp4') ? 'video' : 'image') : undefined,
        },
        description,
        recordDate
      );
      setMilestoneType('');
      setDescription('');
      setMedia(null);
      setRecordDate(new Date().toISOString());
      showToast('Đã lưu thành công!', 'success');

      // Refresh logs
      const records = await trackingService.getMilestones(selectedChild.id);
      setLogs(records);
    } catch (error) {
      showToast('Lỗi: ' + (error as Error).message, 'error');
    }
    setLoading(false);
  };

  const getMilestoneLabel = (key: string) => {
    const found = MILESTONE_TYPES.find(m => m.key === key);
    return found ? `${found.emoji} ${found.label}` : key;
  };

  return (
    <ScrollView style={styles.container}>
      {ToastComponent}
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

        <DatePickerInput
          label="Ngày ghi nhận"
          value={recordDate}
          onChange={setRecordDate}
        />

        <Input
          label="Mô tả thêm"
          placeholder="Ngày bé bắt đầu..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Media Picker */}
        <Text style={styles.label}>Ảnh/Video (tùy chọn)</Text>
        <View style={styles.mediaRow}>
          <Pressable style={styles.mediaBtn} onPress={handlePickImage}>
            <Text style={styles.mediaBtnText}>📷 Thêm ảnh</Text>
          </Pressable>
          <Pressable style={styles.mediaBtn} onPress={handlePickVideo}>
            <Text style={styles.mediaBtnText}>🎥 Thêm video</Text>
          </Pressable>
        </View>
        {media && (
          <View style={styles.mediaPreview}>
            <Text style={styles.mediaPreviewText}>✅ Đã chọn media</Text>
            <Pressable onPress={() => setMedia(null)}>
              <Text style={styles.removeMedia}>❌ Xóa</Text>
            </Pressable>
          </View>
        )}

        <Button
          title="💾 Lưu"
          onPress={handleSubmit}
          loading={loading}
          disabled={!milestoneType}
          style={styles.submitButton}
        />
      </Card>

      {/* Milestone Logs Section */}
      {logs.length > 0 && (
        <Card style={styles.logsCard}>
          <Text style={styles.logsTitle}>🎯 Lịch sử mốc phát triển</Text>
          {loadingLogs ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            logs.slice(0, 10).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <Text style={styles.logDate}>
                  {format(new Date(log.record_date), 'dd MMMM yyyy', { locale: vi })}
                </Text>
                <Text style={styles.logType}>{getMilestoneLabel(log.data.milestone_type)}</Text>
                {log.data.description && (
                  <Text style={styles.logDesc}>{log.data.description}</Text>
                )}
                {log.data.media_url && (
                  <View style={styles.logMedia}>
                    <Text style={styles.logMediaIcon}>
                      {log.data.media_type === 'video' ? '🎥' : '📷'} Đã có media
                    </Text>
                  </View>
                )}
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
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeButton: { width: '47%' },
  submitButton: { marginTop: 16 },
  mediaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mediaBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaBtnText: { fontSize: 14, color: colors.text },
  mediaPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  mediaPreviewText: { color: colors.accent, fontWeight: '600' },
  removeMedia: { color: colors.error },
  logsCard: { margin: 16, marginTop: 0 },
  logsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: colors.text },
  logItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  logType: { fontSize: 16, fontWeight: '600', color: colors.text },
  logDesc: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  logMedia: { marginTop: 8 },
  logMediaIcon: { fontSize: 14, color: colors.primary },
  moreText: { textAlign: 'center', color: colors.primary, fontSize: 14, marginTop: 8 },
});
