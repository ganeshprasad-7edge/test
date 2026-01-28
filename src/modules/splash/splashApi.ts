import { isAuthenticated as checkIsAuthenticated, getUserProfile } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../store/authStore';

export type Session = {
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
};

const AUTH_STORAGE_KEY = '@auth_user_profile';

export const checkSession = async (): Promise<Session> => {
  try {
    // First, try to check if there's a valid Cognito session
    const isAuth = await checkIsAuthenticated();
    
    if (isAuth) {
      // User has a valid Cognito session, get their profile
      try {
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
      } catch (error) {
        console.error('Error getting user profile:', error);
        // Fall through to check AsyncStorage
      }
    }
    
    // If no valid Cognito session, check AsyncStorage for stored profile
    // This handles cases where the app was closed but user data is still stored
    const storedProfile = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        // Try to verify the stored session is still valid
        const isValidSession = await checkIsAuthenticated();
        if (isValidSession) {
          // Update authStore with stored profile
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
          const authStore = useAuthStore.getState();
          authStore.setUserProfile(null);
        }
      } catch (error) {
        console.error('Error parsing stored profile:', error);
        // Clear invalid stored data
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        const authStore = useAuthStore.getState();
        authStore.setUserProfile(null);
      }
    }
    
    // No valid session found
    return { isAuthenticated: false };
  } catch (error) {
    console.error('Error checking session:', error);
    return { isAuthenticated: false };
  }
};
