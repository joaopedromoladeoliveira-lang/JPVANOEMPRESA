import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const generateVerificationToken = (): string => {
  return uuidv4() + uuidv4().replace(/-/g, '');
};

export const hashString = (str: string): string => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const generateNumericOTP = (length: number = 6): string => {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
};

export const generateResetToken = (): { token: string; hashedToken: string; expiresAt: Date } => {
  const token = generateToken();
  const hashedToken = hashString(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return { token, hashedToken, expiresAt };
};
