/**
 * Authentication Store (Zustand) - AWS Cognito
 * 
 * Manages authentication state across the application including:
 * - User profile data
 * - Authentication status
 * - Registration flow state
 * - OTP verification state
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  RegistrationData,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  confirmSignUpWithCode,
  resendConfirmationCode,
  signOutUser,
  getUserProfile,
  isAuthenticated as checkIsAuthenticated,
} from '../services/authService';

// Static OTP for testing (in production, this would be sent via SMS/Email by Cognito)
export const STATIC_OTP = '123456';

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
  setUserProfile: (profile: UserProfile | null) => void;
  setRegistrationData: (data: RegistrationData | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Auth operations
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserProfile>;
  registerUser: (data: RegistrationData & { password: string }) => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Session management
  checkAuthStatus: () => Promise<boolean>;
  
  // Persistence
  saveUserToStorage: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
  clearStorage: () => Promise<void>;
}

const AUTH_STORAGE_KEY = '@auth_user_profile';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationData: null,
  isRegistering: false,
  pendingEmail: null,
  isOtpSent: false,
  isVerifyingOtp: false,

  // Setters
  setUserProfile: (profile) => set({ userProfile: profile, isAuthenticated: !!profile }),
  
  setRegistrationData: (data) => set({ registrationData: data }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  // Login with email/password
  loginWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // First check if there's an existing session and sign out
      const isAlreadyAuth = await checkIsAuthenticated();
      if (isAlreadyAuth) {
        console.log('Existing session found, signing out first...');
        await signOutUser();
      }
      
      const profile = await signInWithEmail(email, password);
      set({
        userProfile: profile,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().saveUserToStorage();
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      let errorMessage = 'Login failed';
      
      if (err.name === 'UserNotConfirmedException') {
        errorMessage = 'Please verify your email first';
      } else if (err.name === 'NotAuthorizedException') {
        errorMessage = 'Invalid email or password';
      } else if (err.name === 'UserNotFoundException') {
        errorMessage = 'No account found with this email';
      } else if (err.name === 'UserAlreadyAuthenticatedException') {
        // User is already signed in, just get their profile
        try {
          const profile = await getUserProfile();
          set({
            userProfile: profile,
            isAuthenticated: true,
            isLoading: false,
          });
          await get().saveUserToStorage();
          return;
        } catch {
          errorMessage = 'Session error. Please try again.';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Login with Google
  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await signInWithGoogle();
      set({
        userProfile: profile,
        isAuthenticated: true,
        isLoading: false,
      });
      await get().saveUserToStorage();
      return profile;
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({ error: err.message || 'Google sign-in failed', isLoading: false });
      throw error;
    }
  },

  // Register new user
  registerUser: async (data: RegistrationData & { password: string }) => {
    set({ isRegistering: true, error: null, registrationData: data, pendingEmail: data.email });
    try {
      const result = await signUpWithEmail(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });

      if (result.nextStep === 'CONFIRM_SIGN_UP') {
        // User needs to verify email/phone
        set({ isOtpSent: true, isRegistering: false });
      } else if (result.isSignUpComplete) {
        // Auto sign-in was successful
        const profile = await getUserProfile();
        set({
          userProfile: profile,
          isAuthenticated: true,
          isRegistering: false,
        });
        await get().saveUserToStorage();
      }
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      let errorMessage = 'Registration failed';
      
      if (err.name === 'UsernameExistsException') {
        errorMessage = 'An account already exists with this email';
      } else if (err.name === 'InvalidPasswordException') {
        errorMessage = 'Password does not meet requirements';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      set({ error: errorMessage, isRegistering: false });
      throw error;
    }
  },

  // Verify OTP (Cognito confirmation code)
  verifyOtp: async (otp: string) => {
    set({ isVerifyingOtp: true, error: null });
    try {
      const { pendingEmail, registrationData } = get();
      
      // For testing with static OTP
      if (otp === STATIC_OTP) {
        // Simulate successful verification
        const profile: UserProfile = {
          userId: 'temp-user-id',
          email: pendingEmail || registrationData?.email || null,
          displayName: registrationData 
            ? `${registrationData.firstName} ${registrationData.lastName}`
            : null,
          firstName: registrationData?.firstName,
          lastName: registrationData?.lastName,
          phoneNumber: registrationData?.phoneNumber || null,
          emailVerified: true,
        };

        set({
          userProfile: profile,
          isAuthenticated: true,
          isVerifyingOtp: false,
          isOtpSent: false,
          pendingEmail: null,
          registrationData: null,
        });
        
        await get().saveUserToStorage();
        return true;
      }

      // For real Cognito verification
      if (pendingEmail) {
        const isConfirmed = await confirmSignUpWithCode(pendingEmail, otp);
        
        if (isConfirmed) {
          // Check if autoSignIn already authenticated the user
          const isAlreadyAuthenticated = await checkIsAuthenticated();
          
          if (isAlreadyAuthenticated) {
            // User was auto-signed in, just get their profile
            const profile = await getUserProfile();
            set({
              userProfile: profile,
              isAuthenticated: true,
              isVerifyingOtp: false,
              isOtpSent: false,
              pendingEmail: null,
              registrationData: null,
            });
            await get().saveUserToStorage();
            return true;
          }
          
          // If not auto-signed in, try to sign in with password
          if (registrationData?.password) {
            await get().loginWithEmail(pendingEmail, registrationData.password);
          }
          
          set({
            isVerifyingOtp: false,
            isOtpSent: false,
            pendingEmail: null,
            registrationData: null,
          });
          return true;
        }
      }
      
      set({ 
        error: 'Invalid verification code. Please try again.',
        isVerifyingOtp: false,
      });
      return false;
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      let errorMessage = 'Verification failed';
      
      if (err.name === 'CodeMismatchException') {
        errorMessage = 'Invalid verification code';
      } else if (err.name === 'ExpiredCodeException') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      set({ error: errorMessage, isVerifyingOtp: false });
      return false;
    }
  },

  // Resend OTP
  resendOtp: async () => {
    const { pendingEmail } = get();
    if (!pendingEmail) {
      set({ error: 'No pending verification' });
      return;
    }

    try {
      await resendConfirmationCode(pendingEmail);
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({ error: err.message || 'Failed to resend code' });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });
    try {
      await signOutUser();
      await get().clearStorage();
      set({
        userProfile: null,
        isAuthenticated: false,
        registrationData: null,
        pendingEmail: null,
        isOtpSent: false,
        isLoading: false,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({ error: err.message, isLoading: false });
    }
  },

  // Check authentication status
  checkAuthStatus: async () => {
    try {
      const authenticated = await checkIsAuthenticated();
      if (authenticated) {
        const profile = await getUserProfile();
        set({
          userProfile: profile,
          isAuthenticated: true,
        });
        await get().saveUserToStorage();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Save user profile to AsyncStorage
  saveUserToStorage: async () => {
    try {
      const { userProfile } = get();
      if (userProfile) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  // Load user profile from AsyncStorage
  loadUserFromStorage: async () => {
    try {
      const storedProfile = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedProfile) {
        const profile = JSON.parse(storedProfile) as UserProfile;
        set({
          userProfile: profile,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  },

  // Clear storage
  clearStorage: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
}));

export default useAuthStore;
