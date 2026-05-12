import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aeterna_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('LocalStorage access failed:', e);
    }
  }, []);

  const login = () => {
    try {
      const mockUser = {
        name: 'Curator',
        email: 'curator@aeterna.io',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Curator&backgroundColor=c5a059'
      };
      setUser(mockUser);
      localStorage.setItem('aeterna_auth', JSON.stringify(mockUser));
      console.log('User signed in:', mockUser.name);
    } catch (e) {
      console.error('Login storage failed:', e);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('aeterna_auth');
      console.log('User signed out');
    } catch (e) {
      console.error('Logout storage failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
