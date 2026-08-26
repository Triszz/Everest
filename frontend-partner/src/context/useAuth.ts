import { createContext, useContext } from 'react';
import type { PartnerRole, AuthState, AuthUser } from '../types/auth';

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Update the cached user fields (e.g. after profile change) without re-fetching */
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Re-export PartnerRole so other files can import both hook & type from here.
export type { PartnerRole };