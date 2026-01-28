# Milestone 3: User Authentication, OTP Validation & AWS Cognito Integration

A comprehensive guide covering user registration/login implementation, Google Sign-In integration, AWS Cognito authentication, and OTP validation system.

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [AWS Amplify Setup](#2-aws-amplify-setup)
3. [AWS Cognito Configuration](#3-aws-cognito-configuration)
4. [Authentication Service](#4-authentication-service)
5. [Google Sign-In Integration](#5-google-sign-in-integration)
6. [OTP Validation System](#6-otp-validation-system)
7. [Auth Store (State Management)](#7-auth-store-state-management)
8. [Navigation Flow](#8-navigation-flow)
9. [Screen Updates](#9-screen-updates)

---

## 1. Overview

### Features Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| Email/Password Auth | AWS Cognito Authentication with email and password | ✅ |
| Google Sign-In | OAuth 2.0 integration with Google | ✅ |
| OTP Validation | 6-digit OTP input with visual feedback | ✅ |
| **OTP Paste Support** | Paste full OTP code to auto-fill all fields | ✅ |
| OTP Resend Timer | 30-second countdown for resending OTP | ✅ |
| User Profile Storage | Store user data in AsyncStorage | ✅ |
| **Session Persistence** | App remembers login state after restart | ✅ |
| Cognito Token Management | Access and ID token handling | ✅ |

### Dependencies Added

```json
{
  "dependencies": {
    "aws-amplify": "^6.x.x",
    "@aws-amplify/react-native": "^1.x.x",
    "@react-native-async-storage/async-storage": "^2.x.x",
    "react-native-get-random-values": "^1.x.x",
    "@react-native-google-signin/google-signin": "^x.x.x"
  }
}
```

---

## 2. AWS Amplify Setup

### 2.1 Installation

```bash
npm install aws-amplify @aws-amplify/react-native @react-native-async-storage/async-storage react-native-get-random-values
```

### 2.2 Initialize in App.tsx

```typescript
import 'react-native-get-random-values'; // Required for AWS Amplify
import { configureAmplify } from './src/services/awsConfig';

// Initialize AWS Amplify
configureAmplify();

export default function App() {
  // ... app code
}
```

### 2.3 Polyfill Requirement

The `react-native-get-random-values` import must be at the **very top** of your entry file to provide crypto polyfills required by AWS Amplify.

---

## 3. AWS Cognito Configuration

**File:** `src/services/awsConfig.ts`

### 3.1 Configuration Structure

```typescript
import { Amplify } from 'aws-amplify';

const awsConfig = {
  Auth: {
    Cognito: {
      // REQUIRED - Amazon Cognito User Pool ID
      userPoolId: 'YOUR_USER_POOL_ID', // e.g., 'us-east-1_xxxxx'
      
      // REQUIRED - Amazon Cognito Web Client ID
      userPoolClientId: 'YOUR_USER_POOL_CLIENT_ID',
      
      // REQUIRED - AWS Region
      region: 'us-east-1',
      
      // OPTIONAL - Sign up verification method
      signUpVerificationMethod: 'code', // 'code' or 'link'
      
      // OPTIONAL - Login mechanisms
      loginWith: {
        email: true,
        phone: false,
        username: false,
      },
    },
  },
};

export const configureAmplify = () => {
  Amplify.configure(awsConfig);
};
```

### 3.2 AWS Console Setup

1. **Create User Pool** at [AWS Cognito Console](https://console.aws.amazon.com/cognito)

2. **Configure User Pool:**
   - Sign-in options: Email
   - Password policy: Set your requirements
   - MFA: Optional (for OTP via SMS)
   - Email: Configure SES for verification emails

3. **Create App Client:**
   - Authentication flows: ALLOW_USER_PASSWORD_AUTH
   - Token expiration: Configure as needed
   - OAuth flows: Optional for Google Sign-In

4. **Get Configuration Values:**
   - User Pool ID: `us-east-1_xxxxxxx`
   - App Client ID: `xxxxxxxxxxxxxxxxx`
   - Region: `us-east-1`

---

## 4. Authentication Service

**File:** `src/services/authService.ts`

### 4.1 User Profile Interface

```typescript
export interface UserProfile {
  userId: string;
  email: string | null;
  displayName: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  accessToken?: string;
  idToken?: string;
}
```

### 4.2 Sign Up with Email

```typescript
import { signUp } from 'aws-amplify/auth';

export const signUpWithEmail = async (
  email: string,
  password: string,
  attributes?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }
): Promise<{ isSignUpComplete: boolean; userId?: string; nextStep: string }> => {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name: `${attributes?.firstName} ${attributes?.lastName}`,
        phone_number: attributes?.phoneNumber ? `+1${attributes.phoneNumber}` : undefined,
      },
      autoSignIn: true,
    },
  });

  return {
    isSignUpComplete: result.isSignUpComplete,
    userId: result.userId,
    nextStep: result.nextStep.signUpStep,
  };
};
```

### 4.3 Confirm Sign Up (OTP Verification)

```typescript
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

export const confirmSignUpWithCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  const result = await confirmSignUp({
    username: email,
    confirmationCode: code,
  });
  return result.isSignUpComplete;
};

export const resendConfirmationCode = async (email: string): Promise<void> => {
  await resendSignUpCode({ username: email });
};
```

### 4.4 Sign In with Email

```typescript
import { signIn, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserProfile> => {
  const result = await signIn({
    username: email,
    password,
  });

  if (result.isSignedIn) {
    return await getUserProfile();
  }

  if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
    throw new Error('Please verify your email first');
  }

  throw new Error('Sign in incomplete');
};
```

### 4.5 Get User Profile

```typescript
export const getUserProfile = async (): Promise<UserProfile> => {
  const user = await getCurrentUser();
  const attributes = await fetchUserAttributes();
  const session = await fetchAuthSession();

  return {
    userId: user.userId,
    email: attributes.email || null,
    displayName: attributes.name || null,
    firstName: attributes['custom:firstName'] || undefined,
    lastName: attributes['custom:lastName'] || undefined,
    phoneNumber: attributes.phone_number || null,
    emailVerified: attributes.email_verified === 'true',
    accessToken: session.tokens?.accessToken?.toString(),
    idToken: session.tokens?.idToken?.toString(),
  };
};
```

### 4.6 Sign Out

```typescript
import { signOut } from 'aws-amplify/auth';

export const signOutUser = async (global: boolean = false): Promise<void> => {
  // Sign out from Google if signed in
  const isGoogleSignedIn = await GoogleSignin.hasPreviousSignIn();
  if (isGoogleSignedIn) {
    await GoogleSignin.signOut();
  }
  
  // Sign out from Cognito
  await signOut({ global });
};
```

---

## 5. Google Sign-In Integration

### 5.1 Configuration

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = (webClientId?: string) => {
  GoogleSignin.configure({
    webClientId: webClientId,
    offlineAccess: true,
  });
};
```

### 5.2 Sign-In Flow

```typescript
export const signInWithGoogle = async (): Promise<UserProfile> => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  
  if (!isSuccessResponse(response)) {
    throw new Error('Google Sign-In was cancelled or failed');
  }

  const { idToken } = await GoogleSignin.getTokens();
  const googleUser = response.data.user;

  return {
    userId: googleUser.id,
    email: googleUser.email,
    displayName: googleUser.name,
    firstName: googleUser.givenName || undefined,
    lastName: googleUser.familyName || undefined,
    phoneNumber: null,
    emailVerified: true,
    idToken: idToken,
  };
};
```

### 5.3 Federated Identity (Optional)

For full Cognito integration with Google, you can use Cognito's federated identity:

```typescript
// In Cognito User Pool, configure Google as an identity provider
// Then use:
import { signInWithRedirect } from 'aws-amplify/auth';

await signInWithRedirect({ provider: 'Google' });
```

---

## 6. OTP Validation System

**File:** `src/modules/otp/OtpScreen.tsx`

### 6.1 OTP Input Boxes

```
┌─────────────────────────────────┐
│       📱                        │
│   Verify Your Account           │
│   We've sent a 6-digit code to  │
│        ••••••1234               │
├─────────────────────────────────┤
│                                 │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│   │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │
│   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
│                                 │
│   For testing, use: 123456      │
│                                 │
│   ┌─────────────────────────┐   │
│   │      Verify OTP         │   │
│   └─────────────────────────┘   │
│                                 │
│   Didn't receive code?          │
│   Resend in 0:30                │
│                                 │
│   ← Change phone number         │
└─────────────────────────────────┘
```

### 6.2 Static OTP for Testing

```typescript
// In authStore.ts
export const STATIC_OTP = '123456';

// Verify OTP
verifyOtp: async (otp: string) => {
  if (otp === STATIC_OTP) {
    // Success - mark as authenticated
    set({ isAuthenticated: true });
    return true;
  } else {
    set({ error: 'Invalid OTP. Please try again.' });
    return false;
  }
};
```

### 6.3 Cognito OTP Verification

For production, use Cognito's confirmation:

```typescript
verifyOtp: async (otp: string) => {
  const { pendingEmail } = get();
  
  if (pendingEmail) {
    const isConfirmed = await confirmSignUpWithCode(pendingEmail, otp);
    if (isConfirmed) {
      // Auto sign-in after confirmation
      await get().loginWithEmail(pendingEmail, password);
      return true;
    }
  }
  return false;
};
```

### 6.4 Resend Timer

```typescript
const RESEND_TIMER_SECONDS = 30;

const handleResendOtp = async () => {
  if (!canResend) return;
  
  setResendTimer(RESEND_TIMER_SECONDS);
  setCanResend(false);
  
  // For Cognito
  await resendConfirmationCode(email);
};
```

### 6.5 OTP Paste Functionality

The OTP screen now supports pasting the full OTP code. When a user copies a 6-digit code and pastes it into any OTP input field, all 6 fields are automatically filled.

**Implementation:**

```typescript
const handleOtpChange = useCallback((value: string, index: number) => {
  // Only allow digits
  const digits = value.replace(/[^0-9]/g, '');
  
  // Detect paste: if pasted value has multiple digits
  if (digits.length >= OTP_LENGTH) {
    // Handle paste of full OTP (6+ digits)
    const otpDigits = digits.slice(0, OTP_LENGTH).split('');
    setOtp(otpDigits);
    inputRefs.current[OTP_LENGTH - 1]?.focus();
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
    
    // Focus on the next empty field
    const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
    
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
  // ... rest of the logic
}, [otp]);
```

**Features:**
- First input field accepts up to 6 characters to detect paste
- Full OTP paste (6 digits): Auto-fills all fields and auto-verifies
- Partial OTP paste (2-5 digits): Distributes digits from current position
- Auto-verification when all 6 digits are entered
- Works seamlessly with normal single-digit typing

---

## 7. Auth Store (State Management)

**File:** `src/store/authStore.ts`

### 7.1 State Interface

```typescript
interface AuthState {
  // User data
  userProfile: UserProfile | null;
  
  // Auth status
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Registration flow
  registrationData: RegistrationData | null;
  isRegistering: boolean;
  pendingEmail: string | null;
  
  // OTP verification
  isOtpSent: boolean;
  isVerifyingOtp: boolean;
  
  // Actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserProfile>;
  registerUser: (data: RegistrationData & { password: string }) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
}
```

### 7.2 Error Handling

```typescript
loginWithEmail: async (email, password) => {
  try {
    const profile = await signInWithEmail(email, password);
    set({ userProfile: profile, isAuthenticated: true });
    await get().saveUserToStorage(); // Persist to AsyncStorage
  } catch (error) {
    let errorMessage = 'Login failed';
    
    if (error.name === 'UserNotConfirmedException') {
      errorMessage = 'Please verify your email first';
    } else if (error.name === 'NotAuthorizedException') {
      errorMessage = 'Invalid email or password';
    } else if (error.name === 'UserNotFoundException') {
      errorMessage = 'No account found with this email';
    }
    
    set({ error: errorMessage });
    throw error;
  }
};
```

### 7.3 Session Persistence

The app now remembers the user's login state after closing and reopening the app. This is achieved through:

1. **Saving user profile to AsyncStorage** after successful login
2. **Checking session on app startup** via SplashScreen
3. **Validating Cognito session** and restoring user state

**Session Check Implementation:**

```typescript
// src/modules/splash/splashApi.ts
export const checkSession = async (): Promise<Session> => {
  try {
    // First, check if there's a valid Cognito session
    const isAuth = await checkIsAuthenticated();
    
    if (isAuth) {
      // User has a valid Cognito session, get their profile
      const profile = await getUserProfile();
      
      // Update authStore with the profile
      const authStore = useAuthStore.getState();
      authStore.setUserProfile(profile);
      await authStore.saveUserToStorage();
      
      return {
        isAuthenticated: true,
        userId: profile.userId,
        token: profile.idToken || profile.accessToken,
      };
    }
    
    // If no valid Cognito session, check AsyncStorage
    const storedProfile = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      const isValidSession = await checkIsAuthenticated();
      
      if (isValidSession) {
        const authStore = useAuthStore.getState();
        authStore.setUserProfile(profile);
        return {
          isAuthenticated: true,
          userId: profile.userId,
          token: profile.idToken || profile.accessToken,
        };
      } else {
        // Session expired, clear stored data
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    
    return { isAuthenticated: false };
  } catch (error) {
    return { isAuthenticated: false };
  }
};
```

**How It Works:**
1. On app startup, SplashScreen calls `checkSession()`
2. `checkSession()` verifies if there's a valid AWS Cognito session
3. If authenticated, it loads the user profile and updates the authStore
4. SplashScreen navigates to Home if authenticated, Login if not
5. User profile is persisted in AsyncStorage for faster subsequent checks

---

## 8. Navigation Flow

### 8.1 Authentication Flow Diagram

```
┌──────────────┐
│    Splash    │
│   (2.5 sec)  │
└──────┬───────┘
       │
       ▼
       Check Session
       │
       ├── Authenticated ──────────────────────────┐
       │   (Session Persisted)                     │
       │                                           │
       ▼                                           │
┌──────────────┐     ┌──────────────┐              │
│    Login     │◄───►│ Registration │              │
│  (Password   │     │  (Password   │              │
│   Visibility)│     │   Visibility)│              │
└──────┬───────┘     └──────┬───────┘              │
       │                    │                      │
       │              ┌─────▼─────┐                │
       │              │    OTP    │                │
       │              │ (Paste    │                │
       │              │  Support) │                │
       │              └─────┬─────┘                │
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────────────────────────────────────────┐
│                     Home                         │
│         (Session Persisted on Restart)           │
└──────────────────────────────────────────────────┘
```

### 8.2 Route Types

```typescript
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Registration: undefined;
  OTP: {
    phoneNumber?: string;
    email?: string;
  };
  Home: undefined;
};
```

---

## 9. Screen Updates

### 9.1 Registration Screen

Features:
- Form validation
- Google Sign-In button
- Navigation to OTP screen
- Error handling for Cognito errors

### 9.2 Login Screen

Features:
- Email/password login
- **Password visibility toggle** (eye icon to show/hide password)
- Google Sign-In button
- "or continue with" divider
- Cognito error handling

### 9.3 OTP Screen

Features:
- 6 individual OTP input boxes
- **OTP Paste Functionality**: Paste full 6-digit code to auto-fill all fields
- Auto-focus navigation
- Auto-verification when all digits are entered
- 30-second resend timer
- Static OTP for testing (123456)

---

## 📁 File Structure

```
src/
├── services/
│   ├── awsConfig.ts             # AWS Amplify configuration
│   └── authService.ts           # Auth operations (Cognito)
├── store/
│   └── authStore.ts             # Zustand auth state
├── modules/
│   ├── login/
│   │   └── LoginScreen.tsx      # Login with Google Sign-In
│   ├── registration/
│   │   └── RegistrationScreen.tsx  # Registration with Cognito
│   ├── otp/
│   │   └── OtpScreen.tsx        # OTP validation
│   └── ...
└── navigation/
    └── AppNavigator.tsx         # Navigation routes
```

---

## 🔐 AWS Cognito Error Codes

| Error Name | Description | User Message |
|------------|-------------|--------------|
| `UserNotConfirmedException` | Email not verified | "Please verify your email first" |
| `NotAuthorizedException` | Wrong password | "Invalid email or password" |
| `UserNotFoundException` | User doesn't exist | "No account found with this email" |
| `UsernameExistsException` | Email already registered | "An account already exists with this email" |
| `InvalidPasswordException` | Password doesn't meet requirements | "Password does not meet requirements" |
| `CodeMismatchException` | Wrong OTP code | "Invalid verification code" |
| `ExpiredCodeException` | OTP expired | "Verification code has expired" |

---

## ✅ Milestone 3 Checklist

- [x] AWS Amplify packages installed
- [x] AWS Cognito configuration
- [x] Authentication service with Cognito
- [x] Google Sign-In integration
- [x] Zustand auth store with persistence
- [x] OTP screen with 6 input boxes
- [x] Auto-focus between OTP inputs
- [x] **OTP paste functionality** (paste full code to auto-fill)
- [x] OTP resend timer (30 seconds)
- [x] Static OTP validation for testing
- [x] Registration screen with Cognito
- [x] Login screen with Google Sign-In
- [x] **Session persistence** (app remembers login state)
- [x] Navigation flow with OTP screen
- [x] Error handling throughout

---

## 🔗 Related Documentation

- [AWS Amplify Auth](https://docs.amplify.aws/react-native/build-a-backend/auth/)
- [AWS Cognito](https://docs.aws.amazon.com/cognito/)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Zustand State Management](https://github.com/pmndrs/zustand)

---

## 🚀 Next Steps for Production

1. **Set up AWS Cognito User Pool** in AWS Console
2. **Configure environment variables** for User Pool ID and Client ID
3. **Set up email verification** via Amazon SES
4. **Configure Google OAuth** in Cognito for federated identity
5. **Replace static OTP** with Cognito's built-in verification
