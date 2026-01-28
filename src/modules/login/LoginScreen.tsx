import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import { useAuthStore } from '../../store/authStore';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';

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

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    loginWithEmail, 
    isLoading, 
    error, 
    clearError 
  } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    try {
      await loginWithEmail(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
    } catch {
      // Error is handled by store
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
    if (error) clearError();
  };

  const handleGoogleSignIn = () => {
    // TODO: Implement Google Sign-In integration later
    // For now, just navigate directly to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' as never }],
    });
  };

  const handleRegisterPress = () => {
    navigation.navigate('Registration' as never);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[
                  styles.input, 
                  (formErrors.email || error) && styles.inputError
                ]}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray400}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                onChangeText={handleEmailChange}
              />
              {formErrors.email && (
                <Text style={styles.fieldErrorText}>{formErrors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[
                    styles.passwordInput, 
                    (formErrors.password || error) && styles.inputError
                  ]}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePasswordChange}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </TouchableOpacity>
              </View>
              {formErrors.password && (
                <Text style={styles.fieldErrorText}>{formErrors.password}</Text>
              )}
            </View>

            {/* API Error Message */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
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

            {/* Register Link */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegisterPress}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
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
    width: '100%',
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
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  fieldErrorText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  button: {
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
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  registerText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  registerLink: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },
});

export default LoginScreen;
