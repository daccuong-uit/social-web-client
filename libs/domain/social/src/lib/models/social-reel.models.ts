export interface ReelComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes: number;
  liked: boolean;
}

export interface ReelItem {
  id: string;
  author: string;
  avatar: string;
  description: string;
  music: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  liked: boolean;
  saved: boolean;
  videoUrl: string;
  thumbnailColor: string;
  thumbnailUrl?: string;
  userId?: string;
  commentList: ReelComment[];
}

export interface CreateReelPayload {
  videoFile: File;
  description: string;
  hashtags?: string[];
  music?: string;
  privacy?: 'public' | 'friends' | 'private';
}
