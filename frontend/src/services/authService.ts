import api from './api';
import type { User, AuthResponse, RegisterRequest, LoginRequest } from '../../../shared/types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', data);

    // Store token and user
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data);

    // Store token and user
    if (response.data.token) {
      this.setToken(response.data.token);
      this.setUser(response.data.user);
    }

    return response.data;
  }

  /**
   * Get current user from server
   */
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    this.setUser(response.data);
    return response.data;
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored JWT token
   */
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set JWT token
   */
  static setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get stored user
   */
  static getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Set user
   */
  static setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export default AuthService;
