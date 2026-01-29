import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../modules/splash/SplashScreen';
import LoginScreen from '../modules/login/LoginScreen';
import RegistrationScreen from '../modules/registration/RegistrationScreen';
import OtpScreen from '../modules/otp/OtpScreen';
import HomeScreen from '../modules/home/HomeScreen';
import ChatScreen from '../modules/chat/ChatScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Registration: undefined;
  OTP: {
    phoneNumber?: string;
    email?: string;
  };
  Home: undefined;
  Chat: undefined;
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
      <Stack.Screen 
        name="OTP" 
        component={OtpScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
