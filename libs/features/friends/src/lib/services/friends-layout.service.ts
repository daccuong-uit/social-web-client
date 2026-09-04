import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FriendsLayoutService {
  selectedFriend = signal<any>(null);

  selectFriend(friend: any) {
    this.selectedFriend.set(friend);
  }
}
