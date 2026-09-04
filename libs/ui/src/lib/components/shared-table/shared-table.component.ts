import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'ui-shared-table',
  imports: [CommonModule],
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css'],
})
export class SharedTableComponent {
  // expose Math to templates that reference Math functions
  Math = Math;
  @Input() columns: Array<{ key: string; label: string; sortable?: boolean }> = [];
  @Input() data: any[] = [];
  @Input() total = 0;
  @Input() pageSize = 10;
  @Input() pageIndex = 1;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' } | null>();
  @Output() rowDelete = new EventEmitter<any>();

  currentSort: { field: string; direction: 'asc' | 'desc' } | null = null;

  changePage(delta: number) {
    const next = this.pageIndex + delta;
    if (next < 1) return;
    const max = Math.max(1, Math.ceil(this.total / this.pageSize));
    if (next > max) return;
    this.pageChange.emit(next);
  }

  toggleSort(col: { key: string; label: string; sortable?: boolean }) {
    if (!col.sortable) return;
    if (!this.currentSort || this.currentSort.field !== col.key) {
      this.currentSort = { field: col.key, direction: 'asc' };
    } else if (this.currentSort.direction === 'asc') {
      this.currentSort.direction = 'desc';
    } else {
      this.currentSort = null;
    }
    this.sortChange.emit(this.currentSort);
  }

  get pageCount() {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  emitDelete(row: any) {
    this.rowDelete.emit(row);
  }
}
