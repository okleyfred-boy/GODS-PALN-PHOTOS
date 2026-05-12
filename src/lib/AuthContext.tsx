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
      // Simulate a small delay for better UX
      const mockUser = {
        name: 'Curator',
        email: 'curator@aeterna.io',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Curator&backgroundColor=c5a059'
      };
      
      setUser(mockUser);
      
      try {
        localStorage.setItem('aeterna_auth', JSON.stringify(mockUser));
      } catch (storageErr) {
        console.warn('Persistent storage failed, session will be memory-only:', storageErr);
      }
      
      console.log('Login successful');
    } catch (e) {
      console.error('Login failed:', e);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      try {
        localStorage.removeItem('aeterna_auth');
      } catch (storageErr) {
        // Ignore storage errors on logout
      }
      console.log('Logout successful');
    } catch (e) {
      console.error('Logout failed:', e);
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
