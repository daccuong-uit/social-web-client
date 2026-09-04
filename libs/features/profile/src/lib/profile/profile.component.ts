import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@fe/core';
import {
  PageShellComponent,
  SidebarMenuItem,
  UiButton,
  PostCardComponent,
  ProfileFriendCardComponent,
  ProfileGroupCardComponent,
  GLOBAL_MENU_ITEMS,
  UiTabsComponent,
  UiTab,
  CommentThreadPanelComponent,
  CommentThreadTarget,
} from '@fe/ui';
import { ProfileRightSidebarComponent } from '../components/profile-right-sidebar/profile-right-sidebar.component';
import {
  ProfileTab,
  ProfileTabId,
  ProfilePost,
  ProfileFriend,
  ProfileGroup,
} from '@fe/domain/profile';
import { Comment, CreateCommentPayload, Post, SocialCommentService } from '@fe/domain/social';
import { insertCommentIntoTree, mergeCommentsWithServer, replaceOptimisticComment } from '@fe/domain/social';
import { ProfileFacade } from '../data-access/profile.facade';
import { AboutComponent } from './about/about.component';
import { RelativeTimePipe } from '@fe/core';

@Component({
  standalone: true,
  selector: 'feat-profile-page',
  imports: [CommonModule, RouterModule, PageShellComponent, ProfileRightSidebarComponent, UiButton, PostCardComponent, ProfileFriendCardComponent, ProfileGroupCardComponent, UiTabsComponent, CommentThreadPanelComponent, AboutComponent, RelativeTimePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private profileFacade = inject(ProfileFacade);
  private socialCommentService = inject(SocialCommentService);
  private loadedUserId: string | null = null;

  profileData = this.profileFacade.profile;

  displayName = computed(() => this.profileData()?.displayName ?? '');
  username = computed(() => this.profileData()?.username ?? '');
  bio = computed(() => this.profileData()?.bio ?? '');
  avatarUrl = computed(() => this.profileData()?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.displayName() || this.username() || 'User')}&background=333&color=fff`);
  coverUrl = computed(() => this.profileData()?.coverUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18');
  isVerified = computed(() => this.profileData()?.isVerified ?? false);
  profileHandle = computed(() => this.username() ? `@${this.username()}` : '@người_dùng');
  createdAt = computed(() => this.profileData()?.createdAt ?? '');

  stats = this.profileFacade.stats;
  followingCount = computed(() => this.stats()?.followingCount ?? 0);
  followersCount = computed(() => this.stats()?.followersCount ?? 0);
  postsCount = computed(() => this.stats()?.postsCount ?? 0);

  tabs = computed<ProfileTab[]>(() =>
    this.profileFacade.tabs().map((tab) => ({
      id: tab.id as ProfileTabId,
      label: tab.label,
    }))
  );

  uiTabs = computed<UiTab[]>(() =>
    this.tabs().map(tab => ({
      id: tab.id,
      label: tab.label
    }))
  );

  activeTab = signal<ProfileTabId>('posts');
  activeTabLabel = computed(() => this.tabs().find((tab) => tab.id === this.activeTab())?.label ?? '');

  posts = this.profileFacade.posts;
  friends = this.profileFacade.friends;
  groups = this.profileFacade.groups;
  isCommentPanelOpen = signal(false);
  selectedCommentTarget = signal<CommentThreadTarget | null>(null);
  selectedComments = signal<Comment[]>([]);

  // Expose tab data to check if empty
  tabData = this.profileFacade.tabData;
  isTabEmpty = computed(() => {
    const data = this.tabData();
    if (!data) return false;
    return !data.data || data.data.length === 0;
  });

  mockReels = signal([
    { id: 1, title: 'Bí kíp quay video triệu view', views: '1.2M', cover: 'https://picsum.photos/300/500?random=11' },
    { id: 2, title: 'Cách edit video siêu nhanh', views: '850K', cover: 'https://picsum.photos/300/500?random=12' },
    { id: 3, title: 'Hướng dẫn sử dụng Reals AI', views: '2.1M', cover: 'https://picsum.photos/300/500?random=13' },
    { id: 4, title: 'Trend biến hình mới nhất', views: '450K', cover: 'https://picsum.photos/300/500?random=14' },
    { id: 5, title: 'Vlog một ngày làm việc', views: '1.5M', cover: 'https://picsum.photos/300/500?random=15' },
    { id: 6, title: 'Góc làm việc cực chill', views: '980K', cover: 'https://picsum.photos/300/500?random=16' }
  ]);

  mockStories = signal([
    { id: 1, title: 'Bí Ẩn Mùa Hè', status: 'Đang ra • 45 chương', genre: 'Tiểu thuyết, Bí ẩn, Hành động', desc: 'Một câu chuyện hấp dẫn về những bí ẩn chưa có lời giải đáp trong mùa hè năm ấy. Cùng nhân vật chính khám phá những bí mật rùng rợn và lãng mạn được che giấu kỹ lưỡng dưới lớp vỏ bọc bình yên.', likes: '1.2K', comments: '450', shares: '32', views: '5.6K' },
    { id: 2, title: 'Hành Trình Tới Tương Lai', status: 'Hoàn thành • 120 chương', genre: 'Khoa học viễn tưởng, Phiêu lưu', desc: 'Chuyến thám hiểm đến hành tinh xa xôi với những sinh vật kỳ lạ và nền văn minh vượt bậc. Những con người dũng cảm phải đối mặt với thử thách sinh tử để tìm ra câu trả lời cho sự tồn tại của nhân loại.', likes: '3.4K', comments: '1.2K', shares: '150', views: '12.5K' }
  ]);

  menuItems: SidebarMenuItem[] = GLOBAL_MENU_ITEMS;

  private resolveUserId(): string | null {
    const user = this.authService.user();
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  constructor() {
    effect(() => {
      const userId = this.resolveUserId();
      if (userId && userId !== this.loadedUserId) {
        untracked(() => {
          this.loadedUserId = userId;
          this.profileFacade.loadProfile(userId);
          this.profileFacade.loadProfileTabData(userId, this.activeTab());
        });
      }
    }, { allowSignalWrites: true });
  }

  selectTab(tabId: ProfileTabId) {
    this.activeTab.set(tabId);
    if (tabId === 'about') {
      return;
    }
    const userId = this.resolveUserId();
    if (userId) {
      this.profileFacade.loadProfileTabData(userId, tabId);
    }
  }

  onTabChange(tab: UiTab) {
    this.selectTab(tab.id as ProfileTabId);
  }

  onToggleLike(postId: string) {
    this.profileFacade.togglePostLike(postId);
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

  trackByTabId(index: number, tab: ProfileTab) {
    return tab.id;
  }
}
