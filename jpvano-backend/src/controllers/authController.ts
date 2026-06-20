import { Request, Response } from 'express';
import { User } from '../models/index.js';
import { generateAccessToken, generateRefreshToken } from '../config/auth.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { generateVerificationToken, generateResetToken, hashString } from '../utils/token.js';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../middleware/errorHandler.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response) => {
  const { email, username, password, firstName, lastName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado');
    }

    const existingUsername = await User.findOne({
      where: { username },
    });

    if (existingUsername) {
      throw new ConflictError('Nome de usuário já existe');
    }

    // Create verification token
    const emailVerificationToken = generateVerificationToken();

    // Create user
    const user = await User.create({
      email,
      username,
      password,
      firstName,
      lastName,
      emailVerificationToken,
      role: 'user',
      status: 'active',
    });

    // Send verification email
    await sendVerificationEmail(email, emailVerificationToken, username);

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso. Verifique seu e-mail.',
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      throw error;
    }
    throw error;
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    if (user.status === 'banned') {
      throw new UnauthorizedError('Sua conta foi banida');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Sua conta foi suspensa');
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('E-mail ou senha inválidos');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        message: '2FA requerido',
        requiresTwoFactor: true,
        userId: user.id,
      });
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: 'Login realizado com sucesso',
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundError('Token de verificação inválido ou expirado');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    res.json({
      message: 'E-mail verificado com sucesso',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message: 'Se o e-mail existe, você receberá um link de redefinição',
      });
    }

    const { token, hashedToken, expiresAt } = generateResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiresAt;
    await user.save();

    await sendPasswordResetEmail(email, token, user.firstName);

    res.json({
      message: 'Link de redefinição enviado para seu e-mail',
    });
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const hashedToken = hashString(token);

    const user = await User.findOne({
      where: { passwordResetToken: hashedToken },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedError('Token de redefinição inválido ou expirado');
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    throw error;
  }
};

export const enableTwoFactor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `JPvano (${user.email})`,
      issuer: 'JPvano',
      length: 32,
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    res.json({
      message: '2FA configuração iniciada',
      secret: secret.base32,
      qrCode,
    });
  } catch (error) {
    throw error;
  }
};

export const confirmTwoFactor = async (req: AuthenticatedRequest, res: Response) => {
  const { secret, token } = req.body;

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verify token
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedError('Código 2FA inválido');
    }

    user.twoFactorEnabled = true;
    user.twoFactorSecret = secret;
    await user.save();

    res.json({
      message: '2FA ativado com sucesso',
    });
  } catch (error) {
    throw error;
  }
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user || !user.twoFactorSecret) {
      throw new NotFoundError('2FA não configurado para este usuário');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new UnauthorizedError('Código 2FA inválido');
    }

    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: '2FA verificado com sucesso',
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token é obrigatório');
    }

    // Verify refresh token and get payload
    // Implementation depends on your token strategy

    res.json({
      message: 'Token renovado com sucesso',
      accessToken: refreshToken, // This should be a new access token
    });
  } catch (error) {
    throw error;
  }
};
