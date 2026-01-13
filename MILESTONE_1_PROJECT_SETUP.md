# Milestone 1: React Native Project Setup

A comprehensive guide covering Expo bare workflow setup, multi-environment configuration, bundle IDs, package names, and linting.

---

## 📋 Table of Contents

1. [Expo Bare Workflow](#1-expo-bare-workflow)
2. [Multi-Environment Setup](#2-multi-environment-setup)
3. [Bundle ID vs Package Name](#3-bundle-id-vs-package-name)
4. [Different App Names per Environment](#4-different-app-names-per-environment)
5. [Different App Icons per Environment](#5-different-app-icons-per-environment)
6. [Linters Configuration](#6-linters-configuration)
7. [Project Scripts](#7-project-scripts)

---

## 1. Expo Bare Workflow

### What is Expo Bare Workflow?

Expo provides two workflows:

| Workflow | Description | Use Case |
|----------|-------------|----------|
| **Managed** | Expo handles native code | Quick prototypes, simple apps |
| **Bare** | You have access to native code | Production apps, custom native modules |

This project uses the **Bare Workflow**, giving you:
- Full access to `android/` and `ios/` folders
- Ability to add custom native modules
- Control over build configurations
- Product flavors for different environments

### Project Structure (Bare Workflow)

```
test/
├── android/                    # Native Android project
│   ├── app/
│   │   ├── build.gradle        # App-level build config
│   │   └── src/
│   │       ├── main/           # Main source set
│   │       ├── develop/        # Development flavor overrides
│   │       ├── qa/             # QA flavor overrides
│   │       └── preprod/        # Preprod flavor overrides
│   ├── build.gradle            # Project-level build config
│   └── settings.gradle
├── ios/                        # Native iOS project
│   ├── Podfile
│   └── test/
├── src/                        # JavaScript/TypeScript source
├── index.js                    # Entry point
├── app.json                    # Expo configuration
└── package.json
```

---

## 2. Multi-Environment Setup

### Why Multiple Environments?

| Environment | Purpose | Typical Use |
|-------------|---------|-------------|
| **Development** | Active development | Daily coding, debugging |
| **QA** | Quality Assurance testing | Bug testing, feature verification |
| **Preprod** | Pre-production staging | Final testing before release |
| **Production** | Live app for users | App Store / Play Store release |

### Android Product Flavors

Product flavors are defined in `android/app/build.gradle`:

```groovy
android {
    flavorDimensions = ["appType"]
    
    productFlavors {
        develop {
            dimension "appType"
            applicationIdSuffix ".develop"    // com.test.develop
        }
        qa {
            dimension "appType"
            applicationIdSuffix ".qa"         // com.test.qa
        }
        preprod {
            dimension "appType"
            applicationIdSuffix ".preprod"    // com.test.preprod
        }
        production {
            dimension "appType"
            // No suffix = com.test (production)
        }
    }
}
```

### Build Variants Matrix

Each flavor combines with build types (Debug/Release):

| Flavor | Build Type | Variant Name | App ID |
|--------|------------|--------------|--------|
| develop | Debug | `developDebug` | `com.test.develop` |
| develop | Release | `developRelease` | `com.test.develop` |
| qa | Debug | `qaDebug` | `com.test.qa` |
| qa | Release | `qaRelease` | `com.test.qa` |
| preprod | Debug | `preprodDebug` | `com.test.preprod` |
| preprod | Release | `preprodRelease` | `com.test.preprod` |
| production | Debug | `productionDebug` | `com.test` |
| production | Release | `productionRelease` | `com.test` |

### Environment Files (react-native-config)

The project uses `react-native-config` to manage environment variables:

```groovy
// android/app/build.gradle
project.ext.envConfigFiles = [
    developDebug: ".env.develop",
    developRelease: ".env.develop",
    qaDebug: ".env.qa",
    qaRelease: ".env.qa",
    preprodDebug: ".env.preprod",
    preprodRelease: ".env.preprod",
    productionDebug: ".env",
    productionRelease: ".env"
]
```

#### Creating Environment Files

Create these files in your project root:

**`.env.develop`**
```env
API_URL=https://dev-api.example.com
ENV_NAME=development
DEBUG_MODE=true
```

**`.env.qa`**
```env
API_URL=https://qa-api.example.com
ENV_NAME=qa
DEBUG_MODE=true
```

**`.env.preprod`**
```env
API_URL=https://preprod-api.example.com
ENV_NAME=preprod
DEBUG_MODE=false
```

**`.env` (Production)**
```env
API_URL=https://api.example.com
ENV_NAME=production
DEBUG_MODE=false
```

#### Using Environment Variables in Code

```typescript
import Config from 'react-native-config';

console.log(Config.API_URL);      // https://dev-api.example.com
console.log(Config.ENV_NAME);     // development
console.log(Config.DEBUG_MODE);   // true
```

---

## 3. Bundle ID vs Package Name

### What's the Difference?

| Term | Platform | Example | Purpose |
|------|----------|---------|---------|
| **Package Name** | Android | `com.test` | Unique identifier on Play Store |
| **Bundle ID** | iOS | `com.test` | Unique identifier on App Store |
| **Application ID** | Android | `com.test.develop` | Actual ID used at runtime |

### Android: Package Name vs Application ID

```groovy
// android/app/build.gradle
android {
    namespace "com.test"           // Package name (for code organization)
    
    defaultConfig {
        applicationId "com.test"   // Application ID (for Play Store)
    }
    
    productFlavors {
        develop {
            applicationIdSuffix ".develop"  // Final: com.test.develop
        }
    }
}
```

**Key Points:**
- `namespace` (Package Name): Used for Java/Kotlin code organization
- `applicationId`: The unique ID published to Play Store
- `applicationIdSuffix`: Appends to the base applicationId

### Why Different IDs per Environment?

Having different Application IDs allows you to:
1. **Install all versions simultaneously** on the same device
2. **Test side-by-side** (dev vs production)
3. **Separate analytics & crash reports** per environment
4. **Different signing keys** per environment

### Current Configuration

| Environment | Application ID | Can Install Together? |
|-------------|---------------|----------------------|
| Development | `com.test.develop` | ✅ Yes |
| QA | `com.test.qa` | ✅ Yes |
| Preprod | `com.test.preprod` | ✅ Yes |
| Production | `com.test` | ✅ Yes |

---

## 4. Different App Names per Environment

### How It Works

Android uses **resource overlays**. Each flavor can override resources from `main/`:

```
android/app/src/
├── main/res/values/strings.xml          # Default (Production)
├── develop/res/values/strings.xml       # Development override
├── qa/res/values/strings.xml            # QA override
└── preprod/res/values/strings.xml       # Preprod override
```

### Current App Names

**`main/res/values/strings.xml`** (Production)
```xml
<resources>
    <string name="app_name">test</string>
</resources>
```

**`develop/res/values/strings.xml`**
```xml
<resources>
    <string name="app_name">test Develop</string>
</resources>
```

**`qa/res/values/strings.xml`**
```xml
<resources>
    <string name="app_name">test QA</string>
</resources>
```

**`preprod/res/values/strings.xml`**
```xml
<resources>
    <string name="app_name">test Preprod</string>
</resources>
```

### Result on Device

| Environment | App Name Displayed |
|-------------|-------------------|
| Development | "test Develop" |
| QA | "test QA" |
| Preprod | "test Preprod" |
| Production | "test" |

---

## 5. Different App Icons per Environment

### Directory Structure

To have different icons per environment, create flavor-specific mipmap folders:

```
android/app/src/
├── main/res/
│   ├── mipmap-hdpi/
│   │   ├── ic_launcher.webp        # Default icon
│   │   └── ic_launcher_round.webp
│   ├── mipmap-mdpi/
│   ├── mipmap-xhdpi/
│   ├── mipmap-xxhdpi/
│   └── mipmap-xxxhdpi/
│
├── develop/res/                     # Development icons
│   ├── mipmap-hdpi/
│   │   ├── ic_launcher.webp        # Dev icon (e.g., with "DEV" badge)
│   │   └── ic_launcher_round.webp
│   ├── mipmap-mdpi/
│   ├── mipmap-xhdpi/
│   ├── mipmap-xxhdpi/
│   └── mipmap-xxxhdpi/
│
├── qa/res/                          # QA icons
│   └── mipmap-*/
│
└── preprod/res/                     # Preprod icons
    └── mipmap-*/
```

### Icon Sizes

| Density | Size (px) | Folder |
|---------|-----------|--------|
| mdpi | 48 × 48 | `mipmap-mdpi` |
| hdpi | 72 × 72 | `mipmap-hdpi` |
| xhdpi | 96 × 96 | `mipmap-xhdpi` |
| xxhdpi | 144 × 144 | `mipmap-xxhdpi` |
| xxxhdpi | 192 × 192 | `mipmap-xxxhdpi` |

### Creating Environment-Specific Icons

1. **Create base icon** (1024 × 1024 px recommended)
2. **Add visual differentiator**:
   - Development: Red "DEV" banner
   - QA: Yellow "QA" banner
   - Preprod: Orange "PRE" banner
   - Production: Clean icon (no banner)
3. **Generate all sizes** using tools like:
   - [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
   - [App Icon Generator](https://appicon.co/)
4. **Place in respective folders**

### How AndroidManifest Uses Icons

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    ...>
```

The build system automatically picks the correct icon based on the active flavor.

---

## 6. Linters Configuration

This project includes **ESLint** and **Prettier** for code quality.

### ESLint Setup

**`eslint.config.mjs`**
```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react,
    },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',      // Not needed in React 17+
      'react/prop-types': 'off',               // Using TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier,  // Disables rules that conflict with Prettier
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', '.expo/**', 'dist/**'],
  }
);
```

### Prettier Setup

**`.prettierrc`**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint + Prettier Rules Explained

| Rule | Value | Meaning |
|------|-------|---------|
| `semi` | `true` | Always use semicolons |
| `singleQuote` | `true` | Use `'string'` not `"string"` |
| `trailingComma` | `es5` | Trailing commas where valid in ES5 |
| `printWidth` | `100` | Wrap lines at 100 characters |
| `tabWidth` | `2` | Use 2 spaces for indentation |
| `react/react-in-jsx-scope` | `off` | React 17+ doesn't need `import React` |
| `@typescript-eslint/no-unused-vars` | `warn` | Warn on unused variables |

### Dependencies

```json
{
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "@typescript-eslint/eslint-plugin": "^8.53.0",
    "@typescript-eslint/parser": "^8.53.0",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-react": "^7.37.5",
    "prettier": "^3.7.4",
    "typescript-eslint": "^8.53.0"
  }
}
```

### Usage Commands

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format code
npm run format
```

---

## 7. Project Scripts

### All Available Scripts

```json
{
  "scripts": {
    // Development
    "start": "expo start --dev-client",
    
    // Android builds
    "android": "expo run:android",
    "android:dev": "expo run:android --variant=developDebug --app-id com.test.develop",
    "android:dev-release": "expo run:android --variant=developRelease --app-id com.test.develop",
    "android:qa": "expo run:android --variant=qaDebug --app-id com.test.qa",
    "android:qa-release": "expo run:android --variant=qaRelease --app-id com.test.qa",
    "android:preprod": "expo run:android --variant=preprodDebug --app-id com.test.preprod",
    "android:preprod-release": "expo run:android --variant=preprodRelease --app-id com.test.preprod",
    "android:prod": "expo run:android --variant=productionDebug --app-id com.test",
    "android:prod-release": "expo run:android --variant=productionRelease --app-id com.test",
    
    // iOS builds
    "ios": "expo run:ios",
    "ios:dev": "expo run:ios --scheme 'test Develop' --configuration 'Debug Develop'",
    "ios:dev-release": "expo run:ios --scheme 'test Develop' --configuration 'Release Develop'",
    "ios:qa": "expo run:ios --scheme 'test QA' --configuration 'Debug QA'",
    "ios:qa-release": "expo run:ios --scheme 'test QA' --configuration 'Release QA'",
    "ios:preprod": "expo run:ios --scheme 'test Preprod' --configuration 'Debug Preprod'",
    "ios:preprod-release": "expo run:ios --scheme 'test Preprod' --configuration 'Release Preprod'",
    "ios:prod": "expo run:ios --scheme 'test' --configuration 'Debug'",
    "ios:prod-release": "expo run:ios --scheme 'test' --configuration 'Release'",
    
    // Code quality
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\""
  }
}
```

### Quick Reference

| Task | Command |
|------|---------|
| Run dev build on Android | `npm run android:dev` |
| Run QA build on Android | `npm run android:qa` |
| Run production build | `npm run android:prod` |
| Check code for errors | `npm run lint` |
| Fix linting errors | `npm run lint:fix` |
| Format all code | `npm run format` |

---

## 📝 Summary

### What We Covered

| Topic | Key Takeaway |
|-------|--------------|
| **Expo Bare Workflow** | Full access to native code for production apps |
| **Product Flavors** | 4 environments: develop, qa, preprod, production |
| **Application IDs** | Unique IDs allow installing all versions side-by-side |
| **App Names** | Resource overlays provide different names per environment |
| **App Icons** | Flavor-specific mipmap folders for different icons |
| **Linting** | ESLint + Prettier ensure consistent code quality |

### Adding a New Environment

To add a new environment (e.g., "staging"):

1. **Add product flavor** in `android/app/build.gradle`:
   ```groovy
   staging {
       dimension "appType"
       applicationIdSuffix ".staging"
   }
   ```

2. **Create strings override**:
   ```
   android/app/src/staging/res/values/strings.xml
   ```

3. **Add env config**:
   ```groovy
   stagingDebug: ".env.staging",
   stagingRelease: ".env.staging",
   ```

4. **Create environment file**: `.env.staging`

5. **Add npm script**:
   ```json
   "android:staging": "expo run:android --variant=stagingDebug --app-id com.test.staging"
   ```

---

## 🔗 Related Documentation

- [Expo Bare Workflow](https://docs.expo.dev/bare/overview/)
- [Android Product Flavors](https://developer.android.com/build/build-variants)
- [react-native-config](https://github.com/luggit/react-native-config)
- [ESLint](https://eslint.org/docs/latest/)
- [Prettier](https://prettier.io/docs/en/)

