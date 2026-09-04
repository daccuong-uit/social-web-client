# Feature Lifecycle — Vòng Đời Phát Triển Tính Năng

> **Tài liệu này định nghĩa quy trình phối hợp Frontend-First.**
> Frontend là bên chủ động định nghĩa mọi thứ. Backend là bên thụ động triển khai theo Spec của FE.

---

## Tổng Quan: Quy Trình Frontend-First

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND-FIRST PIPELINE                          │
│                                                                     │
│  [1] User Story    →  [2] API Design  →  [3] Mock Data             │
│       (PM/Dev)         (FE chủ động)      (FE tự tạo)              │
│          ↓                  ↓                  ↓                    │
│  [4] FE Code       →  [5] FE Test     →  [6] Hard Contract         │
│   (Service→UI)        (với Mock)          (bàn giao BE)             │
│          ↓                  ↓                  ↓                    │
│  [7] BE Implements →  [8] Integration →  [9] Done ✓               │
│    (theo spec FE)      (FE switch env)                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Nguyên tắc vàng:**
> Frontend KHÔNG BAO GIỜ thụ động chờ Backend. Nếu API chưa có, FE phải tạo Mock và tiến hành song song.

---

## Giai Đoạn 1: User Story → Phân Tích Yêu Cầu

### Input
- User Story từ Product Manager (PM)
- Wireframe / Figma design (nếu có)

### Công việc của AI Agent
```
□ Đọc user story
□ Xác định: Cần entity nào? API endpoint nào?
□ Kiểm tra docs/contracts/mock-api-specs.yaml: Endpoint đã có chưa?
□ Kiểm tra libs/domain/: Model đã tồn tại chưa?
□ Xác định layer cần tạo file (dùng project-architecture.json)
```

### Output
- Danh sách file cần tạo/sửa
- Danh sách API endpoint cần thêm vào mock-api-specs.yaml

### Ví dụ
```
User Story: "Là người dùng, tôi muốn xem danh sách trending hashtags 
             để khám phá nội dung mới."

Phân tích:
→ Entity cần: Hashtag (đã có trong dictionary.json)
→ API cần: GET /hashtags/trending (CẦN THÊM vào mock-api-specs.yaml)
→ Service cần: SocialSearchService.getTrendingHashtags() 
               (libs/domain/social/src/lib/services/social-search.service.ts)
→ Mock cần: MOCK_TRENDING_HASHTAGS 
            (libs/domain/social/src/lib/mocks/mock-hashtags.ts)
→ Component: TrendingHashtagsComponent
             (libs/features/home/src/lib/components/right-sidebar/)
```

---

## Giai Đoạn 2: Thiết Kế API Contract (FE Chủ Động)

### Nguyên tắc thiết kế Response Shape

FE thiết kế response shape DỰA TRÊN NHU CẦU UI, không phải dựa trên cấu trúc database BE.

```yaml
# ĐÚNG — Shape tối ưu cho UI
# FE cần hiển thị avatar, name, post count bên cạnh hashtag
GET /hashtags/trending:
  response:
    - tag: "angular"
      postCount: 15423
      topPost:
        id: "..."
        thumbnailUrl: "..."   # FE cần thumbnail để preview
      isFollowedByCurrentUser: false  # FE cần để show Follow button
```

```yaml
# SAI — Để BE quyết định shape
# Đây là anti-pattern trong Frontend-First
```

### Cách Cập Nhật mock-api-specs.yaml

Khi thêm endpoint mới:
1. Thêm path vào section `paths`
2. Thêm schema vào `components/schemas` nếu cần entity mới
3. Cập nhật tag phù hợp
4. Commit với message: `docs(contracts): add {feature} API spec`

### Trạng Thái Endpoint

Mỗi endpoint có thể ở một trong 3 trạng thái:

| Trạng Thái | Ý Nghĩa | Cách Xử Lý trong Service |
|-----------|---------|--------------------------|
| 🟡 `draft` | FE vừa thiết kế, chưa implement | Dùng `of(MOCK_DATA)` |
| 🟢 `mock-ready` | FE đã implement + test với mock | Dùng mock, cờ sẵn sàng cho BE |
| 🔵 `integrated` | BE đã implement, FE đã kết nối thật | Dùng real HTTP call |

```typescript
// Pattern chuẩn để hỗ trợ 3 trạng thái:
getTrendingHashtags(): Observable<Hashtag[]> {
  // 🟡 → 🟢: Dùng mock
  if (environment.useMocks) {
    return of(MOCK_TRENDING_HASHTAGS).pipe(delay(300)); // Simulate network
  }
  // 🔵: Dùng real API
  return this.http.get<ApiResponse<Hashtag[]>>(
    `${this.apiBase}/hashtags/trending`
  ).pipe(
    map(response => response.data),
    catchError(this.errorService.handle)
  );
}
```

---

## Giai Đoạn 3: Tạo Mock Data

### Vị Trí Chuẩn
```
libs/domain/{domain}/src/lib/mocks/
├── mock-{entity-plural}.ts     # Array data
└── index.ts                    # Re-export
```

### Chuẩn Chất Lượng Mock Data

```typescript
// libs/domain/social/src/lib/mocks/mock-hashtags.ts

import { Hashtag } from '../models/social.models';

/**
 * Mock data cho Hashtag entity.
 * Dữ liệu này tuân thủ schema trong docs/contracts/mock-api-specs.yaml#/components/schemas/Hashtag
 * KHÔNG SỬA SHAPE của data này nếu không cập nhật mock-api-specs.yaml trước.
 */
export const MOCK_TRENDING_HASHTAGS: Hashtag[] = [
  {
    tag: 'angular',
    postCount: 15_423,
    isTrending: true,
    topPost: {
      id: 'mock-post-001',
      thumbnailUrl: 'https://picsum.photos/seed/angular/200/200',
    },
    isFollowedByCurrentUser: false,
  },
  {
    tag: 'typescript',
    postCount: 12_890,
    isTrending: true,
    topPost: {
      id: 'mock-post-002',
      thumbnailUrl: 'https://picsum.photos/seed/typescript/200/200',
    },
    isFollowedByCurrentUser: true,
  },
  // Tối thiểu 5 records để test pagination
  // ...
];

// Helpers — luôn export cùng với data
export const getMockHashtagByTag = (tag: string): Hashtag | undefined =>
  MOCK_TRENDING_HASHTAGS.find(h => h.tag === tag);
```

### Tiêu Chuẩn Mock Data

| Tiêu Chí | Yêu Cầu |
|----------|---------|
| Số lượng | Tối thiểu 5 records cho danh sách |
| ID prefix | Phải có prefix `mock-` (vd: `mock-post-001`) |
| Dates | Dùng `new Date('2026-...')` — không dùng `Date.now()` |
| Images | Dùng `https://picsum.photos/seed/{unique}/` |
| Diversity | Phải có records với edge cases (null values, long strings, max values) |
| Types match | PHẢI khớp 100% với schema trong mock-api-specs.yaml |

---

## Giai Đoạn 4: Viết Code Angular

### Thứ Tự Bắt Buộc: Service → Facade → Component → Test

```
1. MODEL      libs/domain/{d}/src/lib/models/{entity}.model.ts
     ↓
2. MOCK DATA  libs/domain/{d}/src/lib/mocks/mock-{entity}.ts
     ↓
3. SERVICE    libs/domain/{d}/src/lib/services/{entity}.service.ts
     ↓
4. FACADE     libs/features/{f}/src/lib/data-access/{feature}.facade.ts
     ↓
5. COMPONENT  libs/features/{f}/src/lib/{screen}/{screen}.component.ts
     ↓
6. TEMPLATE   libs/features/{f}/src/lib/{screen}/{screen}.component.html
     ↓
7. STYLES     libs/features/{f}/src/lib/{screen}/{screen}.component.css
     ↓
8. TESTS      *.spec.ts (cùng directory)
     ↓
9. EXPORT     index.ts update
```

### Template Chuẩn — Service với Mock Fallback

```typescript
// libs/domain/social/src/lib/services/social-search.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Hashtag } from '../models/social.models';
import { MOCK_TRENDING_HASHTAGS } from '../mocks/mock-hashtags';

@Injectable({ providedIn: 'root' })
export class SocialSearchService {
  private readonly http = inject(HttpClient);

  getTrendingHashtags(limit = 20): Observable<Hashtag[]> {
    if (environment.useMocks) {
      return of(MOCK_TRENDING_HASHTAGS.slice(0, limit)).pipe(
        delay(300) // Simulate realistic network latency
      );
    }
    return this.http.get<{ data: Hashtag[] }>(
      `/api/v1/hashtags/trending`,
      { params: { limit: limit.toString() } }
    ).pipe(
      map(r => r.data),
      catchError(() => of([]))
    );
  }
}
```

### Template Chuẩn — Feature Facade với Signals

```typescript
// libs/features/home/src/lib/data-access/home.facade.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { SocialSearchService } from '@fe/domain/social';
import { Hashtag } from '@fe/domain/social';

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly searchService = inject(SocialSearchService);

  // State signals
  readonly trendingHashtags = signal<Hashtag[]>([]);
  readonly isLoadingTrending = signal(false);

  // Computed
  readonly hasTrending = computed(() => this.trendingHashtags().length > 0);

  loadTrendingHashtags(): void {
    this.isLoadingTrending.set(true);
    this.searchService.getTrendingHashtags().subscribe({
      next: (hashtags) => {
        this.trendingHashtags.set(hashtags);
        this.isLoadingTrending.set(false);
      },
      error: () => this.isLoadingTrending.set(false),
    });
  }
}
```

---

## Giai Đoạn 5: Test với Mock Data

### Unit Test Template

```typescript
// social-search.service.spec.ts
describe('SocialSearchService', () => {
  let service: SocialSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SocialSearchService,
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(SocialSearchService);
  });

  it('should return mock hashtags when useMocks is true', (done) => {
    // Mock environment
    jest.spyOn(environment, 'useMocks', 'get').mockReturnValue(true);
    
    service.getTrendingHashtags().subscribe(hashtags => {
      expect(hashtags.length).toBeGreaterThan(0);
      expect(hashtags[0]).toHaveProperty('tag');
      expect(hashtags[0]).toHaveProperty('postCount');
      done();
    });
  });
});
```

### Checklist Trước Khi Chuyển Sang Bước 6

```
□ Service test pass với mock data
□ Component render đúng với mock data
□ Loading state hoạt động
□ Empty state hiển thị khi data rỗng
□ Error state hiển thị khi có lỗi
□ Responsive trên mobile (768px) và desktop
□ Không có hardcoded text (dùng Transloco)
□ Tất cả design tokens được sử dụng đúng
```

---

## Giai Đoạn 6: Hard Contract Handover → Backend

### Khi Nào FE Feature Sẵn Sàng Bàn Giao BE?

Một feature được coi là **"Mock Complete"** khi:
- ✅ UI chạy mượt với mock data
- ✅ Tất cả user flows hoạt động
- ✅ Unit tests pass
- ✅ API spec trong `mock-api-specs.yaml` đầy đủ và chính xác
- ✅ Mock data phản ánh đúng các edge cases

### Quy Trình Bàn Giao BE

```
1. FE cập nhật status endpoint trong mock-api-specs.yaml
   Thêm tag: x-status: mock-ready

2. FE tạo task cho BE với link đến:
   - Endpoint path trong mock-api-specs.yaml
   - Schema tương ứng trong components/schemas
   - Mock data example trong libs/domain/*/mocks/

3. BE implement đúng theo spec:
   - Response shape PHẢI khớp 100% với schema
   - Không được thay đổi field names hoặc types
   - Nếu muốn thay đổi, phải thảo luận với FE trước

4. Khi BE ready, FE chỉ cần:
   - Đổi environment.useMocks = false
   - Chạy integration test
   - Không cần sửa Service code nếu BE tuân thủ spec
```

### Cam Kết Hai Phía

| Frontend | Backend |
|----------|---------|
| Thiết kế response shape theo nhu cầu UI | Implement đúng response shape đã thiết kế |
| Cung cấp mock data làm example | Dùng mock data để verify implementation |
| KHÔNG thay đổi spec sau khi bàn giao | KHÔNG tự ý thay đổi spec |
| Sẵn sàng clarify khi BE có câu hỏi | Hỏi FE trước khi deviate từ spec |

---

## Giai Đoạn 7: Integration — Switch từ Mock sang Real

### Chỉ Cần Thay Đổi Environment Flag

```typescript
// apps/app-shell/src/environments/environment.ts
export const environment = {
  production: false,
  useMocks: false, // ← Chỉ cần đổi từ true sang false
  apiBaseUrl: 'https://api.reals-platform.dev/api/v1',
};
```

### Integration Checklist

```
□ Tất cả API calls trả về đúng data shape như mock
□ Pagination hoạt động (page, pageSize, meta)
□ Authentication token được gửi đúng
□ Error handling hoạt động với real errors
□ Loading states vẫn smooth
□ Performance không tệ hơn mock (response < 500ms)
```

---

## Phụ Lục: Ví Dụ End-to-End

### Ví Dụ: Tính Năng "Trending Hashtags Sidebar"

```
[Ngày 1 — FE]
PM: "Cần sidebar hiển thị top 10 trending hashtags"

AI Agent thực hiện SOP:
1. Khảo sát: Hashtag model tồn tại trong dictionary.json ✓
             /hashtags/trending CHƯA có trong mock-api-specs.yaml ✗

2. Thêm vào mock-api-specs.yaml:
   GET /hashtags/trending
   Response: Hashtag[]

3. Tạo mock data:
   libs/domain/social/src/lib/mocks/mock-hashtags.ts
   → 10 hashtag records với diverse data

4. Viết code:
   → SocialSearchService.getTrendingHashtags()
   → HomeFacade.loadTrendingHashtags()
   → TrendingHashtagsComponent (trong right-sidebar)

[Ngày 1 — FE Done, BE chưa bắt đầu]
→ UI chạy với mock data
→ mock-api-specs.yaml được cập nhật với x-status: mock-ready

[Ngày 3 — BE nhận task]
→ BE implement GET /api/v1/hashtags/trending
→ Response shape = đúng như schema trong spec

[Ngày 4 — Integration]
→ FE đổi useMocks: false
→ Chạy E2E test
→ Done ✓
```

---

*Pipeline này đảm bảo Frontend không bao giờ phải đứng chờ Backend. Khi Backend xong, FE chỉ cần đổi một flag.*
