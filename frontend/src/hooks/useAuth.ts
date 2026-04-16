import { useContext } from 'react';
import { AuthContext } from '../contexts/authContextObject';
import type { AuthContextValue } from '../types/auth';

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
