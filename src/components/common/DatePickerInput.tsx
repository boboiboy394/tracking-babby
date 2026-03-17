import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import { format, parse, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DatePickerInputProps {
  label: string;
  value: string; // ISO date string
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
    // Try to parse the input
    const parsed = parse(text, 'dd/MM/yyyy HH:mm', new Date());
    if (isValid(parsed)) {
      onChange(parsed.toISOString());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={handleOpenPicker} style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          editable={false}
          onPressIn={handleOpenPicker}
        />
        <Text style={styles.icon}>📅</Text>
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
              <Pressable style={styles.quickDateBtn} onPress={() => setTempDate(new Date().toISOString())}>
                <Text style={styles.quickDateText}>Bây giờ</Text>
              </Pressable>
              <Pressable
                style={styles.quickDateBtn}
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
              <Text style={styles.previewText}>
                📅 {format(new Date(tempDate), 'EEEE, dd MMMM yyyy, HH:mm', { locale: vi })}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  icon: {
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickDates: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  quickDateBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
  },
  quickDateText: {
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
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  dateInput: {
    width: 60,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  previewText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
