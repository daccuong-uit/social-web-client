# 🔘 UI Button Component (`<lib-button>`)

Hệ thống nút bấm chuẩn hóa (Button Design System) cho toàn bộ ứng dụng Cross-Platform Social Creator Platform.

---

## 🎨 3 Loại Nút Bấm Chuẩn (3 Button Variants)

Tất cả các nút bấm đều tuân thủ thông số kích thước và căn chỉnh thống nhất, chỉ khác nhau về phong cách hiển thị (Variant):

| Variant | Tên hiển thị | Selector CSS | Mô tả & Styling |
| :--- | :--- | :--- | :--- |
| **`primary`** | Primary Action (Nút chính) | `lib-button button.primary`, `.btn-primary` | Solid background màu thương hiệu (`var(--color-brand-primary)`), chữ trắng, shadow nổi nhẹ. |
| **`outline`** | Outline / Secondary (Nút phụ) | `lib-button button.outline`, `.btn-outline` | Nền bề mặt (`var(--color-surface-base)`), viền thanh lịch (`var(--color-border-subtle)`), chữ màu tối/sáng theo theme. |
| **`ghost`** | Ghost / Text (Nút mờ) | `lib-button button.ghost`, `.btn-ghost`, `.btn-accent` | Nền trong suốt, không viền, chữ accent. Khi hover sẽ xuất hiện lớp tint mờ (`rgba(29, 155, 240, 0.08)`). |

---

## 📏 Thông Số Chuẩn Hóa (Standardized Tokens)

Tất cả 3 loại nút sử dụng chung các CSS variables & layout metrics được định nghĩa trong `shared-typography.css`:

```css
:root {
  /* Dynamic Slim Button System — tất cả kích thước kết nối trực tiếp vào Settings scales */
  --button-height:     calc(var(--padding-scale, 1) * 1.75rem);   /* ~28px — Slim & sleek */
  --button-padding-y:  calc(var(--padding-scale, 1) * 0.2rem);    /* ~3.2px — Tight vertical */
  --button-padding-x:  calc(var(--padding-scale, 1) * 0.5rem);    /* ~8px — Minimal horizontal */
  --button-font-size:  calc(var(--font-size-scale, 1) * 0.8125rem); /* 13px — Balanced text */
  --button-font-weight: 400;                                        /* Regular — không in đậm */
  --button-radius:     calc(var(--padding-scale, 1) * 0.375rem);   /* 6px — Subtle radius */
  --button-font-family: var(--font-family, system-ui, sans-serif);
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
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | Kiểu hiển thị nút bấm |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Type attribute của nút HTML |
| `disabled` | `boolean` | `false` | Trạng thái vô hiệu hóa nút bấm |

---

## 📐 Quy Tắc Bắt Buộc (Coding Rules)

1. **Không hard-code font-weight trong nút** — luôn dùng `var(--button-font-weight, 400)`
2. **Không hard-code padding/height trong nút** — luôn dùng `var(--button-padding-y)`, `var(--button-padding-x)`, `var(--button-height)`
3. **Không hard-code font-size trong nút** — luôn dùng `var(--button-font-size)`
4. **Không hard-code border-radius trong nút** — luôn dùng `var(--button-radius)`
5. Các heading/title dùng `var(--font-weight-strong, 700)` hoặc `var(--font-weight-medium, 600)` từ design system
