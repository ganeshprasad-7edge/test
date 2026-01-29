import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../constants/theme';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  placeholder = 'Type your message...' 
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray400}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
          activeOpacity={0.7}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray300,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});

