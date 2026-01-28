# Milestone 2: Splash Screen, Custom Fonts & Registration

A comprehensive guide covering the splash screen implementation, custom font integration, and registration page with form validation.

---

## 📋 Table of Contents

1. [Splash Screen](#1-splash-screen)
2. [Custom Fonts](#2-custom-fonts)
3. [Registration Page](#3-registration-page)
4. [Theme System](#4-theme-system)
5. [Navigation Updates](#5-navigation-updates)
6. [Form Validation](#6-form-validation)

---

## 1. Splash Screen

### Overview

The splash screen is the first screen users see when launching the app. It features:
- Animated app logo with fade-in and scale effects
- Animated progress bar showing loading status
- Clean, professional design with brand colors

### File Location

```
src/modules/splash/SplashScreen.tsx
```

### Key Features

#### 1.1 Animated Logo

```tsx
// Fade in and scale animation
const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(0.8)).current;

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }),
  ]).start();
}, []);
```

**Animation Breakdown:**
| Animation | Type | Duration | Purpose |
|-----------|------|----------|---------|
| `fadeAnim` | Timing | 800ms | Fades logo from invisible to visible |
| `scaleAnim` | Spring | ~500ms | Scales logo from 80% to 100% with bounce |

#### 1.2 Progress Bar Animation

```tsx
const progressAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(progressAnim, {
    toValue: 100,
    duration: 2500,
    useNativeDriver: false,
  }).start();
}, []);

// Interpolate for width
const progressWidth = progressAnim.interpolate({
  inputRange: [0, 100],
  outputRange: [0, PROGRESS_BAR_WIDTH],
});
```

**Why `useNativeDriver: false`?**
- Width animations cannot use the native driver
- Only `transform` and `opacity` support native driver

#### 1.3 Component Structure

```tsx
<View style={styles.container}>
  {/* Background */}
  <View style={styles.backgroundGradient} />

  {/* Logo with animation */}
  <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
    <View style={styles.logoCircle}>
      <Text style={styles.logoText}>T</Text>
    </View>
    <Text style={styles.appName}>Test App</Text>
    <Text style={styles.tagline}>Your trusted companion</Text>
  </Animated.View>

  {/* Progress Bar */}
  <View style={styles.progressBarContainer}>
    <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
  </View>
  <Text style={styles.progressText}>Loading... {progress}%</Text>

  {/* Footer */}
  <Text style={styles.footerText}>Version 1.0.0</Text>
</View>
```

#### 1.4 Navigation Flow

```
Splash Screen
    ↓ (checks session)
    ├── Session valid → Home Screen
    └── Session invalid → Login Screen
```

---

## 2. Custom Fonts

### Overview

The app uses **Poppins** font family from Google Fonts for a modern, clean look.

### Font Files

```
src/assets/fonts/
├── Poppins-Regular.ttf    # Normal text
├── Poppins-Medium.ttf     # Slightly emphasized text
├── Poppins-SemiBold.ttf   # Buttons, labels
└── Poppins-Bold.ttf       # Headings, titles
```

### 2.1 Font Loading Hook

**File:** `src/hooks/useFonts.ts`

```tsx
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
          'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
          'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load fonts'));
      }
    };

    loadFonts();
  }, []);

  return { fontsLoaded, error };
};
```

### 2.2 Using Fonts in App.tsx

```tsx
import { useFonts } from './src/hooks/useFonts';

export default function App() {
  const { fontsLoaded, error } = useFonts();

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}
```

### 2.3 Using Fonts in Styles

```tsx
import { FONTS } from '../../constants/theme';

const styles = StyleSheet.create({
  title: {
    fontFamily: FONTS.bold,      // 'Poppins-Bold'
    fontSize: 24,
  },
  body: {
    fontFamily: FONTS.regular,   // 'Poppins-Regular'
    fontSize: 14,
  },
  button: {
    fontFamily: FONTS.semiBold,  // 'Poppins-SemiBold'
    fontSize: 16,
  },
});
```

### Font Weight Reference

| Font File | Use Case | Example |
|-----------|----------|---------|
| `Poppins-Regular` | Body text, descriptions | Paragraphs, hints |
| `Poppins-Medium` | Labels, subtitles | Form labels, captions |
| `Poppins-SemiBold` | Buttons, links | CTAs, navigation |
| `Poppins-Bold` | Headings, titles | Screen titles, logos |

---

## 3. Registration Page

### Overview

A complete registration form with:
- App logo branding
- Four input fields with validation
- Real-time error feedback
- Keyboard-aware scrolling

### File Location

```
src/modules/registration/RegistrationScreen.tsx
```

### 3.1 Form Fields

| Field | Type | Validation |
|-------|------|------------|
| First Name | Text | Required, min 2 characters |
| Last Name | Text | Required, min 2 characters |
| Phone Number | Phone | Required, exactly 10 digits |
| Email Address | Email | Required, valid email format |
| Password | Password | Required, min 8 chars with uppercase, lowercase & number |
| **Password Visibility** | Toggle | Eye icon to show/hide password |

### 3.2 Form State Management

```tsx
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

const [formData, setFormData] = useState<FormData>({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
});

const [errors, setErrors] = useState<FormErrors>({});
```

### 3.3 Input Component Pattern

```tsx
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
```

### 3.3.1 Password Input with Visibility Toggle

```tsx
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
</View>
```

**Password Visibility Features:**
- Eye icon button on the right side of password input
- Toggles between showing and hiding password text
- Icons: Eye (visible) when password is hidden, Eye-off (hidden) when password is visible
- Works on both Login and Registration screens

### 3.4 Keyboard Handling

```tsx
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.keyboardView}
>
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    {/* Form content */}
  </ScrollView>
</KeyboardAvoidingView>
```

**Props Explained:**
| Prop | Value | Purpose |
|------|-------|---------|
| `behavior` | `'padding'` (iOS) / `'height'` (Android) | How to avoid keyboard |
| `keyboardShouldPersistTaps` | `'handled'` | Allow tapping buttons while keyboard is open |

### 3.5 Screen Layout

```
┌─────────────────────────────┐
│         [Logo]              │
│      Create Account         │
│   Join us today and get...  │
├─────────────────────────────┤
│  First Name                 │
│  ┌─────────────────────┐    │
│  │ Enter your first... │    │
│  └─────────────────────┘    │
│                             │
│  Last Name                  │
│  ┌─────────────────────┐    │
│  │ Enter your last...  │    │
│  └─────────────────────┘    │
│                             │
│  Phone Number               │
│  ┌─────────────────────┐    │
│  │ Enter your phone... │    │
│  └─────────────────────┘    │
│                             │
│  Email Address              │
│  ┌─────────────────────┐    │
│  │ Enter your email... │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │      Register       │    │
│  └─────────────────────┘    │
│                             │
│  Already have an account?   │
│         Sign In             │
└─────────────────────────────┘
```

---

## 4. Theme System

### Overview

Centralized theme constants for consistent styling across the app.

### File Location

```
src/constants/theme.ts
```

### 4.1 Colors

```tsx
export const COLORS = {
  // Primary colors
  primary: '#6366F1',        // Indigo - main brand color
  primaryDark: '#4F46E5',    // Darker shade for pressed states
  primaryLight: '#818CF8',   // Lighter shade for backgrounds

  // Secondary colors
  secondary: '#EC4899',      // Pink - accent color
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',         // Light backgrounds
  gray100: '#F3F4F6',        // Input backgrounds
  gray200: '#E5E7EB',        // Borders
  gray400: '#9CA3AF',        // Placeholder text
  gray500: '#6B7280',        // Secondary text
  gray700: '#374151',        // Labels
  gray900: '#111827',        // Primary text

  // Status colors
  success: '#10B981',        // Green - success states
  warning: '#F59E0B',        // Yellow - warnings
  error: '#EF4444',          // Red - errors
  info: '#3B82F6',           // Blue - information
};
```

### 4.2 Font Constants

```tsx
export const FONTS = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

export const FONT_SIZES = {
  xs: 10,      // Captions, footnotes
  sm: 12,      // Small labels
  base: 14,    // Body text
  md: 16,      // Buttons, inputs
  lg: 18,      // Subheadings
  xl: 20,      // Section titles
  '2xl': 24,   // Screen titles
  '3xl': 30,   // Large headings
  '4xl': 36,   // Hero text
  '5xl': 48,   // Splash screen logo
};
```

### 4.3 Spacing System

```tsx
export const SPACING = {
  xs: 4,       // Tight spacing
  sm: 8,       // Small gaps
  md: 12,      // Medium gaps
  base: 16,    // Standard padding
  lg: 20,      // Large gaps
  xl: 24,      // Section padding
  '2xl': 32,   // Large sections
  '3xl': 40,   // Screen padding
  '4xl': 48,   // Major sections
};
```

### 4.4 Border Radius

```tsx
export const BORDER_RADIUS = {
  sm: 4,       // Subtle rounding
  md: 8,       // Small buttons
  lg: 12,      // Inputs, cards
  xl: 16,      // Large cards
  '2xl': 24,   // Pills, tags
  full: 9999,  // Circles
};
```

### 4.5 Using Theme in Components

```tsx
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  input: {
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.base,
  },
});
```

---

## 5. Navigation Updates

### Updated Navigation Structure

**File:** `src/navigation/AppNavigator.tsx`

```tsx
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Registration: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

### Navigation Flow Diagram

```
┌──────────────┐
│    Splash    │
│   (2.5 sec)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐
│    Login     │◄───►│ Registration │
│              │     │              │
└──────┬───────┘     └──────────────┘
       │
       ▼
┌──────────────┐
│     Home     │
│              │
└──────────────┘
```

### Navigating Between Screens

```tsx
// Navigate to Registration
navigation.navigate('Registration');

// Navigate to Login
navigation.navigate('Login');

// Reset stack (for auth flows)
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

---

## 6. Form Validation

### 6.1 Validation Functions

```tsx
// Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (10 digits)
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};
```

### 6.2 Form Validation Logic

```tsx
const validateForm = (): boolean => {
  const newErrors: FormErrors = {};

  // First Name validation
  if (!formData.firstName.trim()) {
    newErrors.firstName = 'First name is required';
  } else if (formData.firstName.trim().length < 2) {
    newErrors.firstName = 'First name must be at least 2 characters';
  }

  // Last Name validation
  if (!formData.lastName.trim()) {
    newErrors.lastName = 'Last name is required';
  } else if (formData.lastName.trim().length < 2) {
    newErrors.lastName = 'Last name must be at least 2 characters';
  }

  // Phone validation
  if (!formData.phoneNumber.trim()) {
    newErrors.phoneNumber = 'Phone number is required';
  } else if (!validatePhone(formData.phoneNumber)) {
    newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
  }

  // Email validation
  if (!formData.email.trim()) {
    newErrors.email = 'Email address is required';
  } else if (!validateEmail(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### 6.3 Real-time Error Clearing

```tsx
const handleInputChange = (field: keyof FormData, value: string) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
  
  // Clear error when user starts typing
  if (errors[field]) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }
};
```

### 6.4 Error Styling

```tsx
const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',  // Light red background
  },
  errorText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});
```

---

## 📁 File Structure Summary

```
src/
├── assets/
│   └── fonts/
│       ├── Poppins-Regular.ttf
│       ├── Poppins-Medium.ttf
│       ├── Poppins-SemiBold.ttf
│       └── Poppins-Bold.ttf
├── constants/
│   └── theme.ts                    # Colors, fonts, spacing
├── hooks/
│   └── useFonts.ts                 # Font loading hook
├── modules/
│   ├── splash/
│   │   ├── SplashScreen.tsx        # Splash screen with progress bar
│   │   ├── splashStore.ts          # Session state
│   │   └── splashApi.ts            # Session API
│   ├── login/
│   │   ├── LoginScreen.tsx         # Updated login screen
│   │   ├── loginStore.ts
│   │   └── loginApi.ts
│   ├── registration/
│   │   └── RegistrationScreen.tsx  # NEW: Registration form
│   └── home/
│       └── HomeScreen.tsx
└── navigation/
    └── AppNavigator.tsx            # Updated with Registration route
```

---

## 🎨 Design Decisions

### Why Poppins Font?

| Reason | Benefit |
|--------|---------|
| Modern geometric design | Clean, professional look |
| Excellent readability | Easy to read on mobile |
| Multiple weights | Flexibility in typography |
| Wide language support | International users |
| Open source (OFL) | Free for commercial use |

### Why Indigo (#6366F1) Primary Color?

| Reason | Benefit |
|--------|---------|
| Professional appearance | Suitable for business apps |
| Good contrast | Accessible on white backgrounds |
| Modern trend | Contemporary design aesthetic |
| Versatile | Works well with many accent colors |

### Animation Choices

| Animation | Purpose |
|-----------|---------|
| Spring scale | Natural, bouncy feel for logo |
| Linear progress | Clear loading indication |
| Fade in | Smooth appearance, not jarring |

---

## 🔗 Related Documentation

- [Expo Font](https://docs.expo.dev/versions/latest/sdk/font/)
- [React Native Animated](https://reactnative.dev/docs/animated)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Google Fonts - Poppins](https://fonts.google.com/specimen/Poppins)

---

## ✅ Milestone 2 Checklist

- [x] Splash screen with animated logo
- [x] Progress bar with percentage display
- [x] Custom Poppins fonts (4 weights)
- [x] Font loading hook
- [x] Theme constants file
- [x] Registration screen with form
- [x] Form validation (all fields)
- [x] Error display and clearing
- [x] Navigation updates
- [x] Login screen redesign
- [x] Keyboard-aware scrolling
- [x] Password visibility toggle (eye icon) on Login screen
- [x] Password visibility toggle (eye icon) on Registration screen

