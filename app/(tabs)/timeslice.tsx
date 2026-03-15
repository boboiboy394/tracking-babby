import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useChildStore } from '../../src/stores/childStore';
import { Card } from '../../src/components/common/Card';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/constants/colors';

export default function TimesliceScreen() {
  const { selectedChild } = useChildStore();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [style, setStyle] = useState<'modern' | 'vintage'>('modern');

  const handleGenerate = () => {
    alert('Tính năng đang được phát triển! Video sẽ được tạo từ các ảnh đã chọn.');
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
      <Text style={styles.title}>🎬 Tạo Timeslice</Text>
      <Text style={styles.subtitle}>Tạo video kỷ niệm từ ảnh bé</Text>

      {/* Time Range */}
      <Card style={styles.card}>
        <Text style={styles.label}>Chọn thời gian</Text>
        <View style={styles.options}>
          {['1 tháng', '3 tháng', '6 tháng', '1 năm'].map((range) => (
            <Button
              key={range}
              title={range}
              variant="outline"
              size="small"
              style={styles.optionButton}
            />
          ))}
        </View>
      </Card>

      {/* Milestone Filter */}
      <Card style={styles.card}>
        <Text style={styles.label}>Chọn loại khoảnh khắc</Text>
        <View style={styles.options}>
          {['Mọc răng', 'Cười chơi', 'Ăn uống', 'Tập đi', 'Tất cả'].map((type) => (
            <Button
              key={type}
              title={type}
              variant="outline"
              size="small"
              style={styles.optionButton}
            />
          ))}
        </View>
      </Card>

      {/* Style Selection */}
      <Card style={styles.card}>
        <Text style={styles.label}>Style video</Text>
        <View style={styles.styleOptions}>
          <TouchableOpacity
            style={[styles.styleButton, style === 'modern' && styles.styleActive]}
            onPress={() => setStyle('modern')}
          >
            <Text style={styles.styleEmoji}>✨</Text>
            <Text style={styles.styleText}>Modern</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.styleButton, style === 'vintage' && styles.styleActive]}
            onPress={() => setStyle('vintage')}
          >
            <Text style={styles.styleEmoji}>📷</Text>
            <Text style={styles.styleText}>Vintage</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Placeholder for image selection */}
      <Card style={styles.card}>
        <Text style={styles.label}>Ảnh đã chọn: {selectedImages.length}</Text>
        <View style={styles.placeholderGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>+</Text>
            </View>
          ))}
        </View>
        <Text style={styles.placeholderNote}>
          Chọn ảnh từ thư viện (tính năng sắp có)
        </Text>
      </Card>

      {/* Generate Button */}
      <Button
        title="🎬 Tạo Video"
        onPress={handleGenerate}
        style={styles.generateButton}
      />

      <Text style={styles.disclaimer}>
        Video sẽ được tạo và lưu vào thư viện của bạn
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textLight, marginBottom: 20 },
  noChild: { textAlign: 'center', marginTop: 100, color: colors.textLight },
  card: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionButton: { marginBottom: 4 },
  styleOptions: { flexDirection: 'row', gap: 12 },
  styleButton: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center' },
  styleActive: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: colors.primary },
  styleEmoji: { fontSize: 24, marginBottom: 4 },
  styleText: { fontSize: 14, fontWeight: '600' },
  placeholderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  placeholderImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 24, color: colors.textMuted },
  placeholderNote: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  generateButton: { marginTop: 8 },
  disclaimer: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
});
