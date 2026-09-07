import { Comment } from '../models';
import { canRenderCommentLevel, insertCommentIntoTree, mergeCommentsWithServer, parseCommentContentFragments, replaceOptimisticComment } from './comment-tree';

describe('canRenderCommentLevel', () => {
  it('allows only two visible levels of nested replies', () => {
    expect(canRenderCommentLevel(0)).toBeTrue();
    expect(canRenderCommentLevel(1)).toBeTrue();
    expect(canRenderCommentLevel(2)).toBeFalse();
  });
});

describe('parseCommentContentFragments', () => {
  it('splits plain text and mentions into separate fragments', () => {
    const fragments = parseCommentContentFragments('Xin chào @daccuong2 và @alice');

    expect(fragments).toEqual([
      { type: 'text', value: 'Xin chào ' },
      { type: 'mention', value: '@daccuong2', username: 'daccuong2' },
      { type: 'text', value: ' và ' },
      { type: 'mention', value: '@alice', username: 'alice' },
    ]);
  });
});

describe('insertCommentIntoTree', () => {
  it('inserts a reply under the targeted parent comment and increments replyCount', () => {
    const comments: Comment[] = [
      {
        id: 'c1',
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
        postId: 'p1',
        content: 'root comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isLiked: false,
        replies: [],
        mentionedUsers: [],
        replyCount: 0,
      },
    ];

    const reply: Comment = {
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
      postId: 'p1',
      content: 'reply comment',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
    };

    const next = insertCommentIntoTree(comments, reply, 'c1');

    expect(next[0].replies).toHaveLength(1);
    expect(next[0].replies[0].id).toBe('c2');
    expect(next[0].replyCount).toBe(1);
  });

  it('flattens replies to replies into the same parent thread to keep nesting to two levels', () => {
    const root: Comment = {
      id: 'c1',
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
      postId: 'p1',
      content: 'root comment',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
    };

    const firstReply: Comment = {
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
      postId: 'p1',
      content: 'first reply',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
      parentId: 'c1',
    };

    const secondReply: Comment = {
      id: 'c3',
      author: {
        id: 'u3',
        username: 'carol',
        fullName: 'Carol',
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
      postId: 'p1',
      content: 'second reply',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
      parentId: 'c2',
    };

    const withFirstReply = insertCommentIntoTree([root], firstReply, 'c1');
    const withSecondReply = insertCommentIntoTree(withFirstReply, secondReply, 'c2');

    expect(withSecondReply[0].replies).toHaveLength(2);
    expect(withSecondReply[0].replies[0].id).toBe('c2');
    expect(withSecondReply[0].replies[1].id).toBe('c3');
    expect(withSecondReply[0].replies[1].parentId).toBe('c1');
    expect(withSecondReply[0].replyCount).toBe(2);
  });

  it('replaces an optimistic reply inside nested comment trees', () => {
    const existing: Comment[] = [
      {
        id: 'root',
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
        postId: 'p1',
        content: 'root comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isLiked: false,
        replies: [
          {
            id: 'optimistic-reply',
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
            postId: 'p1',
            content: 'optimistic reply',
            createdAt: new Date(),
            updatedAt: new Date(),
            likesCount: 0,
            isLiked: false,
            replies: [],
            mentionedUsers: [],
            replyCount: 0,
          },
        ],
        mentionedUsers: [],
        replyCount: 1,
      },
    ];

    const replaced = replaceOptimisticComment(existing, 'optimistic-reply', {
      id: 'server-reply',
      author: {
        id: 'u3',
        username: 'carol',
        fullName: 'Carol',
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
      postId: 'p1',
      content: 'server reply',
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      isLiked: false,
      replies: [],
      mentionedUsers: [],
      replyCount: 0,
    });

    expect(replaced[0].replies[0].id).toBe('server-reply');
    expect(replaced[0].replies[0].content).toBe('server reply');
  });

  it('preserves optimistic comments when server data arrives later', () => {
    const existing: Comment[] = [
      {
        id: 'c1',
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
        postId: 'p1',
        content: 'optimistic comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isLiked: false,
        replies: [],
        mentionedUsers: [],
        replyCount: 0,
      },
    ];

    const incoming: Comment[] = [
      {
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
        postId: 'p1',
        content: 'server comment',
        createdAt: new Date(),
        updatedAt: new Date(),
        likesCount: 0,
        isLiked: false,
        replies: [],
        mentionedUsers: [],
        replyCount: 0,
      },
    ];

    const merged = mergeCommentsWithServer(existing, incoming);

    expect(merged).toHaveLength(2);
    expect(merged.some((comment) => comment.id === 'c1')).toBeTrue();
    expect(merged.some((comment) => comment.id === 'c2')).toBeTrue();
  });
});
