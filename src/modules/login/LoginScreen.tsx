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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLoginStore } from './loginStore';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { login, isLoading, error, clearError } = useLoginStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    try {
      await login(email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch {
      // Error is handled by store
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Registration' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
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
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.gray400}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.gray400}
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
              />
            </View>

            {/* Error Message */}
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
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
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
