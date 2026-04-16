import type { AuthCredentials, AuthUser } from '../types/auth';

const AUTH_USER_KEY = 'ai-training-planner.auth-user';

const delay = (ms: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const createMockUser = (email: string): AuthUser => ({
  id: `mock-${email.toLowerCase()}`,
  email,
  createdAt: new Date().toISOString(),
});

export const mockAuthService = {
  getCurrentUser(): AuthUser | null {
    const rawValue = localStorage.getItem(AUTH_USER_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  },

  async login(credentials: AuthCredentials): Promise<AuthUser> {
    await delay(250);
    const user = createMockUser(credentials.email);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(credentials: AuthCredentials): Promise<AuthUser> {
    await delay(250);
    const user = createMockUser(credentials.email);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
