# Packages Usage Documentation

A comprehensive guide showing all packages used in the project and where they are being utilized.

---

## 📦 Dependencies

### Core React & React Native

#### `react` (v19.1.0)
**Purpose:** Core React library  
**Usage Locations:**
- All `.tsx` files in `src/modules/`
- `App.tsx`
- `src/navigation/AppNavigator.tsx`
- `src/hooks/useFonts.ts`
- `src/store/authStore.ts`

**Example:**
```tsx
import React from 'react';
```

---

#### `react-native` (v0.81.5)
**Purpose:** React Native core components and APIs  
**Usage Locations:**
- All screen components (`LoginScreen.tsx`, `RegistrationScreen.tsx`, `OtpScreen.tsx`, `HomeScreen.tsx`, `SplashScreen.tsx`)
- `App.tsx`

**Components Used:**
- `View`, `Text`, `TextInput`, `TouchableOpacity`, `ScrollView`, `KeyboardAvoidingView`, `ActivityIndicator`, `StyleSheet`, `Platform`, `Keyboard`, `Alert`, `Animated`, `Dimensions`, `Image`

**Example:**
```tsx
import { View, Text, TextInput, StyleSheet } from 'react-native';
```

---

### Navigation

#### `@react-navigation/native` (v7.1.27)
**Purpose:** Core navigation library for React Native  
**Usage Locations:**
- `src/navigation/AppNavigator.tsx` - `NavigationContainer`
- `src/modules/login/LoginScreen.tsx` - `useNavigation`
- `src/modules/registration/RegistrationScreen.tsx` - `useNavigation`
- `src/modules/otp/OtpScreen.tsx` - `useNavigation`, `useRoute`, `RouteProp`
- `src/modules/home/HomeScreen.tsx` - `useNavigation`
- `src/modules/splash/SplashScreen.tsx` - `useNavigation`

**Example:**
```tsx
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
```

---

#### `@react-navigation/native-stack` (v7.9.1)
**Purpose:** Stack navigator for React Navigation  
**Usage Locations:**
- `src/navigation/AppNavigator.tsx` - `createNativeStackNavigator`
- `src/modules/registration/RegistrationScreen.tsx` - `NativeStackNavigationProp`

**Example:**
```tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
```

---

### AWS Amplify & Cognito

#### `aws-amplify` (v6.15.10)
**Purpose:** AWS Amplify SDK for authentication and cloud services  
**Usage Locations:**
- `App.tsx` - `Amplify.configure()`
- `src/services/awsConfig.ts` - `ResourcesConfig` type
- `src/services/authService.ts` - Auth functions (`signUp`, `signIn`, `signOut`, `confirmSignUp`, `resendSignUpCode`, `getCurrentUser`, `fetchAuthSession`, `fetchUserAttributes`)

**Example:**
```tsx
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut } from 'aws-amplify/auth';
```

---

#### `@aws-amplify/react-native` (v1.3.2)
**Purpose:** React Native specific utilities for AWS Amplify  
**Usage Locations:**
- Used implicitly by `aws-amplify` for React Native platform support

---

#### `react-native-get-random-values` (v2.0.0)
**Purpose:** Polyfill for crypto.getRandomValues() required by AWS Amplify  
**Usage Locations:**
- `App.tsx` - **Must be imported at the very top** before any other imports

**Example:**
```tsx
import 'react-native-get-random-values'; // Required for AWS Amplify
```

**Critical:** This import must be at the top of the entry file to provide crypto polyfills.

---

### Authentication & Storage

#### `@react-native-async-storage/async-storage` (v2.2.0)
**Purpose:** Persistent key-value storage for React Native  
**Usage Locations:**
- `src/store/authStore.ts` - Saving/loading user profile
- `src/modules/splash/splashApi.ts` - Checking stored session

**Methods Used:**
- `AsyncStorage.setItem()` - Save user profile
- `AsyncStorage.getItem()` - Load user profile
- `AsyncStorage.removeItem()` - Clear storage on logout

**Example:**
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('@auth_user_profile', JSON.stringify(profile));
```

---

#### `@react-native-google-signin/google-signin` (v16.1.1)
**Purpose:** Google Sign-In for React Native  
**Usage Locations:**
- `src/services/authService.ts` - `GoogleSignin`, `isSuccessResponse`

**Methods Used:**
- `GoogleSignin.configure()` - Configure Google Sign-In
- `GoogleSignin.hasPlayServices()` - Check Play Services
- `GoogleSignin.signIn()` - Sign in with Google
- `GoogleSignin.getTokens()` - Get ID token
- `GoogleSignin.hasPreviousSignIn()` - Check previous sign-in
- `GoogleSignin.signOut()` - Sign out from Google

**Example:**
```tsx
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
```

---

### UI Components & Icons

#### `react-native-svg` (v15.15.1)
**Purpose:** SVG support for React Native  
**Usage Locations:**
- `src/modules/login/LoginScreen.tsx` - Google icon, Eye icons (password visibility)
- `src/modules/registration/RegistrationScreen.tsx` - Google icon, Eye icons (password visibility)

**Components Used:**
- `Svg`, `Path` - For custom icons

**Example:**
```tsx
import { Svg, Path } from 'react-native-svg';

const EyeIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="..." stroke={COLORS.gray500} />
  </Svg>
);
```

---

#### `react-native-safe-area-context` (v5.6.2)
**Purpose:** Safe area handling for notched devices  
**Usage Locations:**
- `src/modules/login/LoginScreen.tsx` - `SafeAreaView`
- `src/modules/registration/RegistrationScreen.tsx` - `SafeAreaView`
- `src/modules/otp/OtpScreen.tsx` - `SafeAreaView`

**Example:**
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={styles.container}>
  {/* Screen content */}
</SafeAreaView>
```

---

### State Management

#### `zustand` (v5.0.10)
**Purpose:** Lightweight state management library  
**Usage Locations:**
- `src/store/authStore.ts` - Main authentication store
- `src/modules/splash/splashStore.ts` - Splash screen session store
- `src/modules/login/loginStore.ts` - Login state store (legacy)

**Example:**
```tsx
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set, get) => ({
  userProfile: null,
  isAuthenticated: false,
  // ... actions
}));
```

---

### Expo Packages

#### `expo` (~54.0.31)
**Purpose:** Expo SDK core  
**Usage Locations:**
- `index.js` - `registerRootComponent`
- Build configuration
- All Expo features

**Example:**
```tsx
import { registerRootComponent } from 'expo';
```

---

#### `expo-font` (~14.0.10)
**Purpose:** Custom font loading for Expo  
**Usage Locations:**
- `src/hooks/useFonts.ts` - Loading Poppins fonts

**Methods Used:**
- `Font.loadAsync()` - Load custom fonts

**Example:**
```tsx
import * as Font from 'expo-font';

await Font.loadAsync({
  'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
  'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
  // ...
});
```

---

#### `expo-splash-screen` (~31.0.13)
**Purpose:** Control splash screen display  
**Usage Locations:**
- Used implicitly by Expo for splash screen management
- Configured in `app.json`

---

#### `expo-status-bar` (~3.0.9)
**Purpose:** Status bar component for Expo  
**Usage Locations:**
- Not directly imported (Expo handles it automatically)

---

### Other Dependencies

#### `react-native-config` (v1.6.1)
**Purpose:** Environment variable management  
**Usage Locations:**
- Configured but not actively used in current codebase
- Can be used for environment-specific configurations

---

#### `react-native-device-info` (v15.0.1)
**Purpose:** Device information utilities  
**Usage Locations:**
- Installed but not currently used in codebase
- Available for device-specific features

---

#### `react-native-gesture-handler` (v2.30.0)
**Purpose:** Native gesture handling (required by React Navigation)  
**Usage Locations:**
- Required dependency for `@react-navigation/native`
- Used implicitly by navigation library

---

#### `react-native-screens` (v4.19.0)
**Purpose:** Native screen components (required by React Navigation)  
**Usage Locations:**
- Required dependency for `@react-navigation/native-stack`
- Used implicitly by stack navigator

---

#### `react-native-toast-message` (v2.3.3)
**Purpose:** Toast notification library  
**Usage Locations:**
- `App.tsx` - Toast component (imported but not actively used)

**Example:**
```tsx
import Toast from 'react-native-toast-message';

return (
  <>
    <AppNavigator />
    <Toast />
  </>
);
```

---

## 🛠️ DevDependencies

### TypeScript

#### `@types/react` (~19.1.10)
**Purpose:** TypeScript definitions for React  
**Usage:** Type checking in all `.tsx` files

---

#### `typescript-eslint` (v8.53.0)
**Purpose:** TypeScript ESLint integration  
**Packages:**
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

**Usage:** Linting TypeScript files via ESLint configuration

---

### Linting & Formatting

#### `eslint` (v9.39.2)
**Purpose:** JavaScript/TypeScript linter  
**Usage:** Code quality checks via `npm run lint`

**Configuration:** `eslint.config.mjs`

---

#### `eslint-config-prettier` (v10.1.8)
**Purpose:** Disables ESLint rules that conflict with Prettier  
**Usage:** Integrated in ESLint config

---

#### `eslint-plugin-react` (v7.37.5)
**Purpose:** React-specific ESLint rules  
**Usage:** Linting React components

---

#### `prettier` (v3.7.4)
**Purpose:** Code formatter  
**Usage:** Code formatting via `npm run format`

---

### Build Tools

#### `babel-preset-expo` (^54.0.9)
**Purpose:** Babel preset for Expo  
**Usage:** Transpiling JavaScript/TypeScript in `babel.config.js`

---

#### `babel-plugin-module-resolver` (^5.0.2)
**Purpose:** Module path resolution for Babel  
**Usage:** Path aliases in `babel.config.js`

---

### Development Utilities

#### `react-native-reanimated` (^4.2.1)
**Purpose:** Advanced animation library  
**Usage:** Installed but not currently used (can be used for animations)

---

#### `react-native-svg-transformer` (^1.5.2)
**Purpose:** Transform SVG files for React Native  
**Usage:** SVG import support (configured in Metro bundler)

---

#### `@eslint/js` (^9.39.2)
**Purpose:** ESLint JavaScript plugin  
**Usage:** Base ESLint configuration

---

## 📊 Package Usage Summary

### By Category

| Category | Packages | Usage Count |
|----------|----------|-------------|
| **Core React/RN** | react, react-native | All files |
| **Navigation** | @react-navigation/* | 6 files |
| **AWS/Cognito** | aws-amplify, @aws-amplify/react-native | 3 files |
| **Storage** | @react-native-async-storage/async-storage | 2 files |
| **State Management** | zustand | 3 files |
| **UI Components** | react-native-svg, react-native-safe-area-context | 3 files |
| **Authentication** | @react-native-google-signin/google-signin | 1 file |
| **Fonts** | expo-font | 1 file |
| **Utilities** | react-native-get-random-values | 1 file (critical) |

### By File

| File | Packages Used |
|------|---------------|
| `App.tsx` | react, react-native, aws-amplify, react-native-get-random-values, react-native-toast-message |
| `src/store/authStore.ts` | zustand, @react-native-async-storage/async-storage, aws-amplify |
| `src/services/authService.ts` | aws-amplify, @react-native-google-signin/google-signin |
| `src/navigation/AppNavigator.tsx` | @react-navigation/native, @react-navigation/native-stack |
| `src/modules/login/LoginScreen.tsx` | @react-navigation/native, react-native-svg, react-native-safe-area-context |
| `src/modules/registration/RegistrationScreen.tsx` | @react-navigation/native, react-native-svg, react-native-safe-area-context |
| `src/modules/otp/OtpScreen.tsx` | @react-navigation/native, react-native-safe-area-context |
| `src/modules/splash/SplashScreen.tsx` | @react-navigation/native |
| `src/modules/splash/splashApi.ts` | @react-native-async-storage/async-storage, aws-amplify |
| `src/hooks/useFonts.ts` | expo-font |

---

## 🔑 Critical Dependencies

### Must-Have Packages

1. **`react-native-get-random-values`**
   - **Location:** `App.tsx` (top of file)
   - **Why:** Required polyfill for AWS Amplify crypto functions
   - **Order:** Must be imported before any other imports

2. **`@react-navigation/native` + `@react-navigation/native-stack`**
   - **Location:** All screen components
   - **Why:** Core navigation functionality

3. **`aws-amplify`**
   - **Location:** `App.tsx`, `src/services/`
   - **Why:** Authentication and AWS services

4. **`zustand`**
   - **Location:** `src/store/`
   - **Why:** State management for authentication

5. **`@react-native-async-storage/async-storage`**
   - **Location:** `src/store/authStore.ts`, `src/modules/splash/splashApi.ts`
   - **Why:** Persistent storage for user sessions

---

## 📝 Notes

### Unused Packages
- `react-native-config` - Installed but not actively used
- `react-native-device-info` - Installed but not actively used
- `react-native-reanimated` - Installed but not currently used
- `react-native-toast-message` - Imported in App.tsx but not actively used

### Optional Enhancements
- Consider using `react-native-reanimated` for smoother animations
- `react-native-toast-message` can be used for user notifications
- `react-native-config` can be used for environment-specific configurations

---

## 🔗 Related Documentation

- [Package.json](../package.json) - Full dependency list
- [MILESTONE_3_AUTH_OTP_AWS_COGNITO.md](./MILESTONE_3_AUTH_OTP_AWS_COGNITO.md) - AWS/Cognito setup
- [MILESTONE_2_SPLASH_FONTS_REGISTRATION.md](./MILESTONE_2_SPLASH_FONTS_REGISTRATION.md) - Font setup

---

## ✅ Package Installation Commands

```bash
# Core dependencies
npm install react react-native

# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# AWS Amplify
npm install aws-amplify @aws-amplify/react-native react-native-get-random-values

# Storage & Auth
npm install @react-native-async-storage/async-storage @react-native-google-signin/google-signin

# State Management
npm install zustand

# UI Components
npm install react-native-svg

# Expo
npx expo install expo-font expo-splash-screen expo-status-bar

# Dev Dependencies
npm install --save-dev typescript @types/react eslint prettier
```

---

**Last Updated:** Based on current codebase analysis  
**Total Dependencies:** 21  
**Total DevDependencies:** 13

