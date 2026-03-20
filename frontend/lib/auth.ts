import { api } from './api';
import { AuthResponse } from '../types';

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },
};

export const saveAuthData = (accessToken: string, refreshToken: string, user: object) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
};