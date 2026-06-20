import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SubscriptionAttributes {
  id: string;
  userId: string;
  tier: 'free' | 'pro' | 'creator';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  price: number;
  features: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: string;
  public userId!: string;
  public tier!: 'free' | 'pro' | 'creator';
  public status!: 'active' | 'inactive' | 'cancelled' | 'expired';
  public startDate!: Date;
  public endDate?: Date;
  public autoRenew!: boolean;
  public price!: number;
  public features!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
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
    tier: {
      type: DataTypes.ENUM('free', 'pro', 'creator'),
      defaultValue: 'free',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'cancelled', 'expired'),
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
  }
);

export default Subscription;
