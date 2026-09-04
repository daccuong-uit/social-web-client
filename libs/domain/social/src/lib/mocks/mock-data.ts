/**
 * @fileoverview Mock data for Phase 5 Social Feature
 * This file contains all mock/placeholder data used in the social feature.
 * To be easily replaced with real API calls - just remove this file and wire actual services.
 *
 * PHASE 5 RULE: This file must be clearly marked and easily identifiable for removal.
 */

export interface MockUser {
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
}

export interface MockPost {
  id: string;
  author: MockUser;
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
  privacy: 'public' | 'private' | 'friends';
  isPinned: boolean;
  allowComments: boolean;
}

export interface MockComment {
  id: string;
  author: MockUser;
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  isLiked: boolean;
  replies: MockComment[];
  mentionedUsers: string[];
}

export interface MockNotification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'tag' | 'message';
  actor: MockUser;
  targetId: string;
  targetType: 'post' | 'comment' | 'user' | 'message';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface MockHashtag {
  tag: string;
  postsCount: number;
  trend: number;
}

export interface MockCollection {
  id: string;
  name: string;
  description: string;
  posts: MockPost[];
  createdAt: Date;
  isPublic: boolean;
}

// ============================
// MOCK USERS
// ============================

export const MOCK_USERS: {
  current_user: MockUser;
  user_001: MockUser;
  user_002: MockUser;
  user_003: MockUser;
  user_004: MockUser;
  user_005: MockUser;
} = {
  current_user: {
    id: 'user-001',
    username: 'duc_dai',
    fullName: 'Đức Đại',
    avatar: 'https://i.pravatar.cc/150?img=12',
    bio: '🚀 Full-stack dev | Coffee ☕ | Tech enthusiast',
    followers: 1250,
    following: 340,
    postsCount: 42,
    isFollowing: false,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
  },
  user_001: {
    id: 'user-002',
    username: 'tuan_frontend',
    fullName: 'Tuấn Nguyễn',
    avatar: 'https://i.pravatar.cc/150?img=20',
    bio: 'Frontend Engineer | React & Angular lover',
    followers: 3420,
    following: 560,
    postsCount: 156,
    isFollowing: true,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
  },
  user_002: {
    id: 'user-003',
    username: 'lin_designer',
    fullName: 'Linh Nguyễn',
    avatar: 'https://i.pravatar.cc/150?img=45',
    bio: '🎨 UX/UI Designer | Creating beautiful experiences',
    followers: 2810,
    following: 420,
    postsCount: 234,
    isFollowing: true,
    isFollowedBy: true,
    isBlocked: false,
    isMuted: false,
  },
  user_003: {
    id: 'user-004',
    username: 'khuyen_dev',
    fullName: 'Khuyến Đinh',
    avatar: 'https://i.pravatar.cc/150?img=33',
    bio: 'Backend Developer | Python & Node.js',
    followers: 1890,
    following: 290,
    postsCount: 89,
    isFollowing: false,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
  },
  user_004: {
    id: 'user-005',
    username: 'hoa_marketing',
    fullName: 'Hoa Trần',
    avatar: 'https://i.pravatar.cc/150?img=67',
    bio: 'Digital Marketing | Content Creator',
    followers: 5640,
    following: 890,
    postsCount: 412,
    isFollowing: true,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
  },
  user_005: {
    id: 'user-006',
    username: 'vinh_video',
    fullName: 'Vinh Hoàng',
    avatar: 'https://i.pravatar.cc/150?img=72',
    bio: 'Video Creator | Storyteller',
    followers: 2180,
    following: 310,
    postsCount: 78,
    isFollowing: false,
    isFollowedBy: false,
    isBlocked: false,
    isMuted: false,
  },
};

// ============================
// MOCK POSTS
// ============================

export const MOCK_POSTS: MockPost[] = [
  {
    id: 'post-001',
    author: MOCK_USERS.user_001,
    content:
      'Just launched a new Angular project! The component architecture is amazing 🚀 #angular #web #development',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400',
    ],
    video: undefined,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likesCount: 245,
    commentsCount: 32,
    sharesCount: 18,
    viewsCount: 3_200,
    isLiked: true,
    isBookmarked: false,
    hashtags: ['angular', 'web', 'development'],
    mentions: [],
    privacy: 'public',
    isPinned: false,
    allowComments: true,
  },
  {
    id: 'post-002',
    author: MOCK_USERS.user_002,
    content:
      'Design system update: New color palette for better accessibility ♿ Follow for more design tips!',
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400',
    ],
    video: undefined,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likesCount: 512,
    commentsCount: 67,
    sharesCount: 89,
    viewsCount: 8_480,
    isLiked: false,
    isBookmarked: true,
    hashtags: ['design', 'accessibility', 'ui'],
    mentions: [],
    privacy: 'public',
    isPinned: false,
    allowComments: true,
  },
  {
    id: 'post-003',
    author: MOCK_USERS.user_003,
    content:
      'Coffee and coding ☕👨‍💻 Nothing beats a productive morning session #CodeLife',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400',
      'https://images.unsplash.com/photo-1516534775068-bb57e39c8ac0?w=600&h=400',
    ],
    video: undefined,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    likesCount: 189,
    commentsCount: 24,
    sharesCount: 12,
    viewsCount: 2_060,
    isLiked: false,
    isBookmarked: false,
    hashtags: ['codelife', 'developer', 'coffee'],
    mentions: [],
    privacy: 'public',
    isPinned: true,
    allowComments: true,
  },
  {
    id: 'post-004',
    author: MOCK_USERS.user_004,
    content: 'New blog post: "Performance Optimization Tips for 2026" 📝 Link in bio',
    images: [
      'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=600&h=400',
    ],
    video: undefined,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    likesCount: 324,
    commentsCount: 45,
    sharesCount: 12,
    isLiked: false,
    isBookmarked: false,
    hashtags: ['performance', 'optimization', 'tutorial'],
    mentions: [],
    privacy: 'public',
    isPinned: false,
    allowComments: true,
  },
  {
    id: 'post-005',
    author: MOCK_USERS.user_005,
    content:
      'Social media is the future! 🌟 Join us in building amazing communities #SocialMedia #Community #2026',
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400',
    ],
    video: undefined,
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    likesCount: 890,
    commentsCount: 156,
    sharesCount: 45,
    isLiked: true,
    isBookmarked: false,
    hashtags: ['socialmedia', 'community', '2026'],
    mentions: [],
    privacy: 'public',
    isPinned: false,
    allowComments: true,
  },
];

// ============================
// MOCK COMMENTS
// ============================

export const MOCK_COMMENTS: Record<string, MockComment[]> = {
  'post-001': [
    {
      id: 'comment-001',
      author: MOCK_USERS.user_002,
      postId: 'post-001',
      content: 'Nice work! Love the structure 🎉',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      likesCount: 23,
      isLiked: false,
      replies: [
        {
          id: 'comment-001-reply-001',
          author: MOCK_USERS.user_001,
          postId: 'post-001',
          content: 'Thanks! Been working on this for weeks',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          likesCount: 5,
          isLiked: false,
          replies: [],
          mentionedUsers: [],
        },
      ],
      mentionedUsers: [],
    },
    {
      id: 'comment-002',
      author: MOCK_USERS.user_003,
      postId: 'post-001',
      content: '@tuan_frontend Can we use this in our next project?',
      createdAt: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1.2 * 60 * 60 * 1000),
      likesCount: 12,
      isLiked: true,
      replies: [],
      mentionedUsers: ['tuan_frontend'],
    },
  ],
  'post-002': [
    {
      id: 'comment-003',
      author: MOCK_USERS.user_001,
      postId: 'post-002',
      content: 'The accessibility improvements are excellent!',
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      likesCount: 34,
      isLiked: true,
      replies: [],
      mentionedUsers: [],
    },
  ],
};

// ============================
// MOCK NOTIFICATIONS
// ============================

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-001',
    type: 'like',
    actor: MOCK_USERS.user_005,
    targetId: 'post-001',
    targetType: 'post',
    message: 'liked your post',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'notif-002',
    type: 'comment',
    actor: MOCK_USERS.user_002,
    targetId: 'post-001',
    targetType: 'post',
    message: 'commented on your post',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: 'notif-003',
    type: 'follow',
    actor: MOCK_USERS.user_004,
    targetId: 'user-001',
    targetType: 'user',
    message: 'started following you',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'notif-004',
    type: 'mention',
    actor: MOCK_USERS.user_003,
    targetId: 'comment-002',
    targetType: 'comment',
    message: 'mentioned you in a comment',
    isRead: true,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

// ============================
// MOCK HASHTAGS
// ============================

export const MOCK_HASHTAGS: MockHashtag[] = [
  { tag: 'angular', postsCount: 12540, trend: 85 },
  { tag: 'development', postsCount: 34521, trend: 92 },
  { tag: 'design', postsCount: 28934, trend: 78 },
  { tag: 'web', postsCount: 45123, trend: 88 },
  { tag: 'codelife', postsCount: 9234, trend: 65 },
  { tag: 'socialmedia', postsCount: 156234, trend: 95 },
  { tag: 'community', postsCount: 89234, trend: 72 },
  { tag: 'tutorial', postsCount: 56234, trend: 68 },
];

// ============================
// MOCK COLLECTIONS
// ============================

export const MOCK_COLLECTIONS: MockCollection[] = [
  {
    id: 'collection-001',
    name: 'Angular Best Practices',
    description: 'Collection of great Angular resources and tutorials',
    posts: [MOCK_POSTS[0]],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    isPublic: true,
  },
  {
    id: 'collection-002',
    name: 'Design Inspiration',
    description: 'Beautiful UI/UX designs for inspiration',
    posts: [MOCK_POSTS[1]],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    isPublic: true,
  },
];

// ============================
// TRENDING DATA
// ============================

export const MOCK_TRENDING_POSTS: MockPost[] = [MOCK_POSTS[4], MOCK_POSTS[1], MOCK_POSTS[3]];

export const MOCK_TRENDING_HASHTAGS: MockHashtag[] = MOCK_HASHTAGS.slice(0, 5);

export const MOCK_SUGGESTED_USERS: MockUser[] = [
  MOCK_USERS.user_004,
  MOCK_USERS.user_005,
];

// ============================
// Search Results Mock
// ============================

export const MOCK_SEARCH_RESULTS = {
  users: Object.values(MOCK_USERS).slice(1),
  posts: MOCK_POSTS,
  hashtags: MOCK_HASHTAGS,
};
