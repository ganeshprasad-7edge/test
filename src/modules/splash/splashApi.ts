export type Session = {
  isAuthenticated: boolean;
  userId?: string;
  token?: string;
};

export const checkSession = async (): Promise<Session> => {
  // TODO: Replace with real API call
  // Example: const response = await fetch('/api/session');
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { isAuthenticated: false };
};
