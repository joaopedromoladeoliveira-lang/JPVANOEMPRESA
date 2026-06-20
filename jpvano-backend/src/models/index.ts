import User from './User.js';
import Post from './Post.js';
import Comment from './Comment.js';
import Like from './Like.js';
import Follow from './Follow.js';
import Message from './Message.js';
import Verification from './Verification.js';
import Save from './Save.js';
import Report from './Report.js';
import Subscription from './Subscription.js';
import Advertisement from './Advertisement.js';
import Notification from './Notification.js';

// Define associations
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'postId' });

Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes' });
Like.belongsTo(Comment, { foreignKey: 'commentId' });

User.hasMany(Follow, { foreignKey: 'followerId', as: 'following' });
User.hasMany(Follow, { foreignKey: 'followingId', as: 'followers' });
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'following' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasOne(Verification, { foreignKey: 'userId', as: 'verification' });
Verification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Save, { foreignKey: 'userId', as: 'saves' });
Save.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Save, { foreignKey: 'postId', as: 'saves' });
Save.belongsTo(Post, { foreignKey: 'postId' });

User.hasMany(Report, { foreignKey: 'reportedById', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reportedById', as: 'reporter' });

User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Advertisement, { foreignKey: 'userId', as: 'advertisements' });
Advertisement.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export {
  User,
  Post,
  Comment,
  Like,
  Follow,
  Message,
  Verification,
  Save,
  Report,
  Subscription,
  Advertisement,
  Notification,
};

export default {
  User,
  Post,
  Comment,
  Like,
  Follow,
  Message,
  Verification,
  Save,
  Report,
  Subscription,
  Advertisement,
  Notification,
};
