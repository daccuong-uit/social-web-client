export interface FileItem {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  type?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ListFilesParams {
  filter?: Record<string, string | number | boolean | undefined>;
  sort?: { field: string; direction: 'asc' | 'desc' };
  page?: number;
  pageSize?: number;
}

export interface ListFilesResponse {
  items: FileItem[];
  total: number;
  page: number;
  pageSize: number;
}
