import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
  HostBinding,
  computed,
} from '@angular/core';
import { FriendsLayoutService } from '../../services/friends-layout.service';
import { CommonModule } from '@angular/common';
import { FriendUser } from '../../services/friends-api.service';

/* ── Backend-Driven Menu Item config ────────────────────────── */
export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  isDanger?: boolean;
  hasSubmenu?: boolean;
  submenuItems?: MenuItemConfig[];
}

/* ── Action event emitted upward ────────────────────────────── */
export interface FriendCardActionEvent {
  type: string;
  user: FriendUser;
  relationshipType?: string;
}

@Component({
  selector: 'fe-friend-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './friend-card.component.html',
  styleUrls: ['./friend-card.component.css'],
})
export class FriendCardComponent {
  /* ── Inputs ─────────────────────────────────────────────────── */
  @Input() variant: 'avatar-card' | 'list-row' = 'avatar-card';
  @Input() user!: FriendUser;
  @Input() context?:
    | 'all'
    | 'sent'
    | 'suggestions'
    | 'relationships'
    | 'followers'
    | 'muted'
    | 'requests'
    | 'following'
    | 'blocked'
    | 'close-friends';

  /**
   * Backend-Driven UI: list of menu items for the 3-dot floating panel.
   * Prefer user.menuItems from backend, fallback to Input if provided.
   */
  @Input() inputMenuItems: MenuItemConfig[] = [];

  get menuItems(): MenuItemConfig[] {
    return this.user?.menuItems || this.inputMenuItems;
  }

  /**
   * Optional override label for the primary action button.
   * When provided, overrides the computed getPrimaryActionLabel().
   */
  @Input() primaryActionLabel?: string;

  /* ── Outputs ────────────────────────────────────────────────── */
  @Output() actionRequested = new EventEmitter<FriendCardActionEvent>();

  /**
   * Emitted when a backend-driven menu item is clicked.
   * Payload is the MenuItemConfig.id so the parent can react.
   */
  @Output() menuItemClick = new EventEmitter<string>();

  /* ── Internal state ─────────────────────────────────────────── */
  private layoutService = inject(FriendsLayoutService);

  /** Name of the currently open floating menu panel (undefined = all closed). */
  openMenu?: string;

  /** True when any floating panel is open → elevates :host via HostBinding. */
  @HostBinding('class.is-menu-open')
  get isMenuOpen(): boolean {
    return this.openMenu !== undefined;
  }

  // Check if this card is currently selected in the layout
  isSelected = computed(() => {
    return this.layoutService.selectedFriend()?.id === this.user?.id;
  });

  private localState:
    | 'pending'
    | 'suggested'
    | 'following'
    | 'not-following'
    | 'default' = 'default';

  private localFriendState: 'friend' | 'not-friend' | 'default' = 'default';
  private localMuteState: 'muted' | 'not-muted' | 'default' = 'default';
  private localBlockState: 'blocked' | 'not-blocked' | 'default' = 'default';

  /* ── Label helpers ──────────────────────────────────────────── */
  getStateLabel(): string {
    switch (this.context) {
      case 'sent':
        return this.getVisibleSuggestionState() === 'pending'
          ? 'Đã gửi lời mời'
          : 'Chưa gửi lời mời';
      case 'suggestions':
        return this.getVisibleSuggestionState() === 'pending'
          ? 'Đã gửi lời mời'
          : 'Gợi ý kết bạn';
      case 'requests':
        return 'Đang chờ xác nhận';
      case 'all':
        return 'Bạn bè';
      case 'relationships':
        return this.getRelationshipLabel();
      case 'followers':
        return 'Theo dõi bạn';
      case 'following':
        return this.getVisibleFollowState() === 'following'
          ? 'Đang theo dõi'
          : 'Chưa theo dõi';
      case 'blocked':
        return this.getVisibleBlockState() === 'blocked'
          ? 'Đã chặn'
          : 'Chưa chặn';
      case 'muted':
        return 'Đã mute';
      default:
        return 'Mối quan hệ';
    }
  }

  getPrimaryActionLabel(): string {
    if (this.primaryActionLabel) return this.primaryActionLabel;

    if (this.context === 'suggestions') {
      return this.getVisibleSuggestionState() === 'pending'
        ? 'Đã gửi kết bạn'
        : 'Kết bạn';
    }

    if (this.context === 'following') {
      return this.getVisibleFollowState() === 'following'
        ? 'Bỏ theo dõi'
        : 'Theo dõi';
    }

    if (this.context === 'blocked') {
      return this.getVisibleBlockState() === 'blocked' ? 'Bỏ chặn' : 'Chặn';
    }

    switch (this.context) {
      case 'sent':
        return 'Huỷ lời mời';
      case 'requests':
        return 'Xác nhận';
      case 'all':
        return 'Bạn bè';
      case 'relationships':
        return 'Quan hệ';
      case 'muted':
        return 'Đã mute';
      default:
        return 'Thao tác';
    }
  }

  /* ── Visible state getters ──────────────────────────────────── */
  getVisibleSuggestionState(): 'pending' | 'suggested' {
    if (this.localState === 'pending' || this.localState === 'suggested') {
      return this.localState;
    }
    return this.user?.status === 'pending' ? 'pending' : 'suggested';
  }

  getVisibleFollowState(): 'following' | 'not-following' {
    if (this.localState === 'following') return 'following';
    if (this.localState === 'not-following') return 'not-following';
    return this.user?.status === 'following' ? 'following' : 'not-following';
  }

  getVisibleBlockState(): 'blocked' | 'not-blocked' {
    if (this.localBlockState === 'blocked') return 'blocked';
    if (this.localBlockState === 'not-blocked') return 'not-blocked';
    return this.user?.status === 'blocked' ? 'blocked' : 'not-blocked';
  }

  getVisibleFriendState(): 'friend' | 'not-friend' {
    if (
      this.localFriendState === 'friend' ||
      this.localFriendState === 'not-friend'
    ) {
      return this.localFriendState;
    }
    return this.user?.status === 'friend' ? 'friend' : 'not-friend';
  }

  getVisibleMuteState(): 'muted' | 'not-muted' {
    if (this.localMuteState === 'muted') return 'muted';
    if (this.localMuteState === 'not-muted') return 'not-muted';
    return this.user?.status === 'muted' ? 'muted' : 'not-muted';
  }

  /* ── Button class helpers ───────────────────────────────────── */
  getSuggestionButtonClass(): string {
    return this.getVisibleSuggestionState() === 'pending'
      ? 'btn-outline state-pending'
      : 'btn-primary state-suggested';
  }

  getFollowButtonClass(): string {
    return this.getVisibleFollowState() === 'following'
      ? 'state-following'
      : 'state-default';
  }

  getBlockButtonClass(): string {
    return this.getVisibleBlockState() === 'blocked'
      ? 'state-blocked'
      : 'state-default';
  }

  getFriendMenuLabel(): string {
    return this.getVisibleFriendState() === 'friend' ? 'Huỷ kết bạn' : 'Kết bạn';
  }

  getFollowMenuLabel(): string {
    return this.getVisibleFollowState() === 'following'
      ? 'Bỏ theo dõi'
      : 'Theo dõi';
  }

  private getRelationshipLabel(): string {
    switch (this.user?.relationshipType) {
      case 'SIBLING':
        return 'Anh/Chị/Em';
      case 'CLOSE_FRIEND':
        return 'Thân thiết';
      case 'LOVER':
        return 'Người yêu';
      case 'MARRIED':
        return 'Vợ/Chồng';
      case 'FAVORITE':
        return 'Yêu thích';
      default:
        return 'Bạn bè';
    }
  }

  /* ── Event handlers ─────────────────────────────────────────── */
  onSelect() {
    if (this.user) {
      this.layoutService.selectFriend(this.user);
    }
  }

  emitAction(type: string, ev?: Event, relationshipType?: string) {
    ev?.stopPropagation();

    if (type === 'send-request') {
      this.localState = 'pending';
      this.localFriendState = 'not-friend';
      this.user.status = 'pending';
      this.updateMenuItem('send-friend-request', 'cancel-request', 'Hủy lời mời');
    }
    if (type === 'cancel-request') {
      this.localState = 'suggested';
      this.user.status = 'suggested';
      this.updateMenuItem('cancel-request', 'send-friend-request', 'Thêm bạn bè');
    }
    if (type === 'unfollow') {
      this.localState = 'not-following';
      this.user.status = 'not-following';
      this.updateMenuItem('unfollow', 'follow', 'Theo dõi');
    }
    if (type === 'follow') {
      this.localState = 'following';
      this.user.status = 'following';
      this.updateMenuItem('follow', 'unfollow', 'Bỏ theo dõi');
    }
    if (type === 'unfriend') {
      this.localFriendState = 'not-friend';
      this.user.status = 'not-friend';
      this.updateMenuItem('unfriend', 'send-friend-request', 'Thêm bạn bè');
    }
    if (type === 'block') {
      this.localBlockState = 'blocked';
      this.user.status = 'blocked';
      this.updateMenuItem('block', 'unblock', 'Bỏ chặn');
    }
    if (type === 'unblock') {
      this.localBlockState = 'not-blocked';
      this.user.status = 'not-blocked';
      this.updateMenuItem('unblock', 'block', 'Chặn người dùng');
    }
    if (type === 'mute') {
      this.localMuteState = 'muted';
      this.user.status = 'muted';
      this.updateMenuItem('mute', 'unmute', 'Bỏ ẩn (Unmute)');
    }
    if (type === 'unmute') {
      this.localMuteState = 'not-muted';
      this.user.status = 'not-muted';
      this.updateMenuItem('unmute', 'mute', 'Ẩn (Mute)');
    }

    this.actionRequested.emit({ type, user: this.user, relationshipType });
  }

  private updateMenuItem(oldId: string, newId: string, newLabel: string) {
    if (this.user?.menuItems) {
      const item = this.user.menuItems.find(i => i.id === oldId);
      if (item) {
        item.id = newId;
        item.label = newLabel;
      }
    }
  }

  /**
   * Toggle the named floating panel open/closed.
   * Sets openMenu → triggers isMenuOpen HostBinding → adds .is-menu-open on :host.
   */
  toggleMenu(name: string, ev?: Event) {
    ev?.stopPropagation();
    this.openMenu = this.openMenu === name ? undefined : name;
  }

  /**
   * Called by the backend-driven *ngFor menu template.
   * Closes the panel then emits the item id upward.
   */
  onMenuItemClick(itemId: string, ev?: Event) {
    ev?.stopPropagation();
    this.openMenu = undefined;
    
    // Optimistic UI: update menu items AND local states
    if (itemId === 'unfollow') {
      this.localState = 'not-following';
      this.updateMenuItem('unfollow', 'follow', 'Theo dõi');
    } else if (itemId === 'follow') {
      this.localState = 'following';
      this.updateMenuItem('follow', 'unfollow', 'Bỏ theo dõi');
    } else if (itemId === 'mute') {
      this.localMuteState = 'muted';
      this.updateMenuItem('mute', 'unmute', 'Bỏ ẩn (Unmute)');
    } else if (itemId === 'unmute') {
      this.localMuteState = 'not-muted';
      this.updateMenuItem('unmute', 'mute', 'Ẩn (Mute)');
    } else if (itemId === 'block') {
      this.localBlockState = 'blocked';
      this.updateMenuItem('block', 'unblock', 'Bỏ chặn');
    } else if (itemId === 'unblock') {
      this.localBlockState = 'not-blocked';
      this.updateMenuItem('unblock', 'block', 'Chặn người dùng');
    } else if (itemId === 'send-friend-request') {
      this.updateMenuItem('send-friend-request', 'cancel-request', 'Hủy lời mời');
    }

    this.menuItemClick.emit(itemId);
  }
}
