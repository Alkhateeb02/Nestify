import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

const startupSecretSuffix = crypto.randomBytes(32).toString('hex');

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  jwtSecret: (process.env.JWT_SECRET || 'nestifyjwtdefaultsecret') + '_' + startupSecretSuffix,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  aiBaseUrl: process.env.AI_BASE_URL || 'http://127.0.0.1:8000',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 465,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
};

if (!config.jwtSecret) {
  console.error('❌ CRITICAL ERROR: JWT_SECRET is missing in .env!');
} else {
  console.log('✅ JWT Configuration Loaded (Secret starts with:', config.jwtSecret.substring(0, 3) + '...)');
}

