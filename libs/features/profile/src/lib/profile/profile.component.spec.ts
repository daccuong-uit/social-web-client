import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '@fe/core';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: { user: () => null } }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open and close the comment panel for a post', () => {
    const post = {
      id: 'post-1',
      content: 'Hello world',
      author: { id: 'u1', username: 'alice', fullName: 'Alice', avatar: '' },
      createdAt: '2024-01-01T00:00:00.000Z',
      images: [],
      hashtags: [],
      mentions: [],
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      comments: [],
    } as any;

    component.onOpenComments(post);

    expect(component.isCommentPanelOpen()).toBeTrue();
    expect(component.selectedCommentTarget()?.post).toEqual(post);

    component.onCloseCommentPanel();

    expect(component.isCommentPanelOpen()).toBeFalse();
    expect(component.selectedCommentTarget()).toBeNull();
  });
});
