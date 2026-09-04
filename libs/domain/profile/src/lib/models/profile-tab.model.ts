import type { Post } from '@fe/domain/social';

export type ProfileTabId = 'posts' | 'about' | 'videos' | 'reels' | 'stories' | 'novels' | 'friends' | 'groups';

export interface ProfileTab {
  id: ProfileTabId;
  label: string;
  count?: number;
}

export type ProfilePost = Post;

export interface ProfileFriend {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  mutualFriends: number;
  isOnline: boolean;
}

export interface ProfileGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  isMember: boolean;
}
