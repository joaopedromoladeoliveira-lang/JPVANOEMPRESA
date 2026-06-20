import { create } from 'zustand';
import { User, Post, Message, Notification } from '@/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
  setAuth: (user, accessToken, refreshToken) =>
    set({ user, accessToken, refreshToken, error: null }),
  clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => set({ user: null, accessToken: null, refreshToken: null }),
}));

interface UIStore {
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  darkMode: false,
  sidebarOpen: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

interface FeedStore {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  addPosts: (posts: Post[]) => void;
  setPosts: (posts: Post[]) => void;
  setLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  posts: [],
  isLoading: false,
  hasMore: true,
  addPosts: (newPosts) =>
    set((state) => ({ posts: [...state.posts, ...newPosts] })),
  setPosts: (posts) => set({ posts }),
  setLoading: (isLoading) => set({ isLoading }),
  setHasMore: (hasMore) => set({ hasMore }),
}));

interface MessagesStore {
  conversations: Message[];
  currentConversation: Message[] | null;
  unreadCount: number;
  addMessage: (message: Message) => void;
  setConversations: (conversations: Message[]) => void;
  setCurrentConversation: (conversation: Message[] | null) => void;
  setUnreadCount: (count: number) => void;
}

export const useMessagesStore = create<MessagesStore>((set) => ({
  conversations: [],
  currentConversation: null,
  unreadCount: 0,
  addMessage: (message) =>
    set((state) => ({
      currentConversation: state.currentConversation
        ? [...state.currentConversation, message]
        : null,
    })),
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: Notification[]) => void;
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  setNotifications: (notifications) => set({ notifications }),
}));
