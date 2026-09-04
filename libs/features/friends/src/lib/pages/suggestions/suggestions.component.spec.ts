import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendSuggestionsComponent } from './suggestions.component';
import { FriendsApiService } from '../../services/friends-api.service';
import { of } from 'rxjs';

describe('FriendSuggestionsComponent', () => {
  let component: FriendSuggestionsComponent;
  let fixture: ComponentFixture<FriendSuggestionsComponent>;
  let friendsApi: jasmine.SpyObj<FriendsApiService>;

  beforeEach(async () => {
    friendsApi = jasmine.createSpyObj('FriendsApiService', ['getSuggestions', 'sendFriendRequest', 'cancelFriendRequest']);
    friendsApi.getSuggestions.and.returnValue(of([]));
    friendsApi.sendFriendRequest.and.returnValue(of({}));
    friendsApi.cancelFriendRequest.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [FriendSuggestionsComponent],
      providers: [{ provide: FriendsApiService, useValue: friendsApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('cancels a pending friend request from suggestions', () => {
    const user = { id: 'user-1', name: 'Jane', avatar: null };

    component.onAction({ type: 'cancel-request', user } as any);

    expect(friendsApi.cancelFriendRequest).toHaveBeenCalledWith('user-1');
  });
});
