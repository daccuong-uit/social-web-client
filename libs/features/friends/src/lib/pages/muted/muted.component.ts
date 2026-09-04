import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendCardComponent, FriendCardActionEvent } from '../../components/friend-card/friend-card.component';
import { FriendsApiService, FriendUser } from '../../services/friends-api.service';
import { FriendsActionService } from '../../services/friends-action.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, switchMap } from 'rxjs';

@Component({
  selector: 'fe-friend-muted',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FriendCardComponent],
  templateUrl: './muted.component.html',
  styleUrls: ['./muted.component.css'],
})
export class FriendMutedComponent {
  private friendsApi = inject(FriendsApiService);
  private actions = inject(FriendsActionService);
  private readonly refreshTrigger = new BehaviorSubject<void>(undefined);

  readonly users = toSignal(
    this.refreshTrigger.pipe(switchMap(() => this.friendsApi.getMutedUsers(1, 20))),
    { initialValue: [] }
  );

  onAction(event: FriendCardActionEvent) {
    this.actions.dispatch(event);
  }

  onMenuItemClick(itemId: string, user: FriendUser) {
    this.actions.dispatch({ type: itemId, user });
  }

  private refresh() {
    this.refreshTrigger.next();
  }
}
