import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface FollowAttributes {
  id: string;
  followerId: string;
  followingId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt?: Date;
  updatedAt?: Date;
}

interface FollowCreationAttributes extends Optional<FollowAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Follow extends Model<FollowAttributes, FollowCreationAttributes> implements FollowAttributes {
  public id!: string;
  public followerId!: string;
  public followingId!: string;
  public status!: 'pending' | 'accepted' | 'blocked';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Follow.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
      defaultValue: 'accepted',
    },
  },
  {
    sequelize,
    modelName: 'Follow',
    tableName: 'follows',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId'],
      },
    ],
  }
);

export default Follow;
