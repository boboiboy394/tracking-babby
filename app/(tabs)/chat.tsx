import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChildStore } from '../../src/stores/childStore';
import { aiService } from '../../src/services/ai';
import { colors } from '../../src/constants/colors';
import { typography } from '../../src/constants/typography';
import { differenceInMonths } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  { id: '1', text: 'Chế độ ăn của bé', icon: 'restaurant' },
  { id: '2', text: 'Giấc ngủ bé', icon: 'moon' },
  { id: '3', text: 'Mọc răng', icon: 'happy' },
  { id: '4', text: 'Tiêm phòng', icon: 'medical' },
  { id: '5', text: 'Tăng trưởng', icon: 'trending-up' },
];

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { selectedChild } = useChildStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const childAge = useMemo(() => {
    if (!selectedChild) return 0;
    return differenceInMonths(new Date(), new Date(selectedChild.birth_date));
  }, [selectedChild?.birth_date]);

  const childAgeText = useMemo(() => {
    if (!selectedChild) return '';
    const months = childAge;
    if (months < 1) {
      const days = Math.floor(months * 30);
      return `${days} ngày tuổi`;
    } else if (months < 24) {
      return `${months} tháng tuổi`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return remainingMonths > 0 ? `${years} tuổi ${remainingMonths} tháng` : `${years} tuổi`;
    }
  }, [childAge, selectedChild]);

  useEffect(() => {
    setMessages([]);
  }, [selectedChild?.id]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chatWithDoctor(
        [...messages, userMessage],
        childAge
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      alert('Lỗi: ' + (error as Error).message);
    }

    setLoading(false);
  }, [input, loading, messages, childAge]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInput(question);
  }, []);

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const renderMessage = useCallback(({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
      {item.role === 'assistant' && (
        <View style={styles.avatarContainer}>
          <View style={styles.assistantAvatar}>
            <Ionicons name="bulb" size={16} color={colors.white} />
          </View>
        </View>
      )}
      <View style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.role === 'user' && styles.userText
        ]}>
          {item.content}
        </Text>
      </View>
    </View>
  ), []);

  const renderQuickQuestion = useCallback(({ item }: { item: typeof QUICK_QUESTIONS[0] }) => (
    <Pressable
      style={({ pressed }) => [
        styles.quickButton,
        pressed && styles.quickButtonPressed,
      ]}
      onPress={() => handleQuickQuestion(item.text)}
    >
      <Ionicons name={item.icon as any} size={14} color={colors.primary} />
      <Text style={styles.quickText}>{item.text}</Text>
    </Pressable>
  ), [handleQuickQuestion]);

  const keyExtractorQuick = useCallback((item: typeof QUICK_QUESTIONS[0]) => item.id, []);

  const canSend = input.trim().length > 0 && !loading;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: 50 + insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBg}>
              <Ionicons name="bulb" size={22} color={colors.white} />
            </View>
            <View>
              <Text style={styles.title}>Bác sĩ AI</Text>
              <Text style={styles.subtitle}>Tư vấn sức khỏe cho bé</Text>
            </View>
          </View>
          {selectedChild && (
            <View style={styles.childInfo}>
              <View style={styles.childAvatar}>
                <Text style={styles.childInitial}>{selectedChild.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.childName}>{selectedChild.name}</Text>
                <Text style={styles.childAgeText}>{childAgeText}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {selectedChild ? (
        <>
          <View style={styles.quickQuestions}>
            <FlatList
              horizontal
              data={QUICK_QUESTIONS}
              keyExtractor={keyExtractorQuick}
              showsHorizontalScrollIndicator={false}
              renderItem={renderQuickQuestion}
              contentContainerStyle={styles.quickListContent}
            />
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
          />

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Bác sĩ đang trả lời...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Hỏi về sức khỏe bé..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
              />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                !canSend && styles.sendButtonDisabled,
                pressed && styles.sendButtonPressed,
              ]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
            <Text style={styles.disclaimerText}>
              Đây chỉ là tư vấn, không thay thế chẩn đoán y khoa
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.noChild}>
          <View style={styles.noChildIconBg}>
            <Ionicons name="person-add" size={40} color={colors.primary} />
          </View>
          <Text style={styles.noChildTitle}>Chưa có bé nào</Text>
          <Text style={styles.noChildText}>Vui lòng thêm bé trong hồ sơ để sử dụng tính năng chat</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    padding: 20,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headline,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 14,
  },
  childAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInitial: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.primary,
  },
  childName: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  childAgeText: {
    ...typography.labelSmall,
    color: colors.textMuted,
  },
  quickQuestions: {
    paddingVertical: 12,
  },
  quickListContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonPressed: {
    opacity: 0.8,
    backgroundColor: colors.primary + '10',
  },
  quickText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
  messagesList: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 14,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    ...typography.bodyMedium,
    color: colors.text,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 10,
    alignItems: 'flex-end',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: {
    ...typography.bodyMedium,
    color: colors.text,
    maxHeight: 80,
    padding: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.textMuted,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  disclaimerText: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  noChild: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noChildIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  noChildTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 8,
  },
  noChildText: {
    ...typography.bodyMedium,
    color: colors.textLight,
    textAlign: 'center',
  },
});
