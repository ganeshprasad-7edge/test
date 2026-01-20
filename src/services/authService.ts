/**
 * Authentication Service - AWS Cognito
 * 
 * Handles all authentication-related operations using AWS Amplify/Cognito:
 * - Email/Password registration and login
 * - Google Sign-In (via Cognito Hosted UI or federated identity)
 * - OTP verification
 * - Token management
 */

import {
  signUp,
  signIn,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  signInWithRedirect,
  AuthUser,
} from 'aws-amplify/auth';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';

// User profile data extracted from authentication
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

// Registration data from form
export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
}

// Configure Google Sign-In
export const configureGoogleSignIn = (webClientId?: string) => {
  GoogleSignin.configure({
    webClientId: webClientId,
    offlineAccess: true,
  });
};

/**
 * Sign up a new user with email and password
 * Cognito will send a verification code to the email address
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  attributes?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }
): Promise<{ isSignUpComplete: boolean; userId?: string; nextStep: string }> => {
  try {
    console.log('Attempting signup for:', email);
    
    const result = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email, // Email will receive the OTP verification code
          // Only include name if provided (standard attribute)
          ...(attributes?.firstName && attributes?.lastName && {
            name: `${attributes.firstName} ${attributes.lastName}`,
          }),
          // Include phone_number if provided (must be in E.164 format: +1234567890)
          ...(attributes?.phoneNumber && {
            phone_number: attributes.phoneNumber.startsWith('+') 
              ? attributes.phoneNumber 
              : `+${attributes.phoneNumber}`,
          }),
        },
        autoSignIn: true,
      },
    });

    console.log('Signup result:', result);
    console.log('Next step:', result.nextStep.signUpStep);

    return {
      isSignUpComplete: result.isSignUpComplete,
      userId: result.userId,
      nextStep: result.nextStep.signUpStep,
    };
  } catch (error) {
    console.error('Sign Up Error:', error);
    throw error;
  }
};

/**
 * Confirm sign up with verification code
 */
export const confirmSignUpWithCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const result = await confirmSignUp({
      username: email,
      confirmationCode: code,
    });
    return result.isSignUpComplete;
  } catch (error) {
    console.error('Confirm Sign Up Error:', error);
    throw error;
  }
};

/**
 * Resend sign up confirmation code
 */
export const resendConfirmationCode = async (email: string): Promise<void> => {
  try {
    await resendSignUpCode({
      username: email,
    });
  } catch (error) {
    console.error('Resend Code Error:', error);
    throw error;
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserProfile> => {
  try {
    const result = await signIn({
      username: email,
      password,
    });

    if (result.isSignedIn) {
      return await getUserProfile();
    }

    // Handle additional auth steps if needed
    if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
      throw new Error('Please verify your email first');
    }

    throw new Error('Sign in incomplete');
  } catch (error) {
    console.error('Sign In Error:', error);
    throw error;
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    // Check for Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Sign in with Google
    const response = await GoogleSignin.signIn();
    
    if (!isSuccessResponse(response)) {
      throw new Error('Google Sign-In was cancelled or failed');
    }

    const { idToken } = await GoogleSignin.getTokens();
    const googleUser = response.data.user;

    // For Cognito federated sign-in, you would typically use:
    // await signInWithRedirect({ provider: 'Google' });
    // But for direct token-based auth, we create a profile from Google data

    const profile: UserProfile = {
      userId: googleUser.id,
      email: googleUser.email,
      displayName: googleUser.name,
      firstName: googleUser.givenName || undefined,
      lastName: googleUser.familyName || undefined,
      phoneNumber: null,
      emailVerified: true,
      idToken: idToken,
    };

    return profile;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const session = await fetchAuthSession();

    const profile: UserProfile = {
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

    return profile;
  } catch (error) {
    console.error('Get User Profile Error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user
 */
export const getAuthenticatedUser = async (): Promise<AuthUser | null> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch {
    return null;
  }
};

/**
 * Get auth session tokens
 */
export const getAuthTokens = async (): Promise<{
  accessToken?: string;
  idToken?: string;
} | null> => {
  try {
    const session = await fetchAuthSession();
    return {
      accessToken: session.tokens?.accessToken?.toString(),
      idToken: session.tokens?.idToken?.toString(),
    };
  } catch {
    return null;
  }
};

/**
 * Sign out from all providers
 */
export const signOutUser = async (global: boolean = false): Promise<void> => {
  try {
    // Sign out from Google if signed in
    const isGoogleSignedIn = await GoogleSignin.hasPreviousSignIn();
    if (isGoogleSignedIn) {
      await GoogleSignin.signOut();
    }
    
    // Sign out from Cognito
    await signOut({ global });
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};

export default {
  configureGoogleSignIn,
  signUpWithEmail,
  confirmSignUpWithCode,
  resendConfirmationCode,
  signInWithEmail,
  signInWithGoogle,
  getUserProfile,
  getAuthenticatedUser,
  getAuthTokens,
  signOutUser,
  isAuthenticated,
};
