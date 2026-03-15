import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useChildStore } from '../../src/stores/childStore';
import { trackingService } from '../../src/services/tracking';
import { aiService, AIAnalysisResult } from '../../src/services/ai';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';
import { differenceInMonths } from 'date-fns';
import { RecordType } from '../../src/types';

export default function AIScreen() {
  const { selectedChild } = useChildStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['growth', 'feeding']);

  const childAge = selectedChild
    ? differenceInMonths(new Date(), new Date(selectedChild.birth_date))
    : 0;

  const handleAnalyze = async () => {
    if (!selectedChild) return;
    setLoading(true);
    setResult(null);

    try {
      const records = await Promise.all(
        selectedTypes.map(type => trackingService.getRecords(selectedChild.id, { type: type as RecordType, limit: 30 }))
      );

      const allRecords = records.flat();
      const analysis = await aiService.analyzeChildData(
        childAge,
        selectedChild.gender || 'unknown',
        allRecords
      );

      setResult(analysis);
    } catch (error) {
      alert('Lỗi: ' + (error as Error).message);
    }

    setLoading(false);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  if (!selectedChild) {
    return (
      <View style={styles.container}>
        <Text style={styles.noChild}>Vui lòng thêm bé trước</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🤖 AI Phân tích</Text>
      <Text style={styles.subtitle}>
        Bé {selectedChild.name} - {childAge} tháng tuổi
      </Text>

      {/* Data Type Selection */}
      <Card style={styles.filterCard}>
        <Text style={styles.filterTitle}>Chọn loại dữ liệu:</Text>
        <View style={styles.filters}>
          {['growth', 'feeding', 'milestone', 'vaccination'].map(type => (
            <Button
              key={type}
              title={type === 'growth' ? '📏 Tăng trưởng'
                : type === 'feeding' ? '🍼 Chế độ ăn'
                : type === 'milestone' ? '🎯 Mốc phát triển'
                : '💉 Tiêm phòng'}
              variant={selectedTypes.includes(type) ? 'primary' : 'outline'}
              size="small"
              onPress={() => toggleType(type)}
              style={styles.filterButton}
            />
          ))}
        </View>
      </Card>

      {/* Analyze Button */}
      <Button
        title={loading ? 'Đang phân tích...' : '🔍 Phân tích'}
        onPress={handleAnalyze}
        loading={loading}
        style={styles.analyzeButton}
      />

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>AI đang phân tích dữ liệu...</Text>
        </View>
      )}

      {/* Results */}
      {result && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>📊 Kết quả phân tích</Text>

          {result.summary && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionLabel}>Tóm tắt</Text>
              <Text style={styles.sectionText}>{result.summary}</Text>
            </View>
          )}

          {result.growth_assessment && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionLabel}>📈 Đánh giá tăng trưởng</Text>
              <Text style={styles.sectionText}>{result.growth_assessment}</Text>
            </View>
          )}

          {result.feeding_insights && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionLabel}>🍼 Chế độ ăn</Text>
              <Text style={styles.sectionText}>{result.feeding_insights}</Text>
            </View>
          )}

          {result.recommendations.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.sectionLabel}>💡 Khuyến nghị</Text>
              {result.recommendations.map((rec, i) => (
                <Text key={i} style={styles.listItem}>• {rec}</Text>
              ))}
            </View>
          )}

          {result.alerts.length > 0 && (
            <View style={[styles.resultSection, styles.alertSection]}>
              <Text style={styles.alertLabel}>⚠️ Cảnh báo</Text>
              {result.alerts.map((alert, i) => (
                <Text key={i} style={styles.alertItem}>• {alert}</Text>
              ))}
            </View>
          )}

          <Button
            title="💬 Chat với Bác sĩ AI"
            variant="secondary"
            onPress={() => {}}
            style={styles.chatButton}
          />
        </Card>
      )}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        ⚠️ Lưu ý: Đây chỉ là tư vấn từ AI, không thay thế chẩn đoán y khoa.
        Hãy tham khảo bác sĩ cho các vấn đề sức khỏe.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textLight, marginTop: 4, marginBottom: 20 },
  noChild: { textAlign: 'center', marginTop: 100, color: colors.textLight },
  filterCard: { marginBottom: 16 },
  filterTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: { marginBottom: 4 },
  analyzeButton: { marginBottom: 20 },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: colors.textLight },
  resultCard: { marginBottom: 16 },
  resultTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  resultSection: { marginBottom: 16 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  sectionText: { fontSize: 14, color: colors.textLight, lineHeight: 22 },
  listItem: { fontSize: 14, color: colors.text, marginLeft: 8, marginBottom: 4 },
  alertSection: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8 },
  alertLabel: { fontSize: 14, fontWeight: '600', color: '#856404', marginBottom: 8 },
  alertItem: { fontSize: 14, color: '#856404', marginLeft: 8 },
  chatButton: { marginTop: 16 },
  disclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
});
