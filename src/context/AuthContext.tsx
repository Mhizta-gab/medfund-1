'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

type UserRole = 'user' | 'admin';

interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie));
      } catch (err) {
        // Invalid cookie, clear it
        Cookies.remove('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // In production, this would be an API call
    if (email === 'admin@medfund.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@medfund.com',
        role: 'admin',
      };
      // Set cookie first
      Cookies.set('user', JSON.stringify(adminUser), { expires: 7 }); // Expires in 7 days
      // Then update state
      setUser(adminUser);
      return adminUser;
    } else if (email === 'user@medfund.com' && password === 'user123') {
      const regularUser: User = {
        id: '2',
        email: 'user@medfund.com',
        role: 'user',
      };
      // Set cookie first
      Cookies.set('user', JSON.stringify(regularUser), { expires: 7 }); // Expires in 7 days
      // Then update state
      setUser(regularUser);
      return regularUser;
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    // Remove cookie first
    Cookies.remove('user');
    // Then update state
    setUser(null);
    // Finally navigate
    router.push('/login');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 