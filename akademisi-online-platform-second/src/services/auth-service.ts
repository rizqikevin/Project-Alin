import api from './api';
import { User, UserRole } from '../types';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    console.log('Attempting login with:', credentials);
    const { data } = await api.post<LoginResponse>('/auth/login', credentials);
    console.log('Login response:', data);

    if (!data.token || !data.user) {
      throw new Error('Invalid response from server');
    }

    // Save token and user data
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    // Verify storage
    const verification = {
      hasToken: !!localStorage.getItem(TOKEN_KEY),
      hasUser: !!localStorage.getItem(USER_KEY),
      tokenLength: localStorage.getItem(TOKEN_KEY)?.length,
      userData: JSON.parse(localStorage.getItem(USER_KEY) || '{}')
    };
    console.log('Verification after storage:', verification);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: UserRole
): Promise<boolean> => {
  try {
    const { data } = await api.post<LoginResponse>('/auth/register', {
      name,
      email,
      password,
      role
    });

    if (data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = () => {
  console.log('Logging out - clearing auth data');
  console.log('localStorage after login:', localStorage.getItem('user_data'));
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  const hasToken = !!localStorage.getItem(TOKEN_KEY);
  const hasUser = !!localStorage.getItem(USER_KEY);
  const isAuth = hasToken && hasUser;
  
  console.log('Checking authentication:', {
    hasToken,
    hasUser,
    isAuth
  });
  
  return isAuth;
};

export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(USER_KEY);
  console.log('localStorage after login:', localStorage.getItem('user_data'));
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
}; 