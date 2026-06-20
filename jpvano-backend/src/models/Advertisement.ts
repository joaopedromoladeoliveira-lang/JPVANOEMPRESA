import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface AdvertisementAttributes {
  id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl?: string;
  budget: number;
  dailyBudget?: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  targetAudience?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AdvertisementCreationAttributes extends Optional<AdvertisementAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Advertisement extends Model<AdvertisementAttributes, AdvertisementCreationAttributes> implements AdvertisementAttributes {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public imageUrl!: string;
  public targetUrl?: string;
  public budget!: number;
  public dailyBudget?: number;
  public impressions!: number;
  public clicks!: number;
  public conversions!: number;
  public ctr!: number;
  public status!: 'draft' | 'pending' | 'active' | 'paused' | 'completed';
  public startDate!: Date;
  public endDate!: Date;
  public targetAudience?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Advertisement.init(
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
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dailyBudget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    impressions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    conversions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ctr: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'paused', 'completed'),
      defaultValue: 'draft',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    targetAudience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Advertisement',
    tableName: 'advertisements',
    timestamps: true,
  }
);

export default Advertisement;
