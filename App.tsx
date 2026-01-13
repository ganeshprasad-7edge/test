import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { useFonts } from './src/hooks/useFonts';
import { COLORS } from './src/constants/theme';

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
});
