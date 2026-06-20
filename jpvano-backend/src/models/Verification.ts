import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface VerificationAttributes {
  id: string;
  userId: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentUrl: string;
  documentHash: string;
  selfieUrl?: string;
  selfieHash?: string;
  verificationNotes?: string;
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface VerificationCreationAttributes extends Optional<VerificationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Verification extends Model<VerificationAttributes, VerificationCreationAttributes> implements VerificationAttributes {
  public id!: string;
  public userId!: string;
  public status!: 'pending' | 'under_review' | 'approved' | 'rejected';
  public documentType!: 'passport' | 'national_id' | 'drivers_license';
  public documentUrl!: string;
  public documentHash!: string;
  public selfieUrl?: string;
  public selfieHash?: string;
  public verificationNotes?: string;
  public rejectionReason?: string;
  public submittedAt!: Date;
  public reviewedAt?: Date;
  public reviewedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Verification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    documentType: {
      type: DataTypes.ENUM('passport', 'national_id', 'drivers_license'),
      allowNull: false,
    },
    documentUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documentHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    selfieUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    selfieHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Verification',
    tableName: 'verifications',
    timestamps: true,
  }
);

export default Verification;
