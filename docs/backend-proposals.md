# Đề Xuất Tối Ưu Backend API (Dành cho FE Integration)

Tài liệu này ghi nhận các đề xuất thay đổi/bổ sung trên Backend API để giúp Frontend hoạt động mượt mà hơn, tối ưu hiệu năng và trải nghiệm người dùng.

## 1. Tối ưu Payload trả về cho News Feed (`GET /posts/feed`)
**Vấn đề hiện tại:** 
FE cần hiển thị tên tác giả, avatar, badge tick xanh cùng bài đăng. Nếu BE chỉ trả về `authorId`, FE phải gọi tiếp n vòng API `/users/:id` để lấy thông tin.
**Đề xuất:** 
BE thực hiện populate/JOIN dữ liệu tác giả trực tiếp vào object `Post` trả về.
```json
// Mong đợi:
{
  "id": "post-id",
  "content": "Hello",
  "author": {
    "id": "user-id",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "isVerified": true
  },
  "isLikedByCurrentUser": true // Cờ hiệu để FE bôi đỏ nút Like
}
```

## 2. API Reactions (Like, Love...) trả về Data State mới nhất
**Vấn đề hiện tại:**
Khi gọi `POST /reactions`, thường BE chỉ trả `200 OK`. FE phải tự tính toán local (cộng 1) rất dễ sai lệch nếu có nhiều người cùng like.
**Đề xuất:**
Endpoint `/reactions` nên trả về ngay state đếm mới nhất của đối tượng đó.
```json
// Mong đợi:
{
  "statusCode": 200,
  "data": {
    "targetId": "post-id",
    "likeCount": 1500,
    "userReaction": "LOVE"
  }
}
```

## 3. Presigned URL cho Media Service (Tùy chọn)
**Vấn đề:** 
FE gửi video dung lượng lớn qua Backend (Multipart form), BE nhận rồi lại đẩy lên Cloud Storage (S3), làm nghẽn băng thông và memory BE.
**Đề xuất:** 
FE gọi BE xin `Presigned URL`, FE tự đẩy file nhị phân trực tiếp lên S3 bucket, sau đó báo cáo URL lại cho BE lưu DB.

## 4. Bổ sung Websocket / Real-time Notification
**Vấn đề:** 
Ứng dụng mạng xã hội cần độ trễ thấp ở phần Bình luận và Thông báo (chuông đỏ). Nếu FE phải dùng Polling (setInterval gọi API liên tục) sẽ quá tải hệ thống.
**Đề xuất:**
Backend cung cấp 1 kênh Websocket/Socket.io/SSE cho:
- Push thông báo mới theo thời gian thực (New Notification).
- Push bình luận mới trong bài viết đang xem.

## 5. Tối ưu Tracking Progress (Truyện / Video)
**Vấn đề:**
Để lưu % đọc truyện, FE gọi `PUT /novels/.../progress` liên tục khi người dùng cuộn trang.
**Đề xuất:**
BE xây dựng cơ chế Bulk Update (chấp nhận gom nhiều req vào 1 payload) hoặc FE sẽ dùng `debounce` trước khi call API. BE cần đảm bảo endpoint này phản hồi nhanh dưới 50ms (dùng Redis counter/cache).

## 6. Cập nhật Profile Page API cho FE (đã thống nhất)
**Vấn đề:**
Trang profile cần render nhiều block khác nhau (thông tin user, thông tin truy cập, thông tin tương tác) và các subtab. Nếu BE chỉ trả 1 payload tổng quát hoặc buộc FE gọi thêm nhiều request phụ, trải nghiệm sẽ chậm và logic phức tạp.
**Đề xuất:**
BE nên cung cấp 2 endpoint chính cho page profile:
- `GET /users/{userId}/profile-summary` → trả thông tin cơ bản của user (displayName, username, avatar, bio, cover, stats cơ bản).
- `GET /users/{userId}/profile-insights` → trả chung thống kê truy cập tuần và thống kê tương tác tuần, FE sẽ đọc trực tiếp từ payload này để render sidebar/profile insights.
Khi người dùng chuyển subtab, FE chỉ gọi 1 endpoint duy nhất cho subtab đang mở:
- `GET /users/{userId}/profile-tabs/{tabId}`.
Mỗi response nên chứa đủ dữ liệu để FE render ngay mà không cần gọi thêm API phụ, đồng thời hỗ trợ pagination/meta cho nội dung subtab.
