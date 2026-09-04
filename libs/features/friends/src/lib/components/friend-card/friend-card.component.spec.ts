import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FriendCardComponent } from './friend-card.component';

describe('FriendCardComponent', () => {
  let component: FriendCardComponent;
  let fixture: ComponentFixture<FriendCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FriendCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FriendCardComponent);
    component = fixture.componentInstance;
    component.user = {
      id: 'user-1',
      name: 'Jane Doe',
      avatar: null,
    };
    fixture.detectChanges();
  });

  it('emits an action event when a user action is requested', () => {
    let emitted: unknown;
    component.actionRequested.subscribe((event) => {
      emitted = event;
    });

    component.emitAction('send-request');

    expect(emitted).toEqual({
      type: 'send-request',
      user: component.user,
      relationshipType: undefined,
    });
  });

  it('returns the correct state label for suggestions', () => {
    component.context = 'suggestions';
    component.user.status = 'pending';

    expect(component.getStateLabel()).toBe('Đã gửi lời mời');
    expect(component.getPrimaryActionLabel()).toBe('Đã gửi kết bạn');
  });
});
