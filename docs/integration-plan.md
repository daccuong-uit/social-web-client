# Kế Hoạch Tích Hợp Frontend & Backend API (Integration Plan)

**Dự án:** Cross-Platform Social Creator Platform (FE)
**Kiến trúc:** Nx Monorepo, Angular 18+, Standalone, Signals.

Tài liệu này xác định các bước cụ thể để tích hợp giao diện UI hiện có với các đầu API đã được Backend xây dựng ở D:\cross_platform_software\docs\postman, đảm bảo tận dụng tối đa 15 modules của hệ thống.

## Giai đoạn 1: Core Architecture & Setup (Hạ tầng nền tảng)
1. **API Interceptors & Error Handling (`@fe/core`)**:
   - Cấu hình `AuthInterceptor` để tự động inject `Authorization: Bearer <token>`.
   - Cấu hình `ErrorInterceptor` xử lý Catch Error toàn cục (Toast message từ BE trả về hoặc Auto Refresh Token khi 401).
2. **Auth Service & Facade (`@fe/features/auth`)**:
   - Tích hợp API Đăng nhập, Đăng ký, Đổi mật khẩu.
   - Quản lý session qua Global Store (Signals).
3. **Data Model Synchronization (`@fe/domain`)**:
   - Khởi tạo Type/Interface chuẩn (Post, Reel, User, Comment...) dựa theo `social.models.ts` và Postman Collection.

## Giai đoạn 2: User Profile & Social Graph (Hồ sơ & Kết nối)
1. **User Profile (`@fe/features/profile`)**:
   - Khi mở page profile, FE gọi 2 API riêng để render các block dữ liệu chính:
     1. `GET /users/{userId}/profile-summary` → thông tin người dùng cơ bản (displayName, username, avatar, bio, cover, stats cơ bản).
     2. `GET /users/{userId}/profile-insights` → trả chung thống kê truy cập tuần và tương tác tuần, FE đọc trực tiếp từ payload này để render sidebar/profile insights.
   - Khi đổi subtab, FE chỉ gọi 1 API subtab tương ứng: `GET /users/{userId}/profile-tabs/{tabId}`.
   - Backend phải trả đủ dữ liệu để FE render ngay mà không cần gọi thêm nhiều request phụ.
2. **Friendship & Follow (`@fe/features/social`)**:
   - Kết nối API Gợi ý kết bạn, Gửi lời mời kết bạn, Danh sách bạn bè.
   - Kết nối API Follow/Unfollow.
   - *Logic UI:* Triển khai Optimistic UI cho các nút trạng thái (Follow / Unfollow).

## Giai đoạn 3: Core Content & Interactions (Bài viết & Tương tác)
1. **News Feed (`@fe/features/home`)**:
   - Tích hợp API `GET /posts/feed` với `InfiniteScroll` directive.
   - Render layout Post (Text, Media, Poll) theo dữ liệu thực.
2. **Post Creation & Media Upload (`@fe/features/media`)**:
   - Tích hợp flow tạo bài viết: Chọn ảnh/video -> Đẩy lên `media-service` lấy URL -> Push bài viết vào `social-service`.
3. **Reactions & Comments (`@fe/ui` & `@fe/domain/social`)**:
   - Ghép API Reactions (Like, Love, Haha...). Xử lý cập nhật local signal state thay vì load lại toàn bộ danh sách.
   - Ghép API Bình luận và nested reply.

## Giai đoạn 4: Đa phương tiện - Reels, Videos, Novels
1. **Short Video (Reels) (`@fe/features/reels`)**:
   - Ghép API `GET /reels/discover`. Tích hợp Swipe detection để auto-play/pause.
   - Tích hợp API `POST /analytics/watch-time` (gọi định kỳ mỗi 5s).
2. **Long Video (`@fe/features/videos`)**:
   - Ghép API xem video.
   - Tích hợp `GET /videos/me/history` (Continue Watching).
3. **Truyện chữ (Novels) (`@fe/features/novels`)**:
   - Ghép API thư viện (`GET /novels/me/library`).
   - Tracking quá trình đọc (`PUT /novels/:novelId/chapters/:chapterId/progress`).

## Giai đoạn 5: Nhóm (Groups) & Khám phá (Search)
1. **Groups (`@fe/features/groups`)**:
   - Hiển thị danh sách nhóm, Feed nhóm.
   - Phân quyền thao tác Admin/Moderator theo API.
2. **Search & Hashtags (`@fe/features/search`)**:
   - Tìm kiếm toàn cục đa thực thể (Global ILIKE search).
   - Trang xu hướng Hashtags (Trending).

## Giai đoạn 6: Tính năng tiện ích
1. **Notifications (`@fe/features/notifications`)**:
   - Đổ dữ liệu thông báo, Badge đếm số chưa đọc, Đánh dấu đã đọc.
2. **Bookmarks (`@fe/features/bookmarks`)**:
   - Lưu nháp bài viết, đánh dấu nội dung ưa thích.

---
*Lưu ý: FE đã có sẵn phần lớn UI, quá trình tích hợp sẽ chủ yếu tạo các Facade (Signal State) và truyền dữ liệu xuống UI (Dumb Components).*
