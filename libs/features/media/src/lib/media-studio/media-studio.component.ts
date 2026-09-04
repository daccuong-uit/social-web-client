import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaApiService } from '../services/media-api.service';
import { FileItem, ListFilesParams } from '../models/media.model';
import { SharedTableComponent } from '@fe/ui';
import { BottomMenuComponent } from '@fe/features/home';


@Component({
  standalone: true,
  selector: 'feature-media-studio',
  imports: [CommonModule, SharedTableComponent, BottomMenuComponent],
  templateUrl: './media-studio.component.html',
  styleUrls: ['./media-studio.component.css'],
})
export class MediaStudioComponent implements OnInit {
  items: FileItem[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  loading = false;
  sort: { field: string; direction: 'asc' | 'desc' } | null = null;
  filters: Record<string, string | number | boolean | undefined> = {};

  columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'size', label: 'Size', sortable: true },
    { key: 'createdAt', label: 'Created', sortable: true },
  ];

  constructor(private api: MediaApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    const params: ListFilesParams = {
      page: this.page,
      pageSize: this.pageSize,
      sort: this.sort || undefined,
      filter: Object.keys(this.filters).length ? this.filters : undefined,
    };
    this.api.list(params).subscribe((res) => {
      this.items = res.items;
      this.total = res.total;
      this.page = res.page;
      this.pageSize = res.pageSize;
      this.loading = false;
    }, () => (this.loading = false));
  }

  onPageChange(page: number) {
    this.page = page;
    this.load();
  }

  onSortChange(sort: { field: string; direction: 'asc' | 'desc' } | null) {
    this.sort = sort;
    this.load();
  }

  onFilterChange(filters: Record<string, string | number | boolean | undefined>) {
    this.filters = filters;
    this.page = 1;
    this.load();
  }

  onDelete(row: FileItem) {
    if (!confirm(`Delete "${row.name}"?`)) return;
    this.api.delete(row.id).subscribe(() => this.load());
  }
}
