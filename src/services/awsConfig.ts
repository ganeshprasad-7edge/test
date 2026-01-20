/**
 * AWS Amplify Configuration
 * 
 * To configure AWS Cognito:
 * 1. Create AWS Cognito User Pool in AWS Console
 * 2. Create Cognito Identity Pool for federated identities (Google)
 * 3. Configure Google OAuth in Cognito
 * 4. Replace the placeholder values below with your actual AWS credentials
 */

import type { ResourcesConfig } from 'aws-amplify';

export const awsConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_AWS_USER_POOL_ID || 'ap-south-1_n4TxMujXG',
      userPoolClientId: process.env.EXPO_PUBLIC_AWS_USER_POOL_CLIENT_ID || '3sm0gv6nvh5jbv9oos377iha2g',
      identityPoolId: process.env.EXPO_PUBLIC_AWS_IDENTITY_POOL_ID || 'ap-south-1:065f9dce-56d2-4845-be7f-f87a15f8c36c',
      signUpVerificationMethod: 'code' as const, // Use 'code' for OTP verification
      loginWith: {
        email: true,
        phone: true,
        username: false,
      },
    },
  },
};

// Google OAuth Configuration (used separately in Google Sign-In)
export const googleConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
};

// Static OTP for development/testing (remove in production)
export const STATIC_OTP = '123456';

export default awsConfig;
