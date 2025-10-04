import bcrypt from 'bcryptjs';
import { prisma } from '../db/client';
import type { User as PrismaUser } from '@prisma/client';

export type UserWithoutPassword = Omit<PrismaUser, 'passwordHash'>;

export class UserModel {
  /**
   * Hash password with bcrypt (12 rounds)
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a new user
   */
  static async create(data: {
    email: string;
    password: string;
    username?: string;
    avatarUrl?: string;
  }): Promise<UserWithoutPassword> {
    const passwordHash = await this.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        username: data.username,
        avatarUrl: data.avatarUrl,
      },
    });

    return this.excludePassword(user);
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<UserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.excludePassword(user) : null;
  }

  /**
   * Find user by ID (includes password hash for authentication)
   */
  static async findByIdWithPassword(id: string): Promise<PrismaUser | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    data: { username?: string; avatarUrl?: string }
  ): Promise<UserWithoutPassword> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.excludePassword(user);
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Remove password hash from user object
   */
  private static excludePassword(user: PrismaUser): UserWithoutPassword {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default UserModel;
