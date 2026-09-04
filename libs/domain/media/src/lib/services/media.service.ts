import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, appConfig, urlConfig } from '@fe/core';

export interface MediaItem {
  id: string;
  originalName?: string;
  status?: string;
  type?: string;
  storagePath?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private api = inject(ApiService);

  getMediaList(
    userId: string,
    status?: string,
    type?: string,
    page = 1,
    limit = 20,
  ): Observable<MediaItem[]> {
    const params: Record<string, string | number | boolean> = {
      userId,
      page,
      limit,
    };
    if (status) params['status'] = status;
    if (type) params['type'] = type;

    return this.api.get<MediaItem[]>(urlConfig.media.list, {
      params,
      cache: 1000 * 10,
    }).pipe(
      map(res => res.data)
    );
  }

  uploadMedia(formData: FormData) {
    return this.api.post(urlConfig.media.upload, formData);
  }

  deleteMedia(mediaId: string) {
    return this.api.delete(`${urlConfig.media.list}/${mediaId}`);
  }

  getPreviewUrl(mediaId: string) {
    return `${appConfig.apiUrl}/media/${mediaId}/preview`;
  }

  getDownloadUrl(mediaId: string) {
    return `${appConfig.apiUrl}/media/${mediaId}/download`;
  }

  getPresignedUpload(payload: { originalName: string; mimeType: string; fileSize: number; userId?: string }): Observable<{ mediaId: string; uploadUrl: string }> {
    return this.api.post<{ data: { mediaId: string; uploadUrl: string } }>(`${urlConfig.media.list}/presigned-upload`, payload).pipe(
      map(res => res.data.data) // Assuming standard response wrapper
    );
  }

  completeUpload(mediaId: string): Observable<any> {
    return this.api.post<{ data: any }>(`${urlConfig.media.list}/${mediaId}/complete`, {}).pipe(
      map(res => res.data.data)
    );
  }

  getMediaStatus(mediaId: string): Observable<{ status: string }> {
    return this.api.get<{ data: { status: string } }>(`${urlConfig.media.list}/${mediaId}/status`).pipe(
      map(res => res.data.data)
    );
  }

  uploadRawFileToMinio(url: string, file: File, contentType: string): Promise<Response> {
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file
    });
  }
}
