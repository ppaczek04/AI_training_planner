import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AuthContext } from './authContextObject';
import { mockAuthService } from '../services/mockAuthService';
import type { AuthContextValue, AuthCredentials, AuthUser } from '../types/auth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(() => mockAuthService.getCurrentUser());

  const login = useCallback(async (credentials: AuthCredentials) => {
    const nextUser = await mockAuthService.login(credentials);
    setUser(nextUser);
  }, []);

  const register = useCallback(async (credentials: AuthCredentials) => {
    const nextUser = await mockAuthService.register(credentials);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    mockAuthService.logout();
    setUser(null);
  }, []);

  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
  }), [login, logout, register, user]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
