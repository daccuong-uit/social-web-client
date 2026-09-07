/**
 * @fileoverview Social domain models
 * Defines core data models for the social feature
 */

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isMuted: boolean;
  joinedAt?: Date;
  website?: string;
}

export interface Post {
  id: string;
  author: User;
  type?: string;
  content: string;
  images: string[];
  video?: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount?: number;
  isLiked: boolean;
  isBookmarked: boolean;
  hashtags: string[];
  mentions: string[];
  privacy: PostPrivacy;
  isPinned: boolean;
  allowComments: boolean;
  location?: string;
  originalPost?: Post;
}

export type PostPrivacy = 'public' | 'private' | 'friends';

export interface MentionRange {
  userId: string;
  start: number;
  end: number;
}

export interface Comment {
  id: string;
  author: User;
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  isLiked: boolean;
  replies: Comment[];
  mentionedUsers: string[];
  mentionRanges?: MentionRange[];
  replyCount?: number;
  parentId?: string | null;
}

export interface Notification {
  id: string;
  type: NotificationType;
  actor: User;
  targetId: string;
  targetType: NotificationTargetType;
  message: string;
  isRead: boolean;
  createdAt: Date;
  relatedData?: Record<string, unknown>;
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'tag' | 'message';
export type NotificationTargetType = 'post' | 'comment' | 'user' | 'message';

export interface Hashtag {
  tag: string;
  postsCount: number;
  trend: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  posts: Post[];
  createdAt: Date;
  isPublic: boolean;
  ownerId?: string;
}

export interface Feed {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface SearchResults {
  users: User[];
  posts: Post[];
  hashtags: Hashtag[];
}

export interface FollowRequest {
  id: string;
  from: User;
  to: User;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface UserStatistics {
  userId: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  engagementRate: number;
}

export interface CreatePostPayload {
  content: string;
  images?: File[];
  video?: File;
  hashtags?: string[];
  mentions?: string[];
  privacy: PostPrivacy;
  allowComments?: boolean;
  location?: string;
  originalPostId?: string;
}

export interface UpdatePostPayload {
  content?: string;
  images?: string[];
  privacy?: PostPrivacy;
  allowComments?: boolean;
}

export interface CreateCommentPayload {
  postId: string;
  content: string;
  mentionedUsers?: string[];
  mentionedUserIds?: string[];
  mentionRanges?: MentionRange[];
  replyToCommentId?: string;
}

export interface Reel {
  id: string;
  author: User;
  title: string;
  videoUrl: string;
  coverUrl?: string;
  description?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isLiked: boolean;
  hashtags: string[];
  createdAt: Date;
}

export interface Video {
  id: string;
  author: User;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  isLiked: boolean;
}

export interface Novel {
  id: string;
  author: User;
  title: string;
  description: string;
  coverUrl: string;
  status: 'ongoing' | 'completed';
  genres: string[];
  viewsCount: number;
  likesCount: number;
  chaptersCount: number;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  membersCount: number;
  privacy: 'public' | 'private';
  role: 'admin' | 'moderator' | 'member' | 'none';
  createdAt: Date;
}
