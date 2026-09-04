import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButton } from '@fe/ui';

@Component({
  selector: 'feat-friends-right-sidebar',
  standalone: true,
  imports: [CommonModule, UiButton],
  templateUrl: './friends-right-sidebar.component.html',
  styleUrls: ['./friends-right-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FriendsRightSidebarComponent {
  @Input() friend: any = null;
}
