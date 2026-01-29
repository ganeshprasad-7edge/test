import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { ChatMessage } from '../home/components/ChatMessage';
import { ChatInput } from '../home/components/ChatInput';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to our support chat. How can I assist you today?',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Simulate support response after 1 second
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thank you for your message. Our support team will get back to you shortly.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, supportResponse]);
    }, 1000);
  };

  // Auto-scroll to bottom when new message is added
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.supportAvatar}>
            <Text style={styles.supportAvatarText}>💬</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Support Chat</Text>
            <Text style={styles.headerSubtitle}>We&apos;re here to help</Text>
          </View>
        </View>

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
        </ScrollView>

        {/* Chat Input */}
        <ChatInput onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  backButtonText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray700,
  },
  supportAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  supportAvatarText: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs / 2,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContent: {
    padding: SPACING.base,
    paddingBottom: SPACING.lg,
  },
});

export default ChatScreen;

