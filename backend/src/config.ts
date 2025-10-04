import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  soraApiUrl: string;
  soraApiToken: string;
  frontendUrl: string;
}

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SORA_API_URL',
  'SORA_API_TOKEN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  soraApiUrl: process.env.SORA_API_URL!,
  soraApiToken: process.env.SORA_API_TOKEN!,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export default config;
