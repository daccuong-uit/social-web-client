import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PlaceholderItem {
  icon: string;
  title: string;
  detail: string;
  cta?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'fe-feature-placeholder',
  templateUrl: './feature-placeholder.component.html',
  styleUrls: ['./feature-placeholder.component.css'],
})
export class FeaturePlaceholderComponent implements OnChanges {
  /**
   * Title passed from the parent shell (or from route data via resolver).
   * Falls back to a generic value so the old router-outlet usage still works.
   */
  @Input() title = 'Tính năng';
  @Input() description = 'Chúng tôi đang xây dựng tính năng này.';

  icon = '⚙️';
  items: PlaceholderItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title']) {
      this.icon  = this.getIcon(this.title);
      this.items = this.getItems(this.title);
    }
  }

  private getIcon(title: string): string {
    const t = title.toLowerCase();
    if (t.includes('thông báo') || t.includes('notification')) return '🔔';
    if (t.includes('chat') || t.includes('tin nhắn'))           return '💬';
    if (t.includes('studio'))                                    return '🎬';
    if (t.includes('reals ai') || t.includes('ai'))              return '🧠';
    if (t.includes('dấu trang') || t.includes('bookmark'))       return '🔖';
    if (t.includes('theo dõi') || t.includes('following'))       return '👥';
    if (t.includes('premium'))                                   return '⭐';
    return '⚙️';
  }

  private getItems(title: string): PlaceholderItem[] {
    const t = title.toLowerCase();

    if (t.includes('thông báo') || t.includes('notification')) {
      return [
        { icon: '📝', title: 'Nhắc nhở mới', detail: 'Bình luận mới, lượt thích và đề cập chờ bạn xác nhận.', cta: 'Xem tất cả' },
        { icon: '🔔', title: 'Thông báo hệ thống', detail: 'Cập nhật nền tảng, thông báo giới hạn thời gian và ưu đãi.', cta: 'Kiểm tra' },
      ];
    }

    if (t.includes('chat') || t.includes('tin nhắn')) {
      return [
        { icon: '👤', title: 'Tin nhắn mới', detail: 'Bạn có 3 cuộc trò chuyện chưa đọc với creator và người hâm mộ.', cta: 'Mở Chat' },
        { icon: '📨', title: 'Hộp thư đến', detail: 'Trả lời nhanh các tin nhắn quan trọng ngay trong trang này.', cta: 'Xem ngay' },
      ];
    }

    if (t.includes('dấu trang') || t.includes('bookmark')) {
      return [
        { icon: '📌', title: 'Bài viết đã lưu', detail: 'Xem lại các bài viết bạn đã đánh dấu để đọc sau.', cta: 'Xem tất cả' },
        { icon: '🗂️', title: 'Bộ sưu tập', detail: 'Tổ chức bài viết đã lưu theo chủ đề và danh mục.', cta: 'Quản lý' },
      ];
    }

    if (t.includes('theo dõi') || t.includes('following')) {
      return [
        { icon: '👥', title: 'Người đang theo dõi', detail: 'Xem danh sách những người bạn đang theo dõi.', cta: 'Xem danh sách' },
        { icon: '✨', title: 'Gợi ý mới', detail: 'Khám phá những creator phù hợp với sở thích của bạn.', cta: 'Khám phá' },
      ];
    }

    if (t.includes('premium')) {
      return [
        { icon: '⭐', title: 'Gói Premium', detail: 'Mở khóa trải nghiệm nội dung không giới hạn và tính năng độc quyền.', cta: 'Nâng cấp ngay' },
        { icon: '🎁', title: 'Đặc quyền thành viên', detail: 'Huy hiệu đặc biệt, ưu tiên hỗ trợ và công cụ creator nâng cao.', cta: 'Tìm hiểu thêm' },
      ];
    }

    return [
      { icon: '📌', title: 'Tính năng sắp tới', detail: 'Chúng tôi đang xây dựng giao diện đầy đủ và tiện ích hơn cho bạn.', cta: 'Theo dõi tiến độ' },
    ];
  }
}
