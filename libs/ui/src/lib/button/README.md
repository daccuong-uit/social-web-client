# 🔘 UI Button Component (`<lib-button>`)

Hệ thống nút bấm chuẩn hóa (Button Design System) cho toàn bộ ứng dụng Cross-Platform Social Creator Platform.

---

## 🎨 Button Variants

Tất cả các nút bấm đều tuân thủ thông số kích thước và căn chỉnh thống nhất, chỉ khác nhau về phong cách hiển thị (Variant):

| Variant | Tên hiển thị | Selector CSS | Mô tả & Styling |
| :--- | :--- | :--- | :--- |
| **`primary`** | Primary Action (Nút chính) | `lib-button button.primary`, `.btn-primary` | Solid background màu thương hiệu (`var(--color-brand-primary)`), chữ trắng, shadow nổi nhẹ. |
| **`outline`** | Outline / Secondary (Nút phụ) | `lib-button button.outline`, `.btn-outline` | Nền bề mặt (`var(--color-surface-base)`), viền thanh lịch (`var(--color-border-subtle)`), chữ màu tối/sáng theo theme. |
| **`ghost`** | Ghost / Text (Nút mờ) | `lib-button button.ghost`, `.btn-ghost`, `.btn-accent` | Nền trong suốt, không viền, chữ accent. |
| **`danger`** | Destructive | `lib-button button.danger`, `.btn-danger` | Solid destructive action. |
| **`link`** | Link | `lib-button button.link`, `.btn-link` | Text-only action with underline. |

---

## 📏 Thông Số Chuẩn Hóa (Standardized Tokens)

Tất cả 3 loại nút sử dụng chung các CSS variables & layout metrics được định nghĩa trong `shared-typography.css`:

```css
:root {
  --button-height: 2.5rem;
  --button-min-width: 5rem;
  --button-padding-inline: 0.75rem;
  --button-gap: 0.5rem;
  --button-font-size: var(--type-small);
  --button-font-weight: var(--font-weight-medium);
  --button-radius: 0.5rem;
  --button-font-family: var(--font-family);
}
```

> ⚙️ **Kết nối Settings**: Khi người dùng thay đổi Font Size hoặc Padding Scale trong trang Cài Đặt → kích thước nút tự động cập nhật thông qua `--font-size-scale` và `--padding-scale`.

> 🚫 **Không in đậm**: `--button-font-weight: 400` — chữ trong nút KHÔNG được in đậm (bold). Tất cả font-weight trong nút phải sử dụng biến global này, không hard-code.

---

## 💻 Hướng Dẫn Sử Dụng (Usage Guidelines)

### 1. Sử dụng Component Angular (`lib-button`)

```html
<!-- Nút chính (Primary) -->
<lib-button variant="primary" (click)="onSubmit()">
  Xác nhận
</lib-button>

<!-- Nút phụ viền (Outline / Secondary) -->
<lib-button variant="outline" (click)="onCancel()">
  Hủy bỏ
</lib-button>

<!-- Nút mờ (Ghost / Text) -->
<lib-button variant="ghost" (click)="onMoreInfo()">
  Xem thêm
</lib-button>

<lib-button variant="danger" [loading]="isDeleting" (click)="onDelete()">
  Xóa
</lib-button>

<lib-button variant="ghost" [iconOnly]="true" aria-label="Mở menu">
  <img src="menu.svg" alt="" />
</lib-button>
```

### 2. Sử dụng Utility Class CSS (`.btn`)

Dành cho các `<button>` HTML nguyên bản hoặc thẻ `<a>` ở các trang:

```html
<button class="btn btn-primary">Lưu thay đổi</button>
<button class="btn btn-outline">Nhắn tin</button>
<button class="btn btn-ghost">Bỏ theo dõi</button>
```

---

## ⚙️ Properties API (`UiButton`)

| Property | Type | Default | Mô tả |
| :--- | :--- | :--- | :--- |
| `variant` | `'primary' \| 'outline' \| 'ghost' \| 'danger' \| 'link'` | `'primary'` | Kiểu hiển thị, không thay đổi kích thước |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type attribute của nút HTML |
| `disabled` | `boolean` | `false` | Trạng thái vô hiệu hóa nút bấm |
| `loading` | `boolean` | `false` | Khóa nút và hiển thị spinner đồng bộ |
| `iconOnly` | `boolean` | `false` | Chuyển nút thành control vuông/tròn chứa icon |

---

## 📐 Quy Tắc Bắt Buộc (Coding Rules)

1. **Không hard-code font-weight trong nút** — dùng `var(--button-font-weight)`.
2. **Không hard-code kích thước nút** — dùng `var(--button-height)`, `var(--button-padding-inline)`, `var(--button-gap)`.
3. **Icon/image phải là flex item không co**, có `aspect-ratio: 1` và kích thước `1.125rem`.
4. **Icon-only dùng `iconOnly`**; nút `.btn` chỉ chứa một SVG/image cũng tự thu gọn về kích thước icon.
5. **Loading dùng `loading`**, không tự tạo spinner cho từng feature.

Các nhóm nút như `.profile-actions`, `.button-group`, `.btn-group` và `.actions` tự dùng `gap` chuẩn để các nút không bị dính sát nhau.
