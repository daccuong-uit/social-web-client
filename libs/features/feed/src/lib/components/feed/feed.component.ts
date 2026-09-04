import { Component, OnInit, computed, signal, inject, ElementRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { PostCardComponent, UiButton, CreatePostModalComponent, SkeletonCardComponent, CommentThreadPanelComponent, CommentThreadTarget, FeedReelsStripComponent, CreateReelModalComponent } from '@fe/ui';
import { Router } from '@angular/router';
import { FeedFacade } from '../../data-access/feed.facade';
import { AuthService, TabKeepAliveService } from '@fe/core';
import { Comment, CreateCommentPayload, Post, SocialCommentService, SocialReelFacade, CreateReelPayload } from '@fe/domain/social';
import { insertCommentIntoTree, mergeCommentsWithServer, replaceOptimisticComment } from '@fe/domain/social';

@Component({
  standalone: true,
  imports: [CommonModule, PostCardComponent, UiButton, CreatePostModalComponent, SkeletonCardComponent, CommentThreadPanelComponent, FeedReelsStripComponent, CreateReelModalComponent],
  selector: 'fe-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent implements OnInit {
  private feedFacade = inject(FeedFacade);
  private authService = inject(AuthService);
  private socialCommentService = inject(SocialCommentService);
  private reelFacade = inject(SocialReelFacade);
  private keepAlive = inject(TabKeepAliveService);
  private elementRef = inject(ElementRef);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  posts = this.feedFacade.posts;
  isLoading = this.feedFacade.isLoading;
  error = this.feedFacade.error;
  activeTab = signal<'posts' | 'videos' | 'shop' | 'stories'>('posts');
  searchQuery = signal('');
  isCreatePostModalOpen = signal(false);
  isCreateReelModalOpen = signal(false);
  isCommentPanelOpen = signal(false);
  selectedCommentTarget = signal<CommentThreadTarget | null>(null);
  selectedComments = signal<Comment[]>([]);
  postToShare = signal<Post | undefined>(undefined);
  currentUser = computed(() => this.authService.user());

  filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const currentPosts = this.posts();
    if (!query) {
      return currentPosts;
    }

    return currentPosts.filter((post) => {
      const content = post.content?.toLowerCase() ?? '';
      const author = post.author.fullName?.toLowerCase() ?? post.author.username?.toLowerCase() ?? '';
      const hashtags = post.hashtags?.join(' ').toLowerCase() ?? '';
      const mentions = post.mentions?.join(' ').toLowerCase() ?? '';
      return [content, author, hashtags, mentions].some((value) => value.includes(query));
    });
  });

  displayedPostsCount = computed(() => this.filteredPosts().length);
  feedMeta = computed(() =>
    this.searchQuery().trim()
      ? `Kết quả tìm kiếm cho "${this.searchQuery()}"`
      : ''
  );

  // Show 3 skeleton cards while loading
  skeletonItems = [1, 2, 3];

  ngOnInit(): void {
    this.feedFacade.loadFeed();
    this.reelFacade.loadFriendReels();
    this.authService.checkAuth();

    // When the user re-clicks the already-active Home tab:
    // scroll the feed container to the top and refetch posts.
    this.keepAlive
      .refreshFor('/home')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.scrollToTop();
        this.feedFacade.loadFeed();
        this.reelFacade.loadFriendReels();
      });
  }

  /** Scroll the feed's host element back to the top. */
  private scrollToTop(): void {
    // Walk up the DOM to find the nearest scrollable ancestor
    // (the <main> element in app-shell.component.html)
    let el: HTMLElement | null = this.elementRef.nativeElement as HTMLElement;
    while (el) {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      el = el.parentElement;
    }
    // Fallback: scroll the window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  onCreatePost(): void {
    this.isCreatePostModalOpen.set(true);
  }

  onCloseCreatePost(): void {
    this.isCreatePostModalOpen.set(false);
    this.postToShare.set(undefined);
  }

  onOpenCreateReel(): void {
    this.isCreateReelModalOpen.set(true);
  }

  onCloseCreateReel(): void {
    this.isCreateReelModalOpen.set(false);
  }

  onSubmitReel(payload: CreateReelPayload): void {
    this.reelFacade.createReel(payload).subscribe();
    this.isCreateReelModalOpen.set(false);
  }

  onSubmitPost(event: any): void {
    this.feedFacade.createPost(event);
    this.isCreatePostModalOpen.set(false);
    this.postToShare.set(undefined);
  }

  onOpenShareModal(post: Post): void {
    // If this post is itself a repost, share the original post instead
    const postToShare = post.originalPost ?? post;
    this.postToShare.set(postToShare);
    this.isCreatePostModalOpen.set(true);
  }

  onToggleLike(postId: string): void {
    this.feedFacade.toggleLike(postId);
  }

  onOpenComments(post: Post): void {
    this.selectedCommentTarget.set({
      id: post.id,
      type: 'post',
      title: post.content?.slice(0, 60) || 'Bài viết',
      description: post.author?.fullName ? `Đăng bởi ${post.author.fullName}` : undefined,
      previewImage: post.images?.[0],
      badge: 'Bài đăng',
      post,
    });
    this.selectedComments.set([]);
    this.isCommentPanelOpen.set(true);

    this.socialCommentService.getComments(post.id).subscribe((comments) => {
      this.selectedComments.update((currentComments) => mergeCommentsWithServer(currentComments, comments));
    });
  }

  onCloseCommentPanel(): void {
    this.isCommentPanelOpen.set(false);
    this.selectedCommentTarget.set(null);
    this.selectedComments.set([]);
  }

  onSubmitComment(payload: CreateCommentPayload): void {
    const optimisticId = `optimistic-${Date.now()}`;
    const currentUser = this.authService.user();
    const optimisticComment: Comment = {
      id: optimisticId,
      author: {
        id: currentUser?.userId ?? currentUser?.id ?? 'me',
        username: currentUser?.username ?? 'me',
        fullName: currentUser?.displayName ?? currentUser?.username ?? 'Bạn',
        avatar: 'https://i.pravatar.cc/150?img=12',
        bio: '',
        followers: 0,
        following: 0,
        postsCount: 0,
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

    this.selectedComments.update((comments) => {
      if (payload.replyToCommentId) {
        return insertCommentIntoTree(comments, optimisticComment, payload.replyToCommentId);
      }

      return [optimisticComment, ...comments];
    });

    this.socialCommentService.createComment(payload).subscribe({
      next: (comment) => {
        this.selectedComments.update((comments) => {
          if (!comment?.id) {
            return comments;
          }

          return replaceOptimisticComment(comments, optimisticId, {
            ...optimisticComment,
            ...comment,
            author: comment.author ?? optimisticComment.author,
            replies: comment.replies ?? [],
            mentionedUsers: comment.mentionedUsers ?? optimisticComment.mentionedUsers,
            mentionRanges: comment.mentionRanges ?? optimisticComment.mentionRanges,
            parentId: comment.parentId ?? optimisticComment.parentId,
          });
        });
      },
      error: () => {
        this.selectedComments.update((comments) => comments.filter((item) => item.id !== optimisticId));
      },
    });
  }

  retryLoad(): void {
    this.feedFacade.loadFeed();
  }

  trackByPostId(_index: number, post: any): string {
    return post.id;
  }
}


