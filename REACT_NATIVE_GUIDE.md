# React Native Project Guide

A comprehensive guide to understanding this React Native + Expo project.

---

## 🏗️ Project Structure Overview

```
test/
├── index.js          # Entry point - registers the app
├── App.tsx           # Root component
├── src/
│   ├── navigation/   # Screen routing
│   ├── modules/      # Feature-based screens (splash, login, home)
│   ├── store/        # Global state management
│   ├── constants/    # App constants
│   ├── services/     # API services
│   ├── utils/        # Helper functions
│   └── assets/       # Images, fonts, etc.
├── android/          # Native Android code
├── ios/              # Native iOS code
└── package.json      # Dependencies & scripts
```

---

## 📚 Key Concepts

### 1. Entry Point (`index.js`)

```javascript
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

This registers your app with the native platform. Everything starts here.

---

### 2. Components (The Building Blocks)

React Native uses **components** instead of HTML elements:

| Web (HTML)       | React Native                      |
|------------------|-----------------------------------|
| `<div>`          | `<View>`                          |
| `<p>`, `<span>`  | `<Text>`                          |
| `<img>`          | `<Image>`                         |
| `<input>`        | `<TextInput>`                     |
| `<button>`       | `<Button>` / `<TouchableOpacity>` |
| `<ul>`, `<li>`   | `<FlatList>`                      |
| `<scroll>`       | `<ScrollView>`                    |

#### Example Component:

```tsx
import React from 'react';
import { View, Text, Button } from 'react-native';

const MyComponent = () => {
  return (
    <View>
      <Text>Hello World!</Text>
      <Button title="Press Me" onPress={() => console.log('Pressed!')} />
    </View>
  );
};

export default MyComponent;
```

---

### 3. Styling (No CSS - Use StyleSheet)

React Native uses **JavaScript objects** for styling, not CSS files:

```tsx
import { StyleSheet, View, Text } from 'react-native';

const MyComponent = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Hello</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
});
```

#### Key Differences from CSS:

| CSS                        | React Native StyleSheet         |
|----------------------------|---------------------------------|
| `background-color`         | `backgroundColor` (camelCase)   |
| `font-size: 16px`          | `fontSize: 16` (no px)          |
| `margin: 10px 20px`        | `marginVertical: 10, marginHorizontal: 20` |
| Cascading styles           | No cascading - styles are scoped |
| `display: block/inline`    | Flexbox by default              |

#### Common Flexbox Properties:

```javascript
{
  flex: 1,                    // Fill available space
  flexDirection: 'row',       // 'row' | 'column' (default)
  justifyContent: 'center',   // Main axis alignment
  alignItems: 'center',       // Cross axis alignment
  flexWrap: 'wrap',           // Wrap items
  gap: 10,                    // Gap between items
}
```

---

### 4. Navigation (Moving Between Screens)

This project uses **React Navigation** with a native stack navigator.

#### Setup (`src/navigation/AppNavigator.tsx`):

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Define your route types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

#### Navigation Methods:

```tsx
import { useNavigation } from '@react-navigation/native';

const MyScreen = () => {
  const navigation = useNavigation();

  // Navigate to a screen
  navigation.navigate('Home');

  // Navigate with params
  navigation.navigate('Details', { id: 123 });

  // Go back
  navigation.goBack();

  // Replace entire stack (useful for login/logout)
  navigation.reset({
    index: 0,
    routes: [{ name: 'Home' }],
  });
};
```

#### Accessing Route Params:

```tsx
import { useRoute } from '@react-navigation/native';

const DetailsScreen = () => {
  const route = useRoute();
  const { id } = route.params; // { id: 123 }
};
```

---

### 5. State Management with Zustand

This project uses **Zustand** - a lightweight state management library.

#### Creating a Store:

```tsx
// src/modules/login/loginStore.ts
import { create } from 'zustand';

interface LoginState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  // Initial state
  user: null,
  isLoading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authenticate({ email, password });
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  logout: () => set({ user: null }),
}));
```

#### Using the Store:

```tsx
import { useLoginStore } from './loginStore';

const LoginScreen = () => {
  const { user, login, isLoading, error } = useLoginStore();

  const handleLogin = async () => {
    await login('user@email.com', 'password');
  };

  return (
    <View>
      {isLoading && <Text>Loading...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};
```

---

### 6. React Hooks Reference

| Hook | Purpose | Example |
|------|---------|---------|
| `useState` | Local component state | `const [count, setCount] = useState(0)` |
| `useEffect` | Side effects (API calls, subscriptions) | `useEffect(() => { fetchData() }, [])` |
| `useNavigation` | Access navigation object | `navigation.navigate('Home')` |
| `useRoute` | Access route params | `const { id } = route.params` |
| `useCallback` | Memoize functions | `const fn = useCallback(() => {}, [deps])` |
| `useMemo` | Memoize values | `const value = useMemo(() => compute(), [deps])` |

#### useEffect Examples:

```tsx
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependency changes
useEffect(() => {
  fetchUser(userId);
}, [userId]);

// Cleanup on unmount
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

---

## 🚀 Common Commands

| Command | Description |
|---------|-------------|
| `npm run android:dev` | Run on Android (development) |
| `npm run android:dev-release` | Run on Android (release build) |
| `npm run ios:dev` | Run on iOS (development) |
| `npm run ios:dev-release` | Run on iOS (release build) |
| `npm start` | Start Metro bundler only |
| `npm run lint` | Check code for errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format code with Prettier |

---

## 📱 Build Variants

This project supports multiple environments:

| Environment | Android Command | App ID |
|-------------|-----------------|--------|
| Development | `npm run android:dev` | `com.test.develop` |
| QA | `npm run android:qa` | `com.test.qa` |
| Pre-prod | `npm run android:preprod` | `com.test.preprod` |
| Production | `npm run android:prod` | `com.test` |

---

## 🔄 Development Workflow

### Hot Reload
- Save a file → App updates automatically
- Changes to JavaScript/TypeScript are reflected instantly

### Metro Bundler Commands
| Key | Action |
|-----|--------|
| `r` | Reload the app |
| `m` | Toggle dev menu |
| `j` | Open debugger |
| `a` | Open on Android |
| `i` | Open on iOS |

### On Device
- **Shake phone** → Opens dev menu
- **Double tap R** → Reload (Android)

---

## 📁 File Organization Pattern

This project uses a **feature-based** structure:

```
src/modules/
├── login/
│   ├── LoginScreen.tsx    # UI Component
│   ├── loginStore.ts      # State management
│   └── loginApi.ts        # API calls
├── home/
│   └── HomeScreen.tsx
└── splash/
    ├── SplashScreen.tsx
    ├── splashStore.ts
    └── splashApi.ts
```

Each feature contains:
- **Screen** - The UI component
- **Store** - Zustand state management
- **API** - Network requests

---

## 🎯 Quick Tips

1. **Always wrap text in `<Text>`**
   ```tsx
   // ❌ Wrong - causes error
   <View>Hello</View>
   
   // ✅ Correct
   <View><Text>Hello</Text></View>
   ```

2. **Use `flex: 1` to fill space**
   ```tsx
   <View style={{ flex: 1 }}>
     {/* This fills the entire screen */}
   </View>
   ```

3. **Debug with console.log**
   - Output appears in Metro terminal
   - Use React DevTools for component inspection

4. **Handle keyboard on forms**
   ```tsx
   import { KeyboardAvoidingView, Platform } from 'react-native';
   
   <KeyboardAvoidingView 
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   >
     {/* Form content */}
   </KeyboardAvoidingView>
   ```

5. **Safe area for notches**
   ```tsx
   import { SafeAreaView } from 'react-native-safe-area-context';
   
   <SafeAreaView style={{ flex: 1 }}>
     {/* Content won't be hidden by notch */}
   </SafeAreaView>
   ```

---

## 🔧 Environment Setup Checklist

- [ ] Node.js >= 20.19.4
- [ ] Java JDK 17 (`JAVA_HOME` set)
- [ ] Android SDK (`ANDROID_HOME` set)
- [ ] Android SDK licenses accepted
- [ ] USB debugging enabled (for physical device)

### Environment Variables

Add to `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Android/sdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$JAVA_HOME/bin
```

---

## 📖 Useful Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Native Directory](https://reactnative.directory/) - Find libraries

---

## 🐛 Common Issues & Solutions

### "No Android device found"
```bash
# Check connected devices
adb devices

# Restart ADB
adb kill-server && adb start-server
```

### "JAVA_HOME not set"
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Metro bundler stuck
```bash
# Clear cache and restart
npx expo start --clear
```

### Build cache issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

