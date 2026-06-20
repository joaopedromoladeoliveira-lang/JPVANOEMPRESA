import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface PostAttributes {
  id: string;
  userId: string;
  content: string;
  description?: string;
  type: 'image' | 'video' | 'carousel' | 'text' | 'story' | 'reel';
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isPublished: boolean;
  allowComments: boolean;
  allowShares: boolean;
  reportedCount: number;
  reportStatus: 'pending' | 'reviewed' | 'approved' | 'removed';
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public userId!: string;
  public content!: string;
  public description?: string;
  public type!: 'image' | 'video' | 'carousel' | 'text' | 'story' | 'reel';
  public mediaUrls!: string[];
  public likesCount!: number;
  public commentsCount!: number;
  public sharesCount!: number;
  public savesCount!: number;
  public isPublished!: boolean;
  public allowComments!: boolean;
  public allowShares!: boolean;
  public reportedCount!: number;
  public reportStatus!: 'pending' | 'reviewed' | 'approved' | 'removed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Post.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('image', 'video', 'carousel', 'text', 'story', 'reel'),
      defaultValue: 'text',
    },
    mediaUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sharesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    savesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    allowShares: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    reportedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    reportStatus: {
      type: DataTypes.ENUM('pending', 'reviewed', 'approved', 'removed'),
      defaultValue: 'approved',
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
    paranoid: true,
  }
);

export default Post;
