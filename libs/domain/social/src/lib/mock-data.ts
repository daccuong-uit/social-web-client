export interface MockUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface MockPost {
  id: string;
  user: MockUser;
  caption?: string;
  media?: string;
  likes?: number;
}

export const MOCK_POSTS: MockPost[] = [
  {
    id: 'p1',
    user: { id: 'u1', name: 'alice' },
    caption: 'Sunset vibes #goldenhour',
    media: '/assets/images/mock1.jpg',
    likes: 123,
  },
  {
    id: 'p2',
    user: { id: 'u2', name: 'bob' },
    caption: 'Morning routine',
    media: '/assets/images/mock2.jpg',
    likes: 42,
  },
];
