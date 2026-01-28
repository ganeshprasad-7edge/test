import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProfile, logout, isLoading } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(); // This now properly signs out from Cognito
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' as never }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {userProfile?.firstName?.[0]?.toUpperCase() || 
               userProfile?.email?.[0]?.toUpperCase() || 
               '?'}
            </Text>
          </View>
          <Text style={styles.title}>Welcome!</Text>
          {userProfile?.displayName && (
            <Text style={styles.name}>{userProfile.displayName}</Text>
          )}
          {userProfile?.email && (
            <Text style={styles.email}>{userProfile.email}</Text>
          )}
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userProfile?.email || 'Not set'}</Text>
          </View>
          
          {userProfile?.firstName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>First Name</Text>
              <Text style={styles.infoValue}>{userProfile.firstName}</Text>
            </View>
          )}
          
          {userProfile?.lastName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Name</Text>
              <Text style={styles.infoValue}>{userProfile.lastName}</Text>
            </View>
          )}
          
          {userProfile?.phoneNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userProfile.phoneNumber}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Verified</Text>
            <Text style={[styles.infoValue, { color: userProfile?.emailVerified ? COLORS.success : COLORS.warning }]}>
              {userProfile?.emailVerified ? '✓ Verified' : 'Not verified'}
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, isLoggingOut && styles.signOutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut || isLoading}
          activeOpacity={0.8}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={COLORS.error} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontFamily: FONTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.gray500,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING['2xl'],
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.gray500,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.gray700,
    maxWidth: '60%',
    textAlign: 'right',
  },
  signOutButton: {
    height: 52,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.semiBold,
    color: COLORS.error,
  },
});

export default HomeScreen;
