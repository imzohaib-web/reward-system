'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('oyebunny_token');
    if (savedToken) {
      setToken(savedToken);
      authService
        .getMe()
        .then((res) => {
          if (res && res.data) {
            setUser(res.data);
          }
        })
        .catch((err) => {
          console.error('Session restoration error:', err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    setError(null);
    try {
      const res = await authService.login(credentials);
      if (res && res.data && res.data.token) {
        const authToken = res.data.token;
        const customer = res.data.customer;
        localStorage.setItem('oyebunny_token', authToken);
        setToken(authToken);
        setUser(customer);
        return { success: true, customer };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res && res.data && res.data.token) {
        const authToken = res.data.token;
        const customer = res.data.customer;
        localStorage.setItem('oyebunny_token', authToken);
        setToken(authToken);
        setUser(customer);
        return { success: true, customer };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      setError(err.message || 'Registration error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('oyebunny_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
