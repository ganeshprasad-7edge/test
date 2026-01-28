import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/AppNavigator';
import { Svg, Path } from 'react-native-svg';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

// Google Icon Component
const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

// Eye Icon Components for Password Visibility
const EyeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={COLORS.gray500}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      stroke={COLORS.gray500}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke={COLORS.gray500}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1l22 22"
      stroke={COLORS.gray500}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { 
    registerUser,
    isRegistering,
    error: authError,
    clearError,
  } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [successOpacity] = useState(new Animated.Value(0));

  // Handle success message animation and auto-navigation
  useEffect(() => {
    if (successMessage) {
      // Fade in the success message
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-navigate to OTP screen after 2 seconds
      const timer = setTimeout(() => {
        navigation.navigate('OTP', { email: formData.email });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [successMessage, successOpacity, navigation, formData.email]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (authError) {
      clearError();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Call Cognito signUp - this will send the OTP to email
      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
      });

      // Show success message in UI (will auto-navigate to OTP screen)
      setSuccessMessage(`Verification code sent to ${formData.email}`);
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      console.error('Registration failed:', error);
      
      // Handle specific errors inline
      if (err.name === 'UsernameExistsException' || 
          err.message?.includes('already exists') ||
          err.message?.includes('User already exists')) {
        // Show error on email field instead of alert
        setErrors((prev) => ({ 
          ...prev, 
          email: 'An account with this email already exists' 
        }));
      } else if (err.name === 'InvalidPasswordException' ||
                 err.message?.includes('password')) {
        // Show password-related errors on password field
        setErrors((prev) => ({ 
          ...prev, 
          password: err.message || 'Password does not meet requirements' 
        }));
      } else {
        // Show other errors as alert
        Alert.alert('Registration Failed', err.message || 'Please try again.');
      }
    }
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In integration later
    // For now, just navigate directly to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleLoginPress = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us today and get started
            </Text>
          </View>

          {/* Success Message */}
          {successMessage && (
            <Animated.View style={[styles.successBanner, { opacity: successOpacity }]}>
              <Text style={styles.successIcon}>✓</Text>
              <View style={styles.successTextContainer}>
                <Text style={styles.successTitle}>Verification Code Sent!</Text>
                <Text style={styles.successMessage}>{successMessage}</Text>
                <Text style={styles.successHint}>Redirecting to OTP screen...</Text>
              </View>
            </Animated.View>
          )}

          {/* Form Section */}
          {!successMessage && (
            <View style={styles.formSection}>
            {/* First Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                placeholderTextColor={COLORS.gray400}
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                placeholderTextColor={COLORS.gray400}
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.gray400}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email address"
                placeholderTextColor={COLORS.gray400}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Create a password"
                  placeholderTextColor={COLORS.gray400}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
              <Text style={styles.passwordHint}>
                Min 8 chars with uppercase, lowercase & number
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, isRegistering && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isRegistering}
              activeOpacity={0.8}
            >
              {isRegistering ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <GoogleIcon />
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
            </View>
          )}
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['2xl'],
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success,
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    lineHeight: 48,
    marginRight: SPACING.md,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  successMessage: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  successHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    fontStyle: 'italic',
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginTop: SPACING.lg,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
    marginTop: SPACING.xs,
  },
  formSection: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  input: {
    height: 52,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 52,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingRight: SPACING['3xl'],
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray900,
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.base,
    padding: SPACING.xs,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  passwordHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    marginTop: SPACING.xs,
  },
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  dividerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray400,
    paddingHorizontal: SPACING.base,
  },
  googleButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonDisabled: {
    backgroundColor: COLORS.gray50,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.gray700,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  loginText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  loginLink: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});

export default RegistrationScreen;
