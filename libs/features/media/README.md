# Media Feature

This feature contains two distinct media management pages:

- `/media` — **Media Platform**: creator-specific file management, upload, preview, and delete for the authenticated user's assets.
- `/media/studio` — **Media Studio**: admin/system media management, listing all assets with filtering, sorting, pagination, and delete support.

## Structure

- `libs/features/media/src/lib/lib.routes.ts` — feature route definitions
- `libs/features/media/src/lib/media/media-platform.component.ts` — creator file management page
- `libs/features/media/src/lib/media-studio/media-studio.component.ts` — admin media studio page
- `libs/features/media/src/lib/services/media-api.service.ts` — shared CRUD/list API client for media
- `libs/features/media/src/lib/models/media.model.ts` — media list and item models
- `libs/ui/src/lib/components/shared-table` — reusable table for admin/media lists

## Behavior

- `/media` is focused on the current user and uses backend media services to load only that user's media items.
- `/media/studio` is focused on system-wide management and calls the same media API with list/filter/sort/pagination support.
- The shared table component provides generic list behavior that can be reused for other admin tables later.

## API contract

- `MediaApiService.list(params)` supports:
  - `page`, `pageSize`
  - `sort` with `field` + `direction`
  - `filter` by arbitrary fields via `filter[field]=value`
- `MediaApiService.create`, `update`, `get`, `delete` are available for future CRUD workflows.

## Notes

- This feature is intentionally split into creator and admin UX to keep the two flows separate.
- The media domain library is available via `@fe/domain/media` for backend contract and API helpers.
- `@fe/ui` exports `SharedTableComponent` to keep list/table UI reusable across features.
