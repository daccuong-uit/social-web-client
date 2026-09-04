import {
  Component, EventEmitter, Output, Input,
  signal, computed, inject, OnInit, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../../../button/button';
import { CreatePostPayload, PostPrivacy, Post } from '@fe/domain/social';
import { AuthService } from '@fe/core';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, UiButton, PostCardComponent],
  selector: 'lib-create-post-modal',
  templateUrl: './create-post-modal.component.html',
  styleUrls: ['./create-post-modal.component.css'],
})
export class CreatePostModalComponent implements OnInit {
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() authorName = 'Bạn';
  @Input() authorUsername = '';
  @Input() authorAvatar = '';
  @Input() sharedPost?: Post;

  @Output() close = new EventEmitter<void>();
  @Output() submitPost = new EventEmitter<CreatePostPayload>();

  content = signal('');
  privacy = signal<PostPrivacy>('public');
  mediaFiles = signal<File[]>([]);
  mediaPreviews = signal<string[]>([]);
  hashtagsInput = signal('');
  isSubmitting = signal(false);

  canSubmit = computed(() =>
    !this.isSubmitting() &&
    (this.content().trim().length > 0 || this.mediaFiles().length > 0 || !!this.sharedPost)
  );

  privacyOptions: { value: PostPrivacy; label: string; icon: string }[] = [
    { value: 'public', label: 'Công khai', icon: '🌍' },
    { value: 'friends', label: 'Bạn bè', icon: '👥' },
    { value: 'private', label: 'Chỉ mình tôi', icon: '🔒' },
  ];

  constructor() {
    effect(() => {
      const user = this.authService.user();
      const displayName = user?.displayName || user?.username || 'Bạn';
      const username = user?.username || '';

      this.authorName = displayName;
      this.authorUsername = username;
      this.authorAvatar = this.buildAvatarUrl(displayName, username);
    });
  }

  ngOnInit() {
    // no-op: auth profile is synced reactively from the auth service signal
  }

  private buildAvatarUrl(displayName: string, username: string): string {
    const name = displayName || username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
  }

  cyclePrivacy() {
    const idx = this.privacyOptions.findIndex(o => o.value === this.privacy());
    const next = this.privacyOptions[(idx + 1) % this.privacyOptions.length];
    if (next) this.privacy.set(next.value);
  }

  getPrivacyOptionLabel(value: PostPrivacy) {
    return this.privacyOptions.find(o => o.value === value)?.label ?? '';
  }

  getPrivacyOptionIcon(value: PostPrivacy) {
    return this.privacyOptions.find(o => o.value === value)?.icon ?? '';
  }

  onClose() {
    this.close.emit();
    this.reset();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const newFiles = Array.from(input.files);
    this.mediaFiles.update(files => [...files, ...newFiles]);

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.mediaPreviews.update(previews => [
            ...previews,
            e.target!.result as string
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    input.value = '';
  }

  removeMedia(index: number) {
    this.mediaFiles.update(files => files.filter((_, i) => i !== index));
    this.mediaPreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u00C0-\u024F-]+/g) ?? [];
    return [...new Set(matches.map(h => h.slice(1).toLowerCase()))];
  }

  onSubmit() {
    if (!this.canSubmit()) return;

    const finalContent = this.content().trim();

    // Extract inline hashtags from content (e.g. user typed #tag inside textarea)
    const inline = this.extractHashtags(finalContent).map(t => t.toLowerCase());

    // Normalize hashtags entered in the separate hashtag input (comma-separated)
    const inputTags = (this.hashtagsInput() || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.replace(/^#/, '').replace(/\s+/g, '-').toLowerCase());

    const hashtags = [...new Set([...inline, ...inputTags])];

    const payload: CreatePostPayload = {
      content: finalContent,
      images: this.mediaFiles(),
      hashtags: hashtags,
      mentions: [],
      privacy: this.privacy(),
      allowComments: true,
      originalPostId: this.sharedPost?.id,
    };

    this.isSubmitting.set(true);
    this.submitPost.emit(payload);
    this.reset();
  }

  private reset() {
    this.content.set('');
    this.mediaFiles.set([]);
    this.mediaPreviews.set([]);
    this.hashtagsInput.set('');
    this.privacy.set('public');
    this.isSubmitting.set(false);
  }

  onCopyLink() {
    if (this.sharedPost) {
      const url = `${window.location.origin}/post/${this.sharedPost.id}`;
      navigator.clipboard.writeText(url).then(() => {
        // Show a toast here if we had one
      });
      this.onClose();
    }
  }
}
