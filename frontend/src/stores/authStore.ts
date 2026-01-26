import { create } from 'zustand';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('auth/login', {
        json: { username, password },
      }).json<{
        success: boolean;
        data?: {
          token: string;
          user: User;
        };
        error?: {
          code: string;
          message: string;
        };
      }>();

      if (response.success && response.data) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error: any) {
      let errorMessage = 'ログイン中にエラーが発生しました';
      
      // Handle HTTP errors
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = 'ユーザー名またはパスワードが正しくありません';
        } else if (status === 403) {
          errorMessage = 'アカウントが無効化されています';
        } else if (status >= 500) {
          errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください';
        }
      } else if (error.message) {
        // Try to parse the backend error message
        try {
          const backendError = await error.response?.json();
          if (backendError?.error?.message) {
            errorMessage = backendError.error.message;
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      set({
        isLoading: false,
        error: errorMessage,
        user: null,
        token: null,
      });
      throw error;
    }
  },

  logout: async () => {
    const { token } = get();
    
    if (token) {
      try {
        // Call logout endpoint
        await api.post('auth/logout').json();
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with local cleanup even if API call fails
      }
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Clear state
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  loadUserFromToken: async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const response = await api.get('auth/me').json<{
        success: boolean;
        data?: User;
        error?: {
          code: string;
          message: string;
        };
      }>();

      if (response.success && response.data) {
        set({
          user: response.data,
          token,
          isLoading: false,
          error: null,
        });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Failed to load user from token:', error);
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
