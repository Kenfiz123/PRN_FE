import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize from stored tokens on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (e) {
          // Invalid stored data, clear it
          api.clearTokens();
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const response = await api.login(username, password);

      const userData = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.fullName,
        email: response.user.email,
        roles: response.user.roles,
        isActive: response.user.isActive,
        isLocked: response.user.isLocked,
        avatar: response.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (username, fullName, email, password) => {
    try {
      const response = await api.register(username, fullName, email, password);

      const userData = {
        id: response.user.id,
        username: response.user.username,
        name: response.user.fullName,
        email: response.user.email,
        roles: response.user.roles,
        isActive: response.user.isActive,
        isLocked: response.user.isLocked,
        avatar: response.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore logout API errors
    } finally {
      api.clearTokens();
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateProfile = useCallback((updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, [user]);

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) || false;
  }, [user]);

  const isAdmin = useCallback(() => {
    return hasRole('ADMIN') || hasRole('SYSTEM_ADMIN') || hasRole('STUDENT_AFFAIRS_ADMIN');
  }, [hasRole]);

  const isClubManager = useCallback(() => {
    return hasRole('CLUB_MANAGER');
  }, [hasRole]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      updateProfile,
      hasRole,
      isAdmin,
      isClubManager,
      api,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
