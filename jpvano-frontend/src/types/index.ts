export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePicture?: string;
  coverImage?: string;
  websiteUrl?: string;
  isPrivate: boolean;
  isVerified: boolean;
  verifiedBadge: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  author?: User;
  content: string;
  description?: string;
  type: 'image' | 'video' | 'carousel' | 'text' | 'story' | 'reel';
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isPublished: boolean;
  allowComments: boolean;
  allowShares: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  author?: User;
  content: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  sender?: User;
  recipient?: User;
  content: string;
  mediaUrls?: string[];
  messageType: 'text' | 'image' | 'video' | 'voice' | 'emoji';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'message' | 'mention' | 'verification' | 'system';
  title: string;
  content: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiError {
  error: {
    message: string;
    code: string;
    status: number;
  };
}
