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
| OTP Resend Timer | 30-second countdown for resending OTP | ✅ |
| User Profile Storage | Store user data in AsyncStorage | ✅ |
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
       │                                           │
       ▼                                           │
┌──────────────┐     ┌──────────────┐              │
│    Login     │◄───►│ Registration │              │
│              │     │              │              │
└──────┬───────┘     └──────┬───────┘              │
       │                    │                      │
       │              ┌─────▼─────┐                │
       │              │    OTP    │                │
       │              │ Validation│                │
       │              └─────┬─────┘                │
       │                    │                      │
       ▼                    ▼                      ▼
┌──────────────────────────────────────────────────┐
│                     Home                         │
│                                                  │
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
- Google Sign-In button
- "or continue with" divider
- Cognito error handling

### 9.3 OTP Screen

Features:
- 6 individual OTP input boxes
- Auto-focus navigation
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
- [x] OTP resend timer (30 seconds)
- [x] Static OTP validation for testing
- [x] Registration screen with Cognito
- [x] Login screen with Google Sign-In
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
