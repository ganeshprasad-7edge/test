import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from '../../constants/theme';

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
}

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call for registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      
      // Navigate to login after successful registration
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login' as never);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us today and get started
            </Text>
          </View>

          {/* Form Section */}
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

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating Account...' : 'Register'}
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

