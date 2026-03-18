import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { format, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export function DatePickerInput({ label, value, onChange, placeholder = 'Chọn ngày' }: DatePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date().toISOString());
  const [inputValue, setInputValue] = useState(value ? format(new Date(value), 'dd/MM/yyyy HH:mm') : '');

  const handleOpenPicker = () => {
    setTempDate(value || new Date().toISOString());
    setShowPicker(true);
  };

  const handleConfirm = () => {
    onChange(tempDate);
    setInputValue(format(new Date(tempDate), 'dd/MM/yyyy HH:mm'));
    setShowPicker(false);
  };

  const handleCancel = () => {
    setShowPicker(false);
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const parsed = parse(text, 'dd/MM/yyyy HH:mm', new Date());
    if (isValid(parsed)) {
      onChange(parsed.toISOString());
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable onPress={handleOpenPicker} style={({ pressed }) => [
        styles.inputContainer,
        pressed && styles.inputContainerPressed,
      ]}>
        <TextInput
          style={styles.input}
          value={inputValue}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={false}
          onPressIn={handleOpenPicker}
        />
        <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Chọn ngày giờ</Text>

            <View style={styles.quickDates}>
              <Pressable
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
                onPress={() => setTempDate(new Date().toISOString())}
              >
                <Text style={styles.quickDateText}>Bây giờ</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setTempDate(yesterday.toISOString());
                }}
              >
                <Text style={styles.quickDateText}>Hôm qua</Text>
              </Pressable>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Ngày</Text>
                <TextInput
                  style={styles.dateInput}
                  value={format(new Date(tempDate), 'dd')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const day = parseInt(text, 10) || 1;
                    const date = new Date(tempDate);
                    date.setDate(Math.min(day, 31));
                    setTempDate(date.toISOString());
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tháng</Text>
                <TextInput
                  style={styles.dateInput}
                  value={format(new Date(tempDate), 'MM')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const month = parseInt(text, 10) || 1;
                    const date = new Date(tempDate);
                    date.setMonth(Math.min(month, 12) - 1);
                    setTempDate(date.toISOString());
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Năm</Text>
                <TextInput
                  style={styles.dateInput}
                  value={format(new Date(tempDate), 'yyyy')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const year = parseInt(text, 10) || new Date().getFullYear();
                    const date = new Date(tempDate);
                    date.setFullYear(year);
                    setTempDate(date.toISOString());
                  }}
                />
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giờ</Text>
                <TextInput
                  style={styles.dateInput}
                  value={format(new Date(tempDate), 'HH')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const hour = parseInt(text, 10) || 0;
                    const date = new Date(tempDate);
                    date.setHours(Math.min(hour, 23));
                    setTempDate(date.toISOString());
                  }}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phút</Text>
                <TextInput
                  style={styles.dateInput}
                  value={format(new Date(tempDate), 'mm')}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    const minute = parseInt(text, 10) || 0;
                    const date = new Date(tempDate);
                    date.setMinutes(Math.min(minute, 59));
                    setTempDate(date.toISOString());
                  }}
                />
              </View>
            </View>

            <View style={styles.preview}>
              <Ionicons name="calendar" size={18} color={colors.primary} style={styles.previewIcon} />
              <Text style={styles.previewText}>
                {format(new Date(tempDate), 'EEEE, dd MMMM yyyy, HH:mm', { locale: vi })}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelBtn,
                  pressed && styles.cancelBtnPressed,
                ]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  pressed && styles.confirmBtnPressed,
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmText}>Xác nhận</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputContainerPressed: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    ...typography.headline,
    textAlign: 'center',
    marginBottom: 24,
  },
  quickDates: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  quickDateBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primaryLight + '30',
    borderRadius: 20,
  },
  quickDateBtnPressed: {
    opacity: 0.8,
  },
  quickDateText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    alignItems: 'center',
  },
  inputLabel: {
    ...typography.labelSmall,
    color: colors.textMuted,
    marginBottom: 6,
  },
  dateInput: {
    width: 64,
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1.5,
    borderColor: colors.border,
    color: colors.text,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    gap: 8,
  },
  previewIcon: {
    marginRight: 2,
  },
  previewText: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelBtnPressed: {
    opacity: 0.8,
  },
  cancelText: {
    ...typography.button,
    color: colors.textMuted,
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  confirmText: {
    ...typography.button,
    color: colors.white,
  },
});
