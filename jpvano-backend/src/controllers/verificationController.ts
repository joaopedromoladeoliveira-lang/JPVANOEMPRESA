import { Request, Response } from 'express';
import { User, Verification } from '../models/index.js';
import { NotFoundError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import crypto from 'crypto';

const hashFile = (data: Buffer): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const submitVerification = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.files || req.files.length === 0) {
    throw new Error('Arquivos de documento são obrigatórios');
  }

  const { documentType } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Check if user already has a pending verification
    const existingVerification = await Verification.findOne({
      where: { userId: req.userId },
    });

    if (existingVerification && existingVerification.status === 'pending') {
      throw new Error('Você já tem uma solicitação de verificação pendente');
    }

    // Store document file
    const documentFile = files.find((f) => f.fieldname === 'document');
    const selfieFile = files.find((f) => f.fieldname === 'selfie');

    if (!documentFile) {
      throw new Error('Documento é obrigatório');
    }

    const documentHash = hashFile(documentFile.buffer);
    const selfieHash = selfieFile ? hashFile(selfieFile.buffer) : null;

    const verification = await Verification.create({
      userId: req.userId,
      documentType,
      documentUrl: `/uploads/${documentFile.filename}`,
      documentHash,
      selfieUrl: selfieFile ? `/uploads/${selfieFile.filename}` : null,
      selfieHash,
      status: 'pending',
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: 'Solicitação de verificação enviada',
      verification,
    });
  } catch (error) {
    throw error;
  }
};

export const getMyVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const verification = await Verification.findOne({
      where: { userId: req.userId },
    });

    if (!verification) {
      return res.json({
        verification: null,
        message: 'Você ainda não enviou uma solicitação de verificação',
      });
    }

    res.json({
      verification: {
        ...verification.get(),
        documentUrl: undefined, // Don't expose file paths
        selfieUrl: undefined,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getVerificationDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { verificationId } = req.params;

  try {
    const verification = await Verification.findByPk(verificationId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] },
        },
      ],
    });

    if (!verification) {
      throw new NotFoundError('Verificação não encontrada');
    }

    res.json({
      verification,
    });
  } catch (error) {
    throw error;
  }
};

export const addVerificationNote = async (req: AuthenticatedRequest, res: Response) => {
  const { verificationId } = req.params;
  const { note } = req.body;

  try {
    const verification = await Verification.findByPk(verificationId);

    if (!verification) {
      throw new NotFoundError('Verificação não encontrada');
    }

    verification.verificationNotes = 
      (verification.verificationNotes ? verification.verificationNotes + '\n' : '') + note;
    
    await verification.save();

    res.json({
      message: 'Nota adicionada',
      verification,
    });
  } catch (error) {
    throw error;
  }
};

export const requestAdditionalInfo = async (req: AuthenticatedRequest, res: Response) => {
  const { verificationId } = req.params;
  const { info } = req.body;

  try {
    const verification = await Verification.findByPk(verificationId);

    if (!verification) {
      throw new NotFoundError('Verificação não encontrada');
    }

    verification.status = 'under_review';
    verification.verificationNotes = 
      (verification.verificationNotes ? verification.verificationNotes + '\n' : '') + 
      `[INFO SOLICITADA]: ${info}`;
    
    await verification.save();

    res.json({
      message: 'Informação adicional solicitada',
      verification,
    });
  } catch (error) {
    throw error;
  }
};
