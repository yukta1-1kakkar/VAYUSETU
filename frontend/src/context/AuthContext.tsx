import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_CREDENTIALS,
  AUTH_STORAGE_KEY,
  ROLE_PERMISSIONS,
  type AuthUser,
  type Permission,
} from '../constants/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function restoreSession(): AuthUser | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as Partial<AuthUser>;
    const knownUser = AUTH_CREDENTIALS.find(
      (credential) =>
        credential.email === parsed.email &&
        credential.role === parsed.role &&
        credential.name === parsed.name,
    );

    if (!knownUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return { name: knownUser.name, role: knownUser.role, email: knownUser.email };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(restoreSession);

  const login = useCallback(async (email: string, password: string) => {
    // Keep the transition perceptible and leave room for a future API call.
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    const normalizedEmail = email.trim().toLowerCase();
    const credential = AUTH_CREDENTIALS.find(
      (item) => item.email === normalizedEmail && item.password === password,
    );

    if (!credential) return false;

    const authenticatedUser: AuthUser = {
      name: credential.name,
      role: credential.role,
      email: credential.email,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: Permission) =>
      Boolean(user && ROLE_PERMISSIONS[user.role].includes(permission)),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout, hasPermission }),
    [user, login, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The provider and its colocated hook intentionally share this module.
// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
