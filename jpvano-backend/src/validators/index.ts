import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../middleware/errorHandler.js';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    throw new ValidationError(formattedErrors[0].message);
  }
  next();
};

// Auth validators
export const registerValidator = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Nome de usuário deve ter 3-30 caracteres e conter apenas letras, números, _ e -'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Senha deve ter mínimo 8 caracteres com letra maiúscula, minúscula, número e caractere especial'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Primeiro nome é obrigatório'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Último nome é obrigatório'),
];

export const loginValidator = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

export const emailValidator = (): ValidationChain[] => [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('E-mail inválido'),
];

export const passwordResetValidator = (): ValidationChain[] => [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Senha deve ter mínimo 8 caracteres com letra maiúscula, minúscula, número e caractere especial'),
];

// Profile validators
export const updateProfileValidator = (): ValidationChain[] => [
  body('firstName')
    .optional()
    .trim()
    .notEmpty(),
  body('lastName')
    .optional()
    .trim()
    .notEmpty(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio não pode exceder 500 caracteres'),
  body('websiteUrl')
    .optional()
    .isURL()
    .withMessage('URL inválida'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate deve ser booleano'),
];

// Post validators
export const createPostValidator = (): ValidationChain[] => [
  body('content')
    .notEmpty()
    .withMessage('Conteúdo é obrigatório'),
  body('type')
    .isIn(['image', 'video', 'carousel', 'text', 'story', 'reel'])
    .withMessage('Tipo de post inválido'),
  body('description')
    .optional()
    .trim(),
];

// Comment validators
export const createCommentValidator = (): ValidationChain[] => [
  body('content')
    .notEmpty()
    .withMessage('Conteúdo do comentário é obrigatório')
    .isLength({ max: 1000 })
    .withMessage('Comentário não pode exceder 1000 caracteres'),
  param('postId')
    .isUUID()
    .withMessage('ID do post inválido'),
];

// UUID validator
export const uuidValidator = (paramName: string = 'id'): ValidationChain[] => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} deve ser um UUID válido`),
];

// Verification validator
export const verificationValidator = (): ValidationChain[] => [
  body('documentType')
    .isIn(['passport', 'national_id', 'drivers_license'])
    .withMessage('Tipo de documento inválido'),
];

// Advertisement validator
export const createAdvertisementValidator = (): ValidationChain[] => [
  body('title')
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage('Título é obrigatório e não pode exceder 100 caracteres'),
  body('description')
    .notEmpty()
    .isLength({ max: 500 })
    .withMessage('Descrição é obrigatória e não pode exceder 500 caracteres'),
  body('budget')
    .isFloat({ min: 0.01 })
    .withMessage('Orçamento deve ser maior que 0'),
  body('startDate')
    .isISO8601()
    .withMessage('Data de início inválida'),
  body('endDate')
    .isISO8601()
    .withMessage('Data de término inválida'),
];
