'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, dbUtils, type User } from '@/lib/db';
import { apiService } from '@/lib/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  setToken: (token: string | null) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from IndexedDB on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if we have a stored session
        const allSessions = await db.sessions.toArray();
        if (allSessions.length > 0) {
          const session = allSessions[0];

          // Check if token is still valid
          if (session.expiresAt > Date.now()) {
            setTokenState(session.token);
            const userData = await dbUtils.getUser(session.userId);
            if (userData) {
              setUserState(userData);
            }
          } else {
            // Token expired, clear it
            await dbUtils.deleteSession(session.userId);
          }
        }
      } catch (error) {
        console.error('[v0] Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        user: any;
        token: string;
      }>('/auth/login', { email, password });

      const { user: backendUser, token: authToken } = response;

      // Map backend _id to frontend id
      const newUser: User = {
        id: backendUser._id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role,
        createdAt: new Date(backendUser.createdAt).getTime(),
      };

      await dbUtils.saveUser(newUser);
      await dbUtils.saveSession({
        id: `session-${newUser.id}`,
        userId: newUser.id,
        token: authToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        createdAt: Date.now(),
      });

      setUserState(newUser);
      setTokenState(authToken);

      console.log('[v0] User logged in:', email);
    } catch (error) {
      console.error('[v0] Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.post<{
        user: any;
        token: string;
      }>('/auth/register', { name, email, password, role });

      const { user: backendUser, token: authToken } = response;

      const newUser: User = {
        id: backendUser._id,
        email: backendUser.email,
        name: backendUser.name,
        role: backendUser.role as 'student' | 'teacher',
        createdAt: new Date(backendUser.createdAt).getTime(),
      };

      await dbUtils.saveUser(newUser);
      await dbUtils.saveSession({
        id: `session-${newUser.id}`,
        userId: newUser.id,
        token: authToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      });

      setUserState(newUser);
      setTokenState(authToken);

      console.log('[v0] User registered:', email);
    } catch (error) {
      console.error('[v0] Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await dbUtils.deleteSession(user.id);
        // Optionally clear other user data
        // await db.progress.where('userId').equals(user.id).delete();
      }
      setUserState(null);
      setTokenState(null);
    } catch (error) {
      console.error('[v0] Logout error:', error);
      throw error;
    }
  };

  const setToken = async (newToken: string | null) => {
    setTokenState(newToken);
    if (user && newToken) {
      await dbUtils.saveSession({
        id: `session-${user.id}`,
        userId: user.id,
        token: newToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      });
    }
  };

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      dbUtils.saveUser(newUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        setToken,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
