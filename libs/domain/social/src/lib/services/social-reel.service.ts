import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map, from, timer, filter, take } from 'rxjs';
import { appConfig, ApiService } from '@fe/core';
import { CreateReelPayload } from '../models/social-reel.models';
import { Comment, CreateCommentPayload } from '../models';

@Injectable({ providedIn: 'root' })
export class SocialReelService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private apiUrl = appConfig.apiUrl || 'http://localhost:3000';

  getDiscoverReels(): Observable<any> {
    return this.api.get<any>('/reels/discover');
  }

  getFriendReels(): Observable<any> {
    return this.api.get<any>('/reels/feed');
  }

  createReel(payload: CreateReelPayload): Observable<any> {
    const { videoFile, description, music, privacy } = payload;
    
    // 1. Lấy Presigned URL
    return this.api.post<{ data: { mediaId: string; uploadUrl: string } }>(
      '/media/presigned-upload', 
      {
        originalName: videoFile.name,
        mimeType: videoFile.type,
        fileSize: videoFile.size
      }
    ).pipe(
      switchMap((res: any) => {
        const { mediaId, uploadUrl } = res.data ?? res;
        // 2. Upload file trực tiếp lên MinIO bằng fetch để tránh bị interceptor gắn auth header
        return from(fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': videoFile.type },
          body: videoFile
        })).pipe(
          switchMap((uploadRes) => {
            if (!uploadRes.ok) {
              throw new Error('Upload file lên MinIO thất bại');
            }
            // 3. Complete Upload báo cho media-service
            return this.api.post<{ data: any }>(`/media/${mediaId}/complete`, {});
          }),
          // 4. Polling trạng thái media cho đến khi ready
          switchMap(() => {
            return timer(0, 3000).pipe(
              switchMap(() => this.api.get<{ data: { status: string } }>(`/media/${mediaId}/status`)),
              filter((statusRes: any) => {
                const status = statusRes.data?.status ?? statusRes.status;
                return status === 'ready' || status === 'failed';
              }),
              take(1),
              switchMap((statusRes: any) => {
                const status = statusRes.data?.status ?? statusRes.status;
                if (status === 'failed') {
                  throw new Error('Xử lý media thất bại');
                }
                // 5. Tạo Reel
                const dto: any = {
                  content: description,
                  mediaId: mediaId,
                };
                if (music) dto.musicId = music;
                if (privacy) dto.visibility = privacy;
                
                return this.api.post<any>('/reels', dto).pipe(map(r => r.data ?? r));
              })
            );
          })
        );
      })
    );
  }

  /** @deprecated Use getReelComments() in SocialReelFacade with Comment[] mapping instead */
  getReelComments(reelId: string): Observable<any> {
    return this.api.get<any>(`/reels/${reelId}/comments`);
  }

  /**
   * Get reel comments mapped to standard Comment model.
   * Shares endpoint with post comments (/reels/{id}/comments) but maps
   * to the same Comment interface for consistency with CommentThreadPanel.
   */
  getReelCommentsAsComments(reelId: string): Observable<Comment[]> {
    return this.api.get<any>(`/reels/${reelId}/comments`).pipe(
      map((res: any) => {
        const rawComments = Array.isArray(res?.data) ? res.data : [];
        return rawComments.map((c: any) => this.mapToComment(c, reelId));
      })
    );
  }

  /**
   * Submit a comment or reply on a reel with full payload support
   * (mentionedUserIds, mentionRanges, replyToCommentId).
   */
  submitReelComment(reelId: string, payload: CreateCommentPayload): Observable<Comment> {
    const body: any = {
      content: payload.content,
    };
    if (payload.replyToCommentId) {
      body.parentId = payload.replyToCommentId;
    }
    if (payload.mentionedUserIds?.length) {
      body.mentionedUserIds = payload.mentionedUserIds;
    }
    if (payload.mentionRanges?.length) {
      body.mentionRanges = payload.mentionRanges;
    }

    return this.api.post<any>(`/reels/${reelId}/comments`, body).pipe(
      map((res: any) => this.mapToComment(res?.data ?? res, reelId))
    );
  }

  likeReel(reelId: string): Observable<any> {
    return this.api.post<any>(`/reels/${reelId}/like`, {});
  }

  unlikeReel(reelId: string): Observable<any> {
    return this.api.delete<any>(`/reels/${reelId}/like`);
  }

  likeComment(commentId: string): Observable<any> {
    return this.api.post<any>(`/comments/${commentId}/like`, {});
  }

  unlikeComment(commentId: string): Observable<any> {
    return this.api.delete<any>(`/comments/${commentId}/like`);
  }

  /** @deprecated Use submitReelComment() for full payload support */
  submitComment(reelId: string, content: string): Observable<any> {
    return this.api.post<any>(`/reels/${reelId}/comments`, { content }).pipe(map(res => res.data));
  }

  private mapToComment(raw: any, fallbackPostId: string): Comment {
    const author = raw?.author ?? {};
    return {
      id: raw?.id ?? '',
      author: {
        id: author.id ?? author.userId ?? '',
        username: author.username ?? '',
        fullName: author.displayName ?? author.fullName ?? author.username ?? '',
        avatar: author.avatarUrl ?? author.avatar ?? '',
        bio: author.bio ?? '',
        followers: 0,
        following: 0,
        postsCount: 0,
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
        isMuted: false,
      },
      postId: raw?.postId ?? fallbackPostId,
      content: raw?.content ?? '',
      createdAt: raw?.createdAt ? new Date(raw.createdAt) : new Date(),
      updatedAt: raw?.updatedAt ? new Date(raw.updatedAt) : new Date(),
      likesCount: Number(raw?.likeCount ?? raw?.likesCount ?? 0),
      isLiked: Boolean(raw?.isLikedByCurrentUser ?? raw?.isLiked ?? false),
      replies: Array.isArray(raw?.replies)
        ? raw.replies.map((r: any) => this.mapToComment(r, fallbackPostId))
        : [],
      mentionedUsers: Array.isArray(raw?.mentionedUsers) ? raw.mentionedUsers : [],
      mentionRanges: Array.isArray(raw?.mentionRanges)
        ? raw.mentionRanges.map((mr: any) => ({
            userId: mr.userId ?? mr.user_id ?? '',
            start: Number(mr.start ?? 0),
            end: Number(mr.end ?? 0),
          }))
        : [],
      replyCount: Number(raw?.replyCount ?? raw?.reply_count ?? 0),
      parentId: raw?.parentId ?? null,
    };
  }
}
