import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileItem, ListFilesParams, ListFilesResponse } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class MediaApiService {
  private base = '/api/v1/media';

  constructor(private http: HttpClient) {}

  list(params: ListFilesParams = {}): Observable<ListFilesResponse> {
    let httpParams = new HttpParams();
    if (params.page != null) httpParams = httpParams.set('page', String(params.page));
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', String(params.pageSize));
    if (params.sort) httpParams = httpParams.set('sort', `${params.sort.field}:${params.sort.direction}`);
    if (params.filter) {
      Object.entries(params.filter).forEach(([k, v]) => {
        if (v != null) {
          httpParams = httpParams.set(`filter[${k}]`, String(v));
        }
      });
    }
    return this.http.get<ListFilesResponse>(this.base, { params: httpParams });
  }

  get(id: string): Observable<FileItem> {
    return this.http.get<FileItem>(`${this.base}/${id}`);
  }

  create(payload: Partial<FileItem>): Observable<FileItem> {
    return this.http.post<FileItem>(this.base, payload);
  }

  update(id: string, payload: Partial<FileItem>): Observable<FileItem> {
    return this.http.put<FileItem>(`${this.base}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
