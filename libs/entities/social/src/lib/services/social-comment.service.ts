/**
 * @fileoverview Comment service - handles comment operations
 * PHASE 5: Uses mock data. Replace with actual API service in Phase 5B.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { Comment, CreateCommentPayload } from '../models';
import { MOCK_COMMENTS } from '../mocks/mock-data';
import { ApiService } from '@fe/core';
import { insertCommentIntoTree } from '../utils/comment-tree';

@Injectable({
  providedIn: 'root',
})
export class SocialCommentService {
  private readonly api = inject(ApiService);
  private comments = { ...MOCK_COMMENTS };

  /**
   * Get comments for a post
   */
  getComments(postId: string): Observable<Comment[]> {
    return this.api.get<any>(`/posts/${postId}/comments`).pipe(
      map((res: any) => {
        const rawComments = Array.isArray(res?.data) ? res.data : [];
        return rawComments.map((comment: any) => this.mapComment(comment, postId));
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Get a single comment
   */
  getComment(commentId: string): Observable<Comment | null> {
    // Flat search through all comments and their replies
    let found: Comment | null = null;

    Object.values(this.comments).forEach((comments) => {
      const search = (items: Comment[]): Comment | null => {
        for (const comment of items) {
          if (comment.id === commentId) {
            return comment;
          }
          const reply = search(comment.replies);
          if (reply) {
            return reply;
          }
        }
        return null;
      };

      if (!found) {
        found = search(comments);
      }
    });

    return of(found).pipe(delay(300));
  }

  /**
   * Create a new comment
   */
  createComment(payload: CreateCommentPayload): Observable<Comment> {
    const body = {
      content: payload.content,
      parentId: payload.replyToCommentId ?? undefined,
      mentionedUserIds: payload.mentionedUserIds ?? payload.mentionedUsers ?? [],
      mentionRanges: payload.mentionRanges ?? [],
    };

    return this.api.post<any>(`/posts/${payload.postId}/comments`, body).pipe(
      map((res: any) => this.mapComment(res?.data ?? res, payload.postId)),
      catchError(() => {
        const fallbackComment: Comment = {
          id: `comment-${Date.now()}`,
          author: {
            id: 'user-001',
            username: 'duc_dai',
            fullName: 'Đức Đại',
            avatar: 'https://i.pravatar.cc/150?img=12',
            bio: '🚀 Full-stack dev',
            followers: 1250,
            following: 340,
            postsCount: 43,
            isFollowing: false,
            isFollowedBy: false,
            isBlocked: false,
            isMuted: false,
          },
          postId: payload.postId,
          content: payload.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          likesCount: 0,
          isLiked: false,
          replies: [],
          mentionedUsers: payload.mentionedUserIds ?? payload.mentionedUsers ?? [],
          mentionRanges: payload.mentionRanges ?? [],
          replyCount: 0,
          parentId: payload.replyToCommentId ?? null,
        };

        if (payload.replyToCommentId) {
          this.addReply(payload.replyToCommentId, fallbackComment);
        } else {
          if (!this.comments[payload.postId]) {
            this.comments[payload.postId] = [];
          }
          this.comments[payload.postId] = [fallbackComment, ...this.comments[payload.postId]];
        }

        return of(fallbackComment).pipe(delay(600));
      })
    );
  }

  private mapComment(raw: any, fallbackPostId: string): Comment {
    const author = raw?.author ?? {};
    const normalizedRaw = raw ?? {};

    return {
      id: normalizedRaw.id ?? '',
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
      postId: normalizedRaw.postId ?? fallbackPostId,
      content: normalizedRaw.content ?? '',
      createdAt: normalizedRaw.createdAt ? new Date(normalizedRaw.createdAt) : new Date(),
      updatedAt: normalizedRaw.updatedAt ? new Date(normalizedRaw.updatedAt) : new Date(),
      likesCount: Number(normalizedRaw.likeCount ?? normalizedRaw.likesCount ?? 0),
      isLiked: Boolean(normalizedRaw.isLikedByCurrentUser ?? normalizedRaw.isLiked ?? false),
      replies: Array.isArray(normalizedRaw.replies)
        ? normalizedRaw.replies.map((reply: any) => this.mapComment(reply, normalizedRaw.postId ?? fallbackPostId))
        : [],
      mentionedUsers: Array.isArray(normalizedRaw.mentionedUsers) ? normalizedRaw.mentionedUsers : [],
      mentionRanges: Array.isArray(normalizedRaw.mentionRanges)
        ? normalizedRaw.mentionRanges.map((range: any) => ({
            userId: range.userId ?? range.user_id ?? '',
            start: Number(range.start ?? 0),
            end: Number(range.end ?? 0),
          }))
        : [],
      replyCount: Number(normalizedRaw.replyCount ?? normalizedRaw.reply_count ?? 0),
      parentId: normalizedRaw.parentId ?? null,
    };
  }

  /**
   * Add a reply to a comment
   */
  private addReply(parentCommentId: string, reply: Comment): void {
    Object.values(this.comments).forEach((comments) => {
      const updatedComments = insertCommentIntoTree(comments, reply, parentCommentId);
      if (updatedComments !== comments) {
        Object.assign(comments, updatedComments);
      }
    });
  }

  /**
   * Update a comment
   */
  updateComment(commentId: string, content: string): Observable<Comment> {
    return this.api.put<any>(`/comments/${commentId}`, { content }).pipe(
      map((res: any) => this.mapComment(res?.data ?? res, '')),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Delete a comment
   */
  deleteComment(commentId: string): Observable<void> {
    return this.api.delete<any>(`/comments/${commentId}`).pipe(
      map(() => undefined),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Like/Unlike a comment
   */
  toggleCommentLike(commentId: string, currentlyLiked = false): Observable<{ isLiked: boolean; likesCount: number }> {
    const request$ = currentlyLiked
      ? this.api.delete<any>(`/comments/${commentId}/like`)
      : this.api.post<any>(`/comments/${commentId}/like`);

    return request$.pipe(
      map((res: any) => {
        const payload = res?.data ?? res ?? {};
        return {
          isLiked: Boolean(payload.isLikedByCurrentUser ?? payload.isLiked ?? !currentlyLiked),
          likesCount: Number(payload.likeCount ?? payload.likesCount ?? 0),
        };
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Get replies for a comment
   */
  getReplies(commentId: string): Observable<Comment[]> {
    return this.api.get<any>(`/comments/${commentId}/replies`).pipe(
      map((res: any) => {
        const rawReplies = Array.isArray(res?.data) ? res.data : [];
        return rawReplies.map((reply: any) => this.mapComment(reply, ''));
      }),
      catchError(() => of([]))
    );
  }
}
