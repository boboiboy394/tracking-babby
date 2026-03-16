import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../src/stores/authStore';
import { useChildStore } from '../src/stores/childStore';
import { useMomentStore } from '../src/stores/momentStore';
import { momentService } from '../src/services/moments';
import { Button } from '../src/components/common/Button';
import { Card } from '../src/components/common/Card';
import { colors } from '../src/constants/colors';

export default function MomentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { children, selectedChild, setSelectedChild } = useChildStore();
  const { addMoment } = useMomentStore();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [shareWithFamily, setShareWithFamily] = useState(true);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSend = async () => {
    if (!image || !selectedChild || !user) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh và bé');
      return;
    }

    setLoading(true);
    try {
      // Upload image
      const imageUrl = await momentService.uploadImage(image);

      // Create moment
      const newMoment = await momentService.createMoment(
        user.id,
        selectedChild.id,
        imageUrl,
        caption || undefined,
        shareWithFamily
      );

      // Add to store
      addMoment({
        ...newMoment,
        child_name: selectedChild?.name,
        user_name: user.email?.split('@')[0],
      });

      Alert.alert('Thành công', 'Đã chia sẻ khoảnh khắc!');
      setImage(null);
      setCaption('');
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', (error as Error).message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thêm khoảnh khắc</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Caption */}
      <Card style={styles.card}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.input}
          placeholder="Thêm mô tả..."
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </Card>

      {/* Share Options */}
      <Card style={styles.card}>
        <Text style={styles.label}>Chia sẻ tới:</Text>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setShareWithFamily(!shareWithFamily)}
        >
          <Text style={styles.checkbox}>
            {shareWithFamily ? '☑️' : '⬜'}
          </Text>
          <Text style={styles.checkboxLabel}>Gia đình</Text>
        </TouchableOpacity>
      </Card>

      {/* Child Selector */}
      {children.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.label}>Bé trong ảnh:</Text>
          <View style={styles.childList}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childChip,
                  selectedChild?.id === child.id && styles.childChipActive,
                ]}
                onPress={() => setSelectedChild(child)}
              >
                <Text
                  style={[
                    styles.childChipText,
                    selectedChild?.id === child.id && styles.childChipTextActive,
                  ]}
                >
                  {child.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Submit */}
      <Button
        title={loading ? 'Đang gửi...' : '📤 Gửi khoảnh khắc'}
        onPress={handleSend}
        disabled={!image || !selectedChild || loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  backButton: { fontSize: 24, color: colors.text },
  title: { fontSize: 20, fontWeight: '600' },
  imagePicker: { height: 300, margin: 16, borderRadius: 16, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 48 },
  placeholderText: { color: colors.textMuted, marginTop: 8 },
  card: { margin: 16, marginTop: 0 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, minHeight: 80 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  checkbox: { fontSize: 20, marginRight: 8 },
  checkboxLabel: { fontSize: 16 },
  childList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  childChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.background },
  childChipActive: { backgroundColor: colors.primary },
  childChipText: { fontSize: 14 },
  childChipTextActive: { color: colors.white },
  submitButton: { margin: 16 },
});
