import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface SaveAttributes {
  id: string;
  userId: string;
  postId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SaveCreationAttributes extends Optional<SaveAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Save extends Model<SaveAttributes, SaveCreationAttributes> implements SaveAttributes {
  public id!: string;
  public userId!: string;
  public postId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Save.init(
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
      allowNull: false,
      references: {
        model: 'posts',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Save',
    tableName: 'saves',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'postId'],
      },
    ],
  }
);

export default Save;
