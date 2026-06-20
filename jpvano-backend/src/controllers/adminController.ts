import { Request, Response } from 'express';
import { User, Post, Report, Advertisement, Subscription, Verification } from '../models/index.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalPosts = await Post.count();
    const totalReports = await Report.count();
    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' },
    });

    const revenueResult = await Subscription.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue'],
      ],
      where: { status: 'active' },
      raw: true,
    });

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const usersGrowth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    res.json({
      stats: {
        totalUsers,
        totalPosts,
        totalReports,
        activeSubscriptions,
        totalRevenue,
        usersGrowth,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getFinancialDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Daily revenue
    const dailyRevenue = await Subscription.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'total'],
      ],
      where: {
        status: 'active',
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    });

    // Monthly revenue
    const monthlyRevenue = await Subscription.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'total'],
      ],
      where: {
        status: 'active',
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    });

    // Annual revenue
    const annualRevenue = await Subscription.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'total'],
      ],
      where: {
        status: 'active',
        updatedAt: {
          [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      },
      raw: true,
    });

    const activeSubscriptions = await Subscription.count({
      where: { status: 'active' },
    });

    res.json({
      financial: {
        dailyRevenue: dailyRevenue?.total || 0,
        monthlyRevenue: monthlyRevenue?.total || 0,
        annualRevenue: annualRevenue?.total || 0,
        activeSubscriptions,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const { limit = 50, offset = 0, status, role } = req.query;

  try {
    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    throw error;
  }
};

export const suspendUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { reason, duration } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.status = 'suspended';
    await user.save();

    res.json({
      message: 'Usuário suspenso',
      user,
    });
  } catch (error) {
    throw error;
  }
};

export const banUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { reason } = req.body;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.status = 'banned';
    await user.save();

    res.json({
      message: 'Usuário banido',
      user,
    });
  } catch (error) {
    throw error;
  }
};

export const grantVerification = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.verifiedBadge = true;
    await user.save();

    res.json({
      message: 'Badge de verificação concedido',
      user,
    });
  } catch (error) {
    throw error;
  }
};

export const removeVerification = async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.verifiedBadge = false;
    await user.save();

    res.json({
      message: 'Badge de verificação removido',
      user,
    });
  } catch (error) {
    throw error;
  }
};

export const getReports = async (req: Request, res: Response) => {
  const { status = 'pending', limit = 50, offset = 0 } = req.query;

  try {
    const reports = await Report.findAndCountAll({
      where: { status },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json(reports);
  } catch (error) {
    throw error;
  }
};

export const resolveReport = async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const { action } = req.body;

  try {
    const report = await Report.findByPk(reportId);

    if (!report) {
      throw new NotFoundError('Relatório não encontrado');
    }

    report.status = 'resolved';
    report.action = action;
    report.reviewedBy = req.userId;
    report.reviewedAt = new Date();
    await report.save();

    res.json({
      message: 'Relatório resolvido',
      report,
    });
  } catch (error) {
    throw error;
  }
};

export const getVerificationRequests = async (req: Request, res: Response) => {
  const { status = 'pending', limit = 50, offset = 0 } = req.query;

  try {
    const verifications = await Verification.findAndCountAll({
      where: { status },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['submittedAt', 'DESC']],
    });

    res.json(verifications);
  } catch (error) {
    throw error;
  }
};

export const approveVerification = async (req: AuthenticatedRequest, res: Response) => {
  const { verificationId } = req.params;
  const { notes } = req.body;

  try {
    const verification = await Verification.findByPk(verificationId);

    if (!verification) {
      throw new NotFoundError('Verificação não encontrada');
    }

    verification.status = 'approved';
    verification.verificationNotes = notes;
    verification.reviewedBy = req.userId;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update user
    const user = await User.findByPk(verification.userId);
    if (user) {
      user.verifiedBadge = true;
      user.isVerified = true;
      await user.save();
    }

    res.json({
      message: 'Verificação aprovada',
      verification,
    });
  } catch (error) {
    throw error;
  }
};

export const rejectVerification = async (req: AuthenticatedRequest, res: Response) => {
  const { verificationId } = req.params;
  const { reason } = req.body;

  try {
    const verification = await Verification.findByPk(verificationId);

    if (!verification) {
      throw new NotFoundError('Verificação não encontrada');
    }

    verification.status = 'rejected';
    verification.rejectionReason = reason;
    verification.reviewedBy = req.userId;
    verification.reviewedAt = new Date();
    await verification.save();

    res.json({
      message: 'Verificação rejeitada',
      verification,
    });
  } catch (error) {
    throw error;
  }
};
