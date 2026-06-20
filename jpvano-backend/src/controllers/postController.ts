import { Request, Response } from 'express';
import { Post, Like, Comment, Save, User } from '../models/index.js';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Op } from 'sequelize';

export const createPost = async (req: AuthenticatedRequest, res: Response) => {
  const { content, type, description, mediaUrls } = req.body;

  try {
    const post = await Post.create({
      userId: req.userId,
      content,
      type,
      description,
      mediaUrls: mediaUrls || [],
      isPublished: true,
    });

    const postWithAuthor = await post.reload({
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
    });

    res.status(201).json({
      message: 'Post criado com sucesso',
      post: postWithAuthor,
    });
  } catch (error) {
    throw error;
  }
};

export const getPost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
            },
          ],
        },
      ],
    });

    if (!post) {
      throw new NotFoundError('Post não encontrado');
    }

    // Check if user liked
    const isLiked = req.userId
      ? await Like.count({ where: { userId: req.userId, postId } })
      : 0;

    // Check if user saved
    const isSaved = req.userId
      ? await Save.count({ where: { userId: req.userId, postId } })
      : 0;

    res.json({
      post: {
        ...post.get(),
        isLiked: isLiked > 0,
        isSaved: isSaved > 0,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getFeed = async (req: AuthenticatedRequest, res: Response) => {
  const { limit = 20, offset = 0 } = req.query;

  try {
    const posts = await Post.findAndCountAll({
      where: {
        isPublished: true,
        reportStatus: 'approved',
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    // Get likes and saves for current user
    const postsWithInteractions = posts.rows.map((post) => ({
      ...post.get(),
      isLiked: false,
      isSaved: false,
    }));

    if (req.userId) {
      const likes = await Like.findAll({
        where: {
          userId: req.userId,
          postId: posts.rows.map((p) => p.id),
        },
      });

      const saves = await Save.findAll({
        where: {
          userId: req.userId,
          postId: posts.rows.map((p) => p.id),
        },
      });

      const likeIds = likes.map((l) => l.postId);
      const saveIds = saves.map((s) => s.postId);

      postsWithInteractions.forEach((post) => {
        post.isLiked = likeIds.includes(post.id);
        post.isSaved = saveIds.includes(post.id);
      });
    }

    res.json({
      posts: postsWithInteractions,
      total: posts.count,
      hasMore: offset + posts.rows.length < posts.count,
    });
  } catch (error) {
    throw error;
  }
};

export const likePost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new NotFoundError('Post não encontrado');
    }

    const existingLike = await Like.findOne({
      where: { userId: req.userId, postId },
    });

    if (existingLike) {
      throw new Error('Você já curtiu este post');
    }

    await Like.create({
      userId: req.userId,
      postId,
    });

    post.likesCount += 1;
    await post.save();

    res.status(201).json({
      message: 'Post curtido',
    });
  } catch (error) {
    throw error;
  }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const like = await Like.findOne({
      where: { userId: req.userId, postId },
    });

    if (!like) {
      throw new NotFoundError('Você não curtiu este post');
    }

    await like.destroy();

    const post = await Post.findByPk(postId);
    if (post) {
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
    }

    res.json({
      message: 'Like removido',
    });
  } catch (error) {
    throw error;
  }
};

export const savePost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new NotFoundError('Post não encontrado');
    }

    const existingSave = await Save.findOne({
      where: { userId: req.userId, postId },
    });

    if (existingSave) {
      throw new Error('Você já salvou este post');
    }

    await Save.create({
      userId: req.userId,
      postId,
    });

    post.savesCount += 1;
    await post.save();

    res.status(201).json({
      message: 'Post salvo',
    });
  } catch (error) {
    throw error;
  }
};

export const unsavePost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const save = await Save.findOne({
      where: { userId: req.userId, postId },
    });

    if (!save) {
      throw new NotFoundError('Você não salvou este post');
    }

    await save.destroy();

    const post = await Post.findByPk(postId);
    if (post) {
      post.savesCount = Math.max(0, post.savesCount - 1);
      await post.save();
    }

    res.json({
      message: 'Post dessalvo',
    });
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await Post.findByPk(postId);

    if (!post) {
      throw new NotFoundError('Post não encontrado');
    }

    if (post.userId !== req.userId) {
      throw new ForbiddenError('Você não pode deletar este post');
    }

    await post.destroy();

    res.json({
      message: 'Post deletado',
    });
  } catch (error) {
    throw error;
  }
};

export const getUserPosts = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { limit = 20, offset = 0 } = req.query;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const posts = await Post.findAndCountAll({
      where: {
        userId: user.id,
        isPublished: true,
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      posts: posts.rows,
      total: posts.count,
    });
  } catch (error) {
    throw error;
  }
};
