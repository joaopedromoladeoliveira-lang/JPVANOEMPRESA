import { Request, Response } from 'express';
import { User, Follow, Subscription } from '../models/index.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({
      where: { username },
      attributes: {
        exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'twoFactorSecret'],
      },
      include: [
        {
          model: Follow,
          as: 'followers',
          attributes: ['id'],
        },
        {
          model: Follow,
          as: 'following',
          attributes: ['id'],
        },
      ],
    });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const isFollowing = req.userId
      ? await Follow.count({
          where: {
            followerId: req.userId,
            followingId: user.id,
          },
        })
      : 0;

    res.json({
      user: {
        ...user.get(),
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        isFollowing: isFollowing > 0,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, bio, websiteUrl, isPrivate } = req.body;

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (websiteUrl !== undefined) user.websiteUrl = websiteUrl;
    if (isPrivate !== undefined) user.isPrivate = isPrivate;

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: user.getPublicProfile(),
    });
  } catch (error) {
    throw error;
  }
};

export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new Error('Nenhum arquivo enviado');
  }

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Foto de perfil atualizada',
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    throw error;
  }
};

export const uploadCoverImage = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    throw new Error('Nenhum arquivo enviado');
  }

  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    user.coverImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Imagem de capa atualizada',
      coverImage: user.coverImage,
    });
  } catch (error) {
    throw error;
  }
};

export const followUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId: targetUserId } = req.params;

  try {
    if (req.userId === targetUserId) {
      throw new ForbiddenError('Você não pode seguir a si mesmo');
    }

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const existingFollow = await Follow.findOne({
      where: {
        followerId: req.userId,
        followingId: targetUserId,
      },
    });

    if (existingFollow) {
      throw new Error('Você já está seguindo este usuário');
    }

    const follow = await Follow.create({
      followerId: req.userId,
      followingId: targetUserId,
      status: targetUser.isPrivate ? 'pending' : 'accepted',
    });

    res.status(201).json({
      message: 'Seguindo usuário',
      follow,
    });
  } catch (error) {
    throw error;
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response) => {
  const { userId: targetUserId } = req.params;

  try {
    const follow = await Follow.findOne({
      where: {
        followerId: req.userId,
        followingId: targetUserId,
      },
    });

    if (!follow) {
      throw new NotFoundError('Você não está seguindo este usuário');
    }

    await follow.destroy();

    res.json({
      message: 'Deixou de seguir usuário',
    });
  } catch (error) {
    throw error;
  }
};

export const getFollowers = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const followers = await Follow.findAndCountAll({
      where: {
        followingId: user.id,
        status: 'accepted',
      },
      include: [
        {
          model: User,
          as: 'follower',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json(followers);
  } catch (error) {
    throw error;
  }
};

export const getFollowing = async (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const following = await Follow.findAndCountAll({
      where: {
        followerId: user.id,
        status: 'accepted',
      },
      include: [
        {
          model: User,
          as: 'following',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json(following);
  } catch (error) {
    throw error;
  }
};

export const searchUsers = async (req: Request, res: Response) => {
  const { q = '', limit = 20 } = req.query;

  try {
    if (q.toString().length < 2) {
      return res.json({ users: [] });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${q}%` } },
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
        ],
        status: 'active',
      },
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
      limit: parseInt(limit as string),
    });

    res.json({ users });
  } catch (error) {
    throw error;
  }
};
