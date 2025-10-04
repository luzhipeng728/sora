import jwt from 'jsonwebtoken';
import { UserModel, UserWithoutPassword } from '../models/User';
import { config } from '../config';

export interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<{
    user: UserWithoutPassword;
    token: string;
  }> {
    // Validate email format
    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength (min 8 characters)
    if (!data.password || data.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Create user
    const user = await UserModel.create({
      email: data.email,
      password: data.password,
      username: data.username,
    });

    // Generate JWT
    const token = this.generateJWT(user.id, user.email);

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<{
    user: UserWithoutPassword;
    token: string;
  }> {
    // Find user with password hash
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await UserModel.comparePassword(
      data.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateJWT(user.id, user.email);

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  /**
   * Generate JWT token
   */
  static generateJWT(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: '7d', // Token expires in 7 days
    });
  }

  /**
   * Validate JWT token
   */
  static validateJWT(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by token
   */
  static async getUserByToken(token: string): Promise<UserWithoutPassword> {
    const payload = this.validateJWT(token);
    const user = await UserModel.findById(payload.userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default AuthService;
