import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface MessageAttributes {
  id: string;
  senderId: string;
  recipientId?: string;
  conversationId?: string;
  content: string;
  mediaUrls?: string[];
  messageType: 'text' | 'image' | 'video' | 'voice' | 'emoji';
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public senderId!: string;
  public recipientId?: string;
  public conversationId?: string;
  public content!: string;
  public mediaUrls?: string[];
  public messageType!: 'text' | 'image' | 'video' | 'voice' | 'emoji';
  public isRead!: boolean;
  public readAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    recipientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mediaUrls: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'video', 'voice', 'emoji'),
      defaultValue: 'text',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
    timestamps: true,
    paranoid: true,
  }
);

export default Message;
