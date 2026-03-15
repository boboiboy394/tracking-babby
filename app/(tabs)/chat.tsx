import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useChildStore } from '../../src/stores/childStore';
import { aiService } from '../../src/services/ai';
import { colors } from '../../src/constants/colors';
import { differenceInMonths } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  '🤱 Chế độ ăn của bé',
  '😴 Giấc ngủ bé',
  '🦷 Mọc răng',
  '💉 Tiêm phòng',
  '📈 Tăng trưởng',
];

export default function ChatScreen() {
  const { selectedChild } = useChildStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const childAge = selectedChild
    ? differenceInMonths(new Date(), new Date(selectedChild.birth_date))
    : 0;

  const handleSend = async () => {
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
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.assistantMessage
    ]}>
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
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Bác sĩ AI</Text>
      </View>

      {selectedChild ? (
        <>
          {/* Quick Questions */}
          <View style={styles.quickQuestions}>
            <FlatList
              horizontal
              data={QUICK_QUESTIONS}
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => handleQuickQuestion(item)}
                >
                  <Text style={styles.quickText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />

          {/* Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            ⚠️ Đây chỉ là tư vấn, không thay thế chẩn đoán y khoa
          </Text>
        </>
      ) : (
        <View style={styles.noChild}>
          <Text style={styles.noChildText}>Vui lòng thêm bé trước</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 16, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  quickQuestions: { paddingHorizontal: 16, paddingBottom: 8 },
  quickButton: { backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  quickText: { fontSize: 12, color: colors.primary },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageContainer: { marginBottom: 12 },
  userMessage: { alignItems: 'flex-end' },
  assistantMessage: { alignItems: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  userBubble: { backgroundColor: colors.primary },
  assistantBubble: { backgroundColor: colors.surface },
  messageText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  userText: { color: colors.white },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: colors.surface, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100, fontSize: 14 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendButtonDisabled: { opacity: 0.5 },
  sendText: { fontSize: 20, color: colors.white },
  disclaimer: { fontSize: 10, color: colors.textMuted, textAlign: 'center', paddingBottom: 8 },
  noChild: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noChildText: { color: colors.textLight },
});
