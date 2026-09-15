# social-web-client — Reals Social

> Angular 21 · Nx 22 · Port **4200** (dev & Docker)

Không gian **Mạng xã hội** trong hệ sinh thái Reals Platform. Chuyên trách Feeds, bài đăng đa phương tiện, bình luận phân cấp real-time, kết bạn và Reels.

## Workspace → [daccuong-uit/social-platform-workspace](https://github.com/daccuong-uit/social-platform-workspace)

---

## Chức năng

| Route | Mô tả |
|---|---|
| `/social` | Live Newsfeed — bảng tin chính |
| `/friends` | Quản lý bạn bè, gợi ý kết bạn |
| `/reels` | Short-form video feed dọc |
| `/media` | Media Studio — upload & quản lý file |
| `/profile` | Hồ sơ cá nhân |
| `/dashboard` | Dashboard & phân tích |
| `/settings` | Cài đặt tài khoản |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (Standalone, Signals-first) |
| Monorepo | Nx 22 |
| State | Angular Signals + RxJS |
| Styling | CSS custom properties (OKLCH tokens) |
| Testing | Jest |

## Cấu trúc thư mục

```
.
├── apps/web/                  # Entry shell — chỉ routing, không có business logic
│   └── src/
│       ├── app/routes/        # Lazy-loaded routes
│       └── environments/      # environment.ts (cross-client URLs + API URL)
│
└── libs/
    ├── core/                  # AuthService, guards, interceptors
    ├── ui/                    # Shared UI components (PageShell, SidebarMenu…)
    ├── entities/              # Domain models: profile, media, social
    └── features/
        ├── home/              # SocialShellComponent (Feeds shell)
        ├── friends/           # Friends management
        ├── reels/             # Reels feed
        ├── media/             # Media upload & management
        ├── profile/           # User profile
        ├── dashboard/         # Dashboard
        └── settings/          # Settings
```

## Chạy local

```bash
npm install
npm start          # → http://localhost:4200
npm run build      # Production build
```

## Docker

```bash
# Từ workspace root (social-platform-workspace):
docker compose build fe-social
docker compose up -d fe-social

# → http://localhost:4200
```

Nginx phục vụ Angular bundle và proxy `/api/*` → `gateway:3000`.

## Biến môi trường

| Biến | Mô tả |
|---|---|
| `apiUrl` | `/api/v1` (proxied qua nginx → gateway) |
| `iamUrl` | http://localhost:4204 |
| `socialUrl` | http://localhost:4200 |
| `videoUrl` | http://localhost:4201 |
| `shopUrl` | http://localhost:4202 |
| `storiesUrl` | http://localhost:4203 |
| `portfolioUrl` | http://localhost:4205 |
