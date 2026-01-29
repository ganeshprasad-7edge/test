import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../constants/theme';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const MAX_LENGTH = 150; // Characters to show before "Read More"

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = message.length > MAX_LENGTH;

  const displayText = shouldTruncate && !isExpanded 
    ? `${message.substring(0, MAX_LENGTH)}...` 
    : message;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.supportContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.supportBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.supportText]}>
          {displayText}
        </Text>
        
        {shouldTruncate && (
          <TouchableOpacity
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.readMoreButton}
            activeOpacity={0.7}
          >
            <Text style={[styles.readMoreText, isUser ? styles.userReadMoreText : styles.supportReadMoreText]}>
              {isExpanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.supportTimestamp]}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.xs,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  supportContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: BORDER_RADIUS.xs,
  },
  supportBubble: {
    backgroundColor: COLORS.gray100,
    borderBottomLeftRadius: BORDER_RADIUS.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.white,
  },
  supportText: {
    color: COLORS.gray900,
  },
  readMoreButton: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    textDecorationLine: 'underline',
  },
  userReadMoreText: {
    color: COLORS.white,
    opacity: 0.9,
  },
  supportReadMoreText: {
    color: COLORS.primary,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
    opacity: 0.7,
  },
  userTimestamp: {
    color: COLORS.white,
  },
  supportTimestamp: {
    color: COLORS.gray500,
  },
});

