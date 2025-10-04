import { create } from 'zustand';
import { AuthService } from '../services/authService';
import type { User, RegisterRequest, LoginRequest } from '../../../shared/types';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: AuthService.getUser(),
  isAuthenticated: AuthService.isAuthenticated(),
  isLoading: false,
  error: null,

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.register(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Registration failed',
      });
      throw error;
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await AuthService.login(data);
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.error || 'Login failed',
      });
      throw error;
    }
  },

  logout: () => {
    AuthService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  loadUser: async () => {
    if (!AuthService.isAuthenticated()) {
      return;
    }

    set({ isLoading: true });
    try {
      const user = await AuthService.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useUserStore;
