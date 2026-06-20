import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface LikeAttributes {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: string;
  public userId!: string;
  public postId?: string;
  public commentId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Like.init(
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
  },
  {
    sequelize,
    modelName: 'Like',
    tableName: 'likes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId'],
        where: { postId: { [sequelize.where(sequelize.col('postId'), 'IS NOT', null)]: true } },
      },
      {
        unique: true,
        fields: ['userId', 'commentId'],
        where: { commentId: { [sequelize.where(sequelize.col('commentId'), 'IS NOT', null)]: true } },
      },
    ],
  }
);

export default Like;
