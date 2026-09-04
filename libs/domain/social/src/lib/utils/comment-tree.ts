import { Comment } from '../models';

export interface CommentContentFragment {
  type: 'text' | 'mention';
  value: string;
  username?: string;
  userId?: string;
  start?: number;
  end?: number;
}

export function canRenderCommentLevel(level: number, maxDepth = 2): boolean {
  return level < maxDepth;
}

export function parseCommentContentFragments(content: string, mentionRanges: Array<{ userId: string; start: number; end: number }> = []): CommentContentFragment[] {
  if (!content) {
    return [];
  }

  const fragments: CommentContentFragment[] = [];
  let cursor = 0;

  mentionRanges
    .slice()
    .sort((a, b) => a.start - b.start)
    .forEach((range) => {
      const safeStart = Math.max(0, Math.min(range.start, content.length));
      const safeEnd = Math.max(safeStart, Math.min(range.end, content.length));

      if (safeStart > cursor) {
        fragments.push({ type: 'text', value: content.slice(cursor, safeStart) });
      }

      if (safeEnd > safeStart) {
        fragments.push({
          type: 'mention',
          value: content.slice(safeStart, safeEnd),
          username: content.slice(safeStart, safeEnd).replace(/^@/, ''),
          userId: range.userId,
          start: safeStart,
          end: safeEnd,
        });
      }

      cursor = safeEnd;
    });

  if (cursor < content.length) {
    fragments.push({ type: 'text', value: content.slice(cursor) });
  }

  return fragments;
}

function findCommentPath(comments: Comment[], commentId: string, path: string[] = []): string[] | null {
  for (const item of comments) {
    const nextPath = [...path, item.id];

    if (item.id === commentId) {
      return nextPath;
    }

    const childPath = findCommentPath(item.replies ?? [], commentId, nextPath);
    if (childPath) {
      return childPath;
    }
  }

  return null;
}

function insertCommentUnderParent(comments: Comment[], comment: Comment, parentCommentId?: string): Comment[] {
  return comments.map((item) => {
    if (item.id === parentCommentId) {
      const nextReplies = [...(item.replies ?? []), comment];
      return {
        ...item,
        replies: nextReplies,
        replyCount: (item.replyCount ?? item.replies?.length ?? 0) + 1,
      } as Comment;
    }

    if ((item.replies?.length ?? 0) > 0) {
      return {
        ...item,
        replies: insertCommentUnderParent(item.replies ?? [], comment, parentCommentId),
      } as Comment;
    }

    return item;
  });
}

export function insertCommentIntoTree(comments: Comment[], comment: Comment, parentCommentId?: string): Comment[] {
  if (!parentCommentId) {
    return [comment, ...comments];
  }

  const path = findCommentPath(comments, parentCommentId);
  if (!path?.length) {
    return comments;
  }

  return insertCommentUnderParent(comments, comment, parentCommentId);
}

export function mergeCommentsWithServer(existingComments: Comment[], incomingComments: Comment[]): Comment[] {
  const mergedById = new Map<string, Comment>();

  existingComments.forEach((comment) => {
    mergedById.set(comment.id, comment);
  });

  incomingComments.forEach((comment) => {
    const existingComment = mergedById.get(comment.id);
    if (existingComment) {
      mergedById.set(comment.id, {
        ...comment,
        replies: mergeCommentsWithServer(existingComment.replies ?? [], comment.replies ?? []),
        replyCount: comment.replyCount ?? existingComment.replyCount ?? Math.max((comment.replies?.length ?? 0), (existingComment.replies?.length ?? 0)),
      });
      return;
    }

    mergedById.set(comment.id, comment);
  });

  return Array.from(mergedById.values());
}

export function replaceOptimisticComment(comments: Comment[], optimisticId: string, comment: Comment): Comment[] {
  return comments.flatMap((item) => {
    if (item.id === optimisticId) {
      return [comment];
    }

    if ((item.replies?.length ?? 0) > 0) {
      const updatedReplies = replaceOptimisticComment(item.replies ?? [], optimisticId, comment);
      if (updatedReplies !== item.replies) {
        return [{ ...item, replies: updatedReplies } as Comment];
      }
    }

    return [item];
  });
}
