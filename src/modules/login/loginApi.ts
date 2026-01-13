type Credentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  userId: string;
  email: string;
};

export const authenticate = async ({ email, password }: Credentials): Promise<AuthResponse> => {
  if (!email || !password) {
    throw new Error('Missing credentials');
  }
  // TODO: Replace with real API call
  // Example: const response = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { token: 'demo-token', userId: '123', email };
};
