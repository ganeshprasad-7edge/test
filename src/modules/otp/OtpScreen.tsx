import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';
import { useAuthStore, STATIC_OTP } from '../../store/authStore';

const OTP_LENGTH = 6;
const RESEND_TIMER_SECONDS = 30;

type OtpRouteParams = {
  OTP: {
    phoneNumber?: string;
    email?: string;
  };
};

export const OtpScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<OtpRouteParams, 'OTP'>>();
  const { verifyOtp, isVerifyingOtp, error, clearError, registrationData } = useAuthStore();

  // OTP input state
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  
  // Timer state
  const [resendTimer, setResendTimer] = useState<number>(RESEND_TIMER_SECONDS);
  const [canResend, setCanResend] = useState<boolean>(false);
  
  // Refs for input fields
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Get email for OTP verification (email-based OTP from Cognito)
  const email = route.params?.email || registrationData?.email || '';
  
  // Mask email for display (show first 2 chars and domain)
  const maskedEmail = email.includes('@') 
    ? `${email.slice(0, 2)}${'•'.repeat(email.indexOf('@') - 2)}${email.slice(email.indexOf('@'))}`
    : email;

  // Timer countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // Clear error on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Handle OTP input change
  const handleOtpChange = useCallback((value: string, index: number) => {
    // Only allow digits
    const digits = value.replace(/[^0-9]/g, '');
    
    // Detect paste: if pasted value has multiple digits (length >= OTP_LENGTH or length > 1)
    if (digits.length >= OTP_LENGTH) {
      // Handle paste of full OTP (or more than OTP_LENGTH)
      const otpDigits = digits.slice(0, OTP_LENGTH).split('');
      setOtp(otpDigits);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      setFocusedIndex(OTP_LENGTH - 1);
      Keyboard.dismiss();
      
      // Auto-verify if we have complete OTP
      const completeOtp = otpDigits.join('');
      if (completeOtp.length === OTP_LENGTH) {
        setTimeout(() => {
          handleVerifyOtp(completeOtp);
        }, 100);
      }
      return;
    } else if (digits.length > 1) {
      // Handle paste of partial OTP (2-5 digits)
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && (index + i) < OTP_LENGTH; i++) {
        newOtp[index + i] = digits[i];
      }
      setOtp(newOtp);
      
      // Focus on the next empty field or last filled field
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      setFocusedIndex(nextIndex);
      
      // Auto-verify if all fields are filled
      const completeOtp = newOtp.join('');
      if (completeOtp.length === OTP_LENGTH) {
        Keyboard.dismiss();
        setTimeout(() => {
          handleVerifyOtp(completeOtp);
        }, 100);
      }
      return;
    }
    
    // Single digit input (normal typing)
    if (digits.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = digits;
      setOtp(newOtp);

      // Move to next input if digit entered
      if (digits && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }

      // Auto-submit when all digits are entered
      if (digits && index === OTP_LENGTH - 1) {
        const completeOtp = newOtp.join('');
        if (completeOtp.length === OTP_LENGTH) {
          Keyboard.dismiss();
          handleVerifyOtp(completeOtp);
        }
      }
    }
  }, [otp]);

  // Handle backspace
  const handleKeyPress = useCallback((event: { nativeEvent: { key: string } }, index: number) => {
    if (event.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  }, [otp]);

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    clearError();
  }, [clearError]);

  // Verify OTP
  const handleVerifyOtp = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    
    if (codeToVerify.length !== OTP_LENGTH) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    const success = await verifyOtp(codeToVerify);
    
    if (success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    }
  };

  // Resend OTP
  const handleResendOtp = useCallback(() => {
    if (!canResend) return;

    // Reset timer
    setResendTimer(RESEND_TIMER_SECONDS);
    setCanResend(false);
    
    // Clear current OTP
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setFocusedIndex(0);

    // TODO: Implement actual OTP resend via Cognito resendConfirmationCode
    Alert.alert(
      'Verification Code Sent',
      `A new verification code has been sent to ${maskedEmail}\n\nFor testing, use: ${STATIC_OTP}`,
      [{ text: 'OK' }]
    );
  }, [canResend, maskedEmail]);

  // Format timer display
  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>✉️</Text>
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a 6-digit verification code to
            </Text>
            <Text style={styles.contactText}>{maskedEmail}</Text>
          </View>

          {/* OTP Input Section */}
          <View style={styles.otpSection}>
            <View style={styles.otpContainer}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    focusedIndex === index && styles.otpInputFocused,
                    otp[index] && styles.otpInputFilled,
                    error && styles.otpInputError,
                  ]}
                  value={otp[index] || ''}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => handleFocus(index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? OTP_LENGTH : 1}
                  selectTextOnFocus={index === 0 ? false : true}
                  caretHidden
                />
              ))}
            </View>

            {/* Error Message */}
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {/* Static OTP Hint (for development) */}
            <Text style={styles.hintText}>
              For testing, use OTP: {STATIC_OTP}
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isVerifyingOtp || otp.join('').length !== OTP_LENGTH) && 
                styles.verifyButtonDisabled,
            ]}
            onPress={() => handleVerifyOtp()}
            disabled={isVerifyingOtp || otp.join('').length !== OTP_LENGTH}
            activeOpacity={0.8}
          >
            {isVerifyingOtp ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOtp}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend in {formatTimer(resendTimer)}
              </Text>
            )}
          </View>

          {/* Back to Registration */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Change email address</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    textAlign: 'center',
  },
  contactText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray800,
    marginTop: SPACING.xs,
  },
  otpSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray50,
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    textAlign: 'center',
  },
  otpInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  otpInputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  hintText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  verifyButton: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonDisabled: {
    backgroundColor: COLORS.gray300,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  resendSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  resendLink: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
  timerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray600,
  },
  backButton: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
  },
});

export default OtpScreen;

