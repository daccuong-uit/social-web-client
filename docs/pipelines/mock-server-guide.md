# Mock Server Guide — Hướng Dẫn Sinh và Vận Hành Mock Data

> AI Agent sử dụng tài liệu này để tự động sinh Mock Data chuẩn xác từ `mock-api-specs.yaml`.

---

## Tổng Quan

Mock Server trong dự án này sử dụng hai cơ chế:

| Cơ Chế | Khi Nào Dùng | Vị Trí |
|--------|-------------|--------|
| **Inline Mock** (ưu tiên) | Development thông thường | `libs/domain/*/src/lib/mocks/` |
| **json-server** | Test toàn bộ flow HTTP | Root `mock-server/` |
| **MSW (Mock Service Worker)** | E2E test với real HTTP | `src/mocks/` |

---

## Cơ Chế 1: Inline Mock (Primary — dùng mặc định)

### Cách AI Sinh Mock Data Từ Schema

Khi nhận request "Tạo mock data cho entity X", AI thực hiện:

**Bước 1:** Đọc schema từ `mock-api-specs.yaml`
```yaml
# Ví dụ: Đọc schema Post
components:
  schemas:
    Post:
      properties:
        id: { type: string, format: uuid }
        content: { type: string }
        likeCount: { type: integer }
        isLikedByCurrentUser: { type: boolean }
        # ...
```

**Bước 2:** Ánh xạ sang TypeScript type (dùng `dictionary.json`)
```typescript
// Từ schema → Interface
export interface Post {
  id: string;
  author: User;
  content: string;
  mediaUrls: string[];
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  visibility: 'public' | 'friends' | 'private';
  createdAt: Date;
  updatedAt: Date;
}
```

**Bước 3:** Tạo Mock Array với dữ liệu phong phú
```typescript
// libs/domain/social/src/lib/mocks/mock-posts.ts

import { Post, User } from '../models/social.models';
import { MOCK_USERS } from './mock-users';

export const MOCK_POSTS: Post[] = [
  {
    id: 'mock-post-001',
    author: MOCK_USERS[0],
    content: 'Khám phá tính năng mới của Angular Signals! 🚀 #angular #typescript #webdev',
    mediaUrls: ['https://picsum.photos/seed/post001/800/600'],
    hashtags: ['angular', 'typescript', 'webdev'],
    likeCount: 342,
    commentCount: 28,
    shareCount: 15,
    isLikedByCurrentUser: false,
    visibility: 'public',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'mock-post-002',
    author: MOCK_USERS[1],
    content: 'Bí quyết tối ưu performance cho ứng dụng Angular với OnPush + Signals 💡',
    mediaUrls: [
      'https://picsum.photos/seed/post002a/800/600',
      'https://picsum.photos/seed/post002b/800/600',
    ],
    hashtags: ['performance', 'angular', 'frontend'],
    likeCount: 891,
    commentCount: 67,
    shareCount: 120,
    isLikedByCurrentUser: true,
    visibility: 'public',
    createdAt: new Date('2026-06-02T10:30:00Z'),
    updatedAt: new Date('2026-06-02T10:30:00Z'),
  },
  {
    id: 'mock-post-003',
    author: MOCK_USERS[2],
    content: 'Chia sẻ project cá nhân mới — một social app xây dựng với Nx Monorepo 🏗️',
    mediaUrls: [],
    hashtags: ['nx', 'monorepo', 'angular'],
    likeCount: 156,
    commentCount: 12,
    shareCount: 8,
    isLikedByCurrentUser: false,
    visibility: 'public',
    createdAt: new Date('2026-06-03T14:15:00Z'),
    updatedAt: new Date('2026-06-03T14:15:00Z'),
  },
  {
    id: 'mock-post-004',
    author: MOCK_USERS[0],
    content: 'Edge case: Long content test. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    mediaUrls: [],
    hashtags: ['test'],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    isLikedByCurrentUser: false,
    visibility: 'friends',
    createdAt: new Date('2026-06-04T09:00:00Z'),
    updatedAt: new Date('2026-06-04T09:00:00Z'),
  },
  {
    id: 'mock-post-005',
    author: MOCK_USERS[3],
    content: 'Video tutorial về Nx Workspace cho người mới bắt đầu 🎬',
    mediaUrls: ['https://picsum.photos/seed/post005/800/450'],
    hashtags: ['tutorial', 'nx', 'beginners'],
    likeCount: 2345,
    commentCount: 189,
    shareCount: 567,
    isLikedByCurrentUser: true,
    visibility: 'public',
    createdAt: new Date('2026-06-05T16:00:00Z'),
    updatedAt: new Date('2026-06-06T10:00:00Z'),
  },
];

// ---- Helper functions ----
export const getMockPostById = (id: string): Post | undefined =>
  MOCK_POSTS.find(p => p.id === id);

export const getMockPostsByAuthor = (authorId: string): Post[] =>
  MOCK_POSTS.filter(p => p.author.id === authorId);

export const getMockPostsByHashtag = (hashtag: string): Post[] =>
  MOCK_POSTS.filter(p => p.hashtags.includes(hashtag));

export const getMockPaginatedPosts = (
  page: number,
  pageSize: number
): { data: Post[]; meta: PaginationMeta } => {
  const start = (page - 1) * pageSize;
  const data = MOCK_POSTS.slice(start, start + pageSize);
  return {
    data,
    meta: {
      total: MOCK_POSTS.length,
      page,
      pageSize,
      totalPages: Math.ceil(MOCK_POSTS.length / pageSize),
      hasNextPage: start + pageSize < MOCK_POSTS.length,
      hasPrevPage: page > 1,
    },
  };
};
```

---

## Quy Tắc Sinh Mock Data (AI Reference)

### Quy Tắc Dữ Liệu

| Field Type | Mock Value Pattern |
|-----------|-------------------|
| `string (uuid)` | `mock-{entity}-{001..999}` |
| `string (url)` | `https://picsum.photos/seed/{unique}/800/600` |
| `string (avatar)` | `https://picsum.photos/seed/avatar{n}/200/200` |
| `string (text)` | Text thực tế, tiếng Việt hoặc tiếng Anh, đủ ý nghĩa |
| `number (count)` | Đa dạng: 0, small (5-20), medium (100-500), large (1000+) |
| `boolean` | Mix true/false, không phải toàn bộ một giá trị |
| `Date` | `new Date('2026-{month}-{day}T{HH}:{mm}:{ss}Z')` |
| `enum` | Phải có ít nhất một record mỗi enum value |
| `nullable` | Ít nhất 1 record có giá trị null |
| `array` | Mix: empty [], single [item], multiple [item1, item2, ...] |

### Quy Tắc Diversity (Đa Dạng Hóa)

Mock data phải bao gồm:
- **Happy path:** Records bình thường
- **Empty states:** Records không có media, không có description
- **Max content:** Records với text dài nhất có thể
- **Edge counts:** 0 likes, 0 comments; và rất nhiều likes
- **All enum values:** Mỗi enum value phải xuất hiện ít nhất 1 lần

---

## Cơ Chế 2: json-server (Khi Cần HTTP Thật)

### Setup

```bash
# Cài đặt
npm install -D json-server

# Chạy
npx json-server --watch mock-server/db.json --port 3000
```

### Tạo db.json từ Mock Data

```json
// mock-server/db.json — AI tự sinh từ mock-*.ts files
{
  "posts": [
    {
      "id": "mock-post-001",
      "content": "...",
      "likeCount": 342,
      "authorId": "mock-user-001"
    }
  ],
  "users": [...],
  "comments": [...],
  "notifications": [...]
}
```

### json-server Routes

```json
// mock-server/routes.json
{
  "/api/v1/*": "/$1",
  "/api/v1/feed": "/posts",
  "/api/v1/discover": "/posts"
}
```

---

## Cơ Chế 3: MSW — Mock Service Worker (E2E)

### Setup

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { MOCK_POSTS } from '../../../libs/domain/social/src/lib/mocks/mock-posts';

export const handlers = [
  http.get('/api/v1/feed', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const pageSize = Number(url.searchParams.get('pageSize') ?? 20);
    
    const start = (page - 1) * pageSize;
    const data = MOCK_POSTS.slice(start, start + pageSize);
    
    return HttpResponse.json({
      success: true,
      data,
      meta: {
        total: MOCK_POSTS.length,
        page,
        pageSize,
        totalPages: Math.ceil(MOCK_POSTS.length / pageSize),
        hasNextPage: start + pageSize < MOCK_POSTS.length,
        hasPrevPage: page > 1,
      },
    });
  }),

  http.post('/api/v1/posts/:postId/like', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        likeCount: 100, // Simulated
        isLikedByCurrentUser: true,
      },
    });
  }),
];
```

---

## Environment Configuration

```typescript
// apps/app-shell/src/environments/environment.ts (Development)
export const environment = {
  production: false,
  useMocks: true,          // ← true = dùng inline mock
  mockDelay: 300,          // ms delay để simulate network
  apiBaseUrl: 'http://localhost:3000/api/v1',
};

// apps/app-shell/src/environments/environment.production.ts
export const environment = {
  production: true,
  useMocks: false,         // ← false = dùng real API
  mockDelay: 0,
  apiBaseUrl: 'https://api.reals-platform.com/api/v1',
};
```

---

## Lệnh Nhanh

```bash
# Chạy app với mock data (mặc định development)
npx nx serve app-shell

# Chạy json-server
npx json-server --watch mock-server/db.json --port 3000 --routes mock-server/routes.json

# Chạy tests với mock
npx nx test domain-social
npx nx test features-home

# Kiểm tra Nx boundary violations
npx nx lint
```

---

## Checklist — Sau Khi Tạo Mock Data Mới

```
□ File đặt đúng vị trí: libs/domain/{domain}/src/lib/mocks/mock-{entity}.ts
□ Tối thiểu 5 records đa dạng
□ ID có prefix "mock-"
□ Không dùng Date.now() — dùng Date literal
□ Export cả array và helper functions
□ Re-export từ libs/domain/{domain}/src/lib/mocks/index.ts
□ Types khớp với schema trong mock-api-specs.yaml
□ Edge cases được cover (null, empty, max values)
□ Service sử dụng environment.useMocks check
```
