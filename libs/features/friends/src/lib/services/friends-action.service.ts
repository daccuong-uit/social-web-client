import { Injectable, inject } from '@angular/core';
import { FriendsApiService, FriendUser } from './friends-api.service';
import { FriendCardActionEvent } from '../components/friend-card/friend-card.component';
import { Subject } from 'rxjs';

/** Emitted when an action completes and the list should refresh */
export interface ActionResult {
  action: string;
  userId: string;
}

/**
 * Centralized action handler for all friend-card events (primary buttons + 3-dot menu items).
 * Each page component delegates to this service instead of calling the API directly.
 */
@Injectable({ providedIn: 'root' })
export class FriendsActionService {
  private readonly api = inject(FriendsApiService);

  /** Pages subscribe to this to know when to refresh their list */
  readonly actionCompleted$ = new Subject<ActionResult>();

  /**
   * Dispatch a FriendCardActionEvent to the correct API call.
   * Handles both primary button actions AND menuItemClick ids from the 3-dot panel.
   */
  dispatch(event: FriendCardActionEvent): void {
    const userId = event.user.id;
    const type = event.type;

    switch (type) {
      // ── Primary button actions ──────────────────────────────
      case 'accept-request':
        this.api.acceptFriendRequest(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'reject-request':
        this.api.rejectFriendRequest(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'cancel-request':
        this.api.cancelFriendRequest(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'send-request':
      case 'send-friend-request':
        this.api.sendFriendRequest(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'message':
        // Navigation to chat — handled by consuming component if needed
        this.notify(type, userId);
        break;

      case 'follow':
        this.api.followUser(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'unfollow':
        this.api.unfollowUser(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'unblock':
        this.api.unblockUser(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'unmute':
        this.api.unmuteUser(userId).subscribe(() => this.notify(type, userId));
        break;

      // ── 3-dot menu item actions (id from menuItems[].id) ───
      case 'view-profile':
        // Navigation — consuming component handles if needed
        this.notify(type, userId);
        break;

      case 'unfriend':
        this.api.unfriend(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'block':
        this.api.blockUser(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'mute':
        this.api.muteUser(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'remove-follower':
        this.api.removeFollower(userId).subscribe(() => this.notify(type, userId));
        break;

      case 'remove-relationship':
        this.api.updateRelationship(userId, 'NONE').subscribe(() => this.notify(type, userId));
        break;

      // ── Relationship submenu payloads ───────────────────────
      case 'CLOSE_FRIEND':
      case 'LOVER':
      case 'SPOUSE':
      case 'SIBLING':
      case 'PARENT':
      case 'CHILD':
      case 'FAVORITE':
      case 'NONE':
      case 'change-relationship':
        // These come from submenu clicks where id IS the relationship type
        this.api.updateRelationship(userId, event.relationshipType ?? type)
          .subscribe(() => this.notify('change-relationship', userId));
        break;

      case 'update-relationship':
        this.api.updateRelationship(userId, event.relationshipType ?? 'NORMAL')
          .subscribe(() => this.notify(type, userId));
        break;

      default:
        console.warn('[FriendsActionService] Unknown action:', type);
    }
  }

  private notify(action: string, userId: string) {
    this.actionCompleted$.next({ action, userId });
  }
}
