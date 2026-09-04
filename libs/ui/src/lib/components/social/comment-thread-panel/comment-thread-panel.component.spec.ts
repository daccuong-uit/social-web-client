import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { CommentThreadPanelComponent, CommentThreadTarget } from './comment-thread-panel.component';
import { Comment, SocialCommentService } from '@fe/domain/social';

describe('CommentThreadPanelComponent', () => {
  let component: CommentThreadPanelComponent;
  let fixture: ComponentFixture<CommentThreadPanelComponent>;
  let getRepliesSpy: { calls: string[] };

  beforeEach(async () => {
    getRepliesSpy = { calls: [] };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, CommentThreadPanelComponent],
      providers: [
        {
          provide: SocialCommentService,
          useValue: {
            getReplies: (commentId: string) => {
              getRepliesSpy.calls.push(commentId);
              return of([]);
            },
            toggleCommentLike: (commentId: string, currentlyLiked: boolean) => of({
              isLiked: !currentlyLiked,
              likesCount: currentlyLiked ? 0 : 2,
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CommentThreadPanelComponent);
    component = fixture.componentInstance;
    component.target = {
      id: 'post-1',
      type: 'post',
      title: 'Bài viết mẫu',
      description: 'Mô tả mẫu cho bài viết',
      previewImage: 'https://picsum.photos/seed/comment/640/360',
    } as CommentThreadTarget;
    component.comments = [
      {
        id: 'c1',
        author: {
          id: 'u1',
          username: 'alice',
          fullName: 'Alice',
          avatar: 'https://i.pravatar.cc/150?img=1',
          bio: '',
          followers: 0,
          following: 0,
          postsCount: 0,
          isFollowing: false,
          isFollowedBy: false,
          isBlocked: false,
          isMuted: false,
        },
        postId: 'post-1',
        content: 'Bình luận đầu tiên',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 1,
        isLiked: false,
        replies: [],
        mentionedUsers: ['bob'],
      } as Comment,
    ];
    fixture.detectChanges();
  });

  it('should emit a comment payload when submitting a non-empty message', () => {
    const calls: Array<{ content: string; replyToCommentId?: string; mentionedUsers: string[]; mentionedUserIds: string[]; mentionRanges: Array<{ userId: string; start: number; end: number }> }> = [];
    component.submitComment.emit = ((payload: { content: string; replyToCommentId?: string; mentionedUsers: string[]; mentionedUserIds: string[]; mentionRanges: Array<{ userId: string; start: number; end: number }> }) => {
      calls.push(payload);
    }) as never;
    component.draftComment = 'Bình luận mới';

    component.onSubmitComment();

    expect(calls).toEqual([{ postId: 'post-1', content: 'Bình luận mới', replyToCommentId: undefined, mentionedUsers: [], mentionedUserIds: [], mentionRanges: [] }]);
  });

  it('should insert a display-name based mention when replying to a comment', () => {
    component.setReplyTarget('c1', 'Nguyễn Văn A', 'nguyenvana', 'u1');

    expect(component.draftComment).toContain('@Nguyễn Văn A');
  });

  it('should strip the leading @ from mentions before emitting the payload', () => {
    const calls: Array<{ content: string; replyToCommentId?: string; mentionedUsers: string[]; mentionedUserIds: string[]; mentionRanges: Array<{ userId: string; start: number; end: number }> }> = [];
    component.submitComment.emit = ((payload: { content: string; replyToCommentId?: string; mentionedUsers: string[]; mentionedUserIds: string[]; mentionRanges: Array<{ userId: string; start: number; end: number }> }) => {
      calls.push(payload);
    }) as never;

    component.draftComment = '@Nguyễn Văn A tuyệt vời';
    component.mentionRanges = [{ userId: 'u1', start: 0, end: 13 }];

    component.onSubmitComment();

    expect(calls[0].content).toBe('Nguyễn Văn A tuyệt vời');
    expect(calls[0].mentionRanges[0]).toEqual({ userId: 'u1', start: 0, end: 12 });
  });

  it('should resolve replies to the top-level parent when submitting', () => {
    component.comments = [
      {
        id: 'root-1',
        author: {
          id: 'u1',
          username: 'alice',
          fullName: 'Alice',
          avatar: '',
          bio: '',
          followers: 0,
          following: 0,
          postsCount: 0,
          isFollowing: false,
          isFollowedBy: false,
          isBlocked: false,
          isMuted: false,
        },
        postId: 'post-1',
        content: 'root comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isLiked: false,
        replies: [
          {
            id: 'reply-1',
            author: {
              id: 'u2',
              username: 'bob',
              fullName: 'Bob',
              avatar: '',
              bio: '',
              followers: 0,
              following: 0,
              postsCount: 0,
              isFollowing: false,
              isFollowedBy: false,
              isBlocked: false,
              isMuted: false,
            },
            postId: 'post-1',
            content: 'nested reply',
            createdAt: new Date(),
            updatedAt: new Date(),
            likesCount: 0,
            isLiked: false,
            replies: [],
            mentionedUsers: [],
            replyCount: 0,
            parentId: 'root-1',
          } as Comment,
        ],
        mentionedUsers: [],
        replyCount: 1,
      } as Comment,
    ];

    const calls: Array<{ content: string; replyToCommentId?: string }> = [];
    component.submitComment.emit = ((payload: { content: string; replyToCommentId?: string }) => {
      calls.push(payload);
    }) as never;

    component.setReplyTarget('reply-1', 'Bob', 'bob', 'u2');
    component.draftComment = 'reply to nested comment';
    component.onSubmitComment();

    expect(calls[0].replyToCommentId).toBe('root-1');
  });

  it('should toggle like state for a comment and update the local count', () => {
    const comment = component.comments[0];

    component.onToggleLike(comment.id);

    expect(comment.isLiked).toBeTrue();
    expect(comment.likesCount).toBe(2);
  });

  it('should load and expand replies when a comment has replyCount', () => {
    const replyService = TestBed.inject(SocialCommentService) as unknown as { getReplies: (commentId: string) => any };
    const comment = {
      ...component.comments[0],
      replyCount: 2,
      replies: [],
    } as Comment;
    const childReply = {
      id: 'c2',
      author: {
        id: 'u2',
        username: 'bob',
        fullName: 'Bob',
        avatar: '',
        bio: '',
        followers: 0,
        following: 0,
        postsCount: 0,
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
        isMuted: false,
      },
      postId: 'post-1',
      content: 'Phản hồi đầu tiên',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
    } as Comment;

    replyService.getReplies = (commentId: string) => {
      getRepliesSpy.calls.push(commentId);
      return of([childReply]);
    };

    component.toggleReplies(comment);

    expect(getRepliesSpy.calls).toContain(comment.id);
    expect(component.isReplyExpanded(comment.id)).toBeTruthy();
    expect(comment.replies).toEqual([childReply]);
  });
});
