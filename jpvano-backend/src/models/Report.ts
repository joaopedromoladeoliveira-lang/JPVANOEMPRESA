import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface ReportAttributes {
  id: string;
  reportedById: string;
  postId?: string;
  commentId?: string;
  userId?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  action?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReportCreationAttributes extends Optional<ReportAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: string;
  public reportedById!: string;
  public postId?: string;
  public commentId?: string;
  public userId?: string;
  public reason!: string;
  public description?: string;
  public status!: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  public action?: string;
  public reviewedBy?: string;
  public reviewedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reportedById: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'dismissed'),
      defaultValue: 'pending',
    },
    action: {
      type: DataTypes.STRING,
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
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
    timestamps: true,
  }
);

export default Report;
