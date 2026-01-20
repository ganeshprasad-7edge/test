import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSplashStore } from './splashStore';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = width * 0.7;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { checkSession, session, isLoading, error } = useSplashStore();
  const [progress, setProgress] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Fade in and scale animation for logo
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
  }, [fadeAnim, scaleAnim]);

  // Progress bar animation
  useEffect(() => {
    const animateProgress = () => {
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: 2500,
        useNativeDriver: false,
      }).start();
    };

    animateProgress();

    // Update progress state for text display
    const listener = progressAnim.addListener(({ value }) => {
      setProgress(Math.round(value));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, [progressAnim]);

  // Check session after animation starts
  useEffect(() => {
    const timer = setTimeout(() => {
      checkSession();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkSession]);

  // Navigate after session check and progress complete
  useEffect(() => {
    if (!isLoading && session !== null && progress >= 100) {
      const timer = setTimeout(() => {
        if (session.isAuthenticated) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isLoading, session, progress, navigation]);

  // Handle error
  useEffect(() => {
    if (error && progress >= 100) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [error, progress, navigation]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, PROGRESS_BAR_WIDTH],
  });

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />

      {/* Logo with animation */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* App Icon/Logo */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>T</Text>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Test App</Text>
        <Text style={styles.tagline}>Your trusted companion</Text>
      </Animated.View>

      {/* Progress Bar Section */}
      <Animated.View style={[styles.progressSection, { opacity: fadeAnim }]}>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>Loading... {progress}%</Text>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary,
    opacity: 0.95,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logoText: {
    fontSize: 56,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  appName: {
    fontSize: FONT_SIZES['3xl'],
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginTop: 24,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 8,
  },
  progressSection: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
  },
  progressBarContainer: {
    width: PROGRESS_BAR_WIDTH,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginTop: 12,
    opacity: 0.9,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.6,
  },
});

export default SplashScreen;
