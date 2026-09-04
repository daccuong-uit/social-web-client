import {
  Component, EventEmitter, Output, Input,
  signal, computed, inject, OnInit, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiButton } from '../../../button/button';
import { CreateReelPayload } from '@fe/domain/social';
import { AuthService } from '@fe/core';

type ReelPrivacy = 'public' | 'friends' | 'private';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, UiButton],
  selector: 'lib-create-reel-modal',
  templateUrl: './create-reel-modal.component.html',
  styleUrls: ['./create-reel-modal.component.css'],
})
export class CreateReelModalComponent implements OnInit {
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Input() authorName = 'Bạn';
  @Input() authorUsername = '';
  @Input() authorAvatar = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitReel = new EventEmitter<CreateReelPayload>();

  description = signal('');
  privacy = signal<ReelPrivacy>('public');
  videoFile = signal<File | null>(null);
  videoPreviewUrl = signal<string | null>(null);
  hashtagsInput = signal('');
  isSubmitting = signal(false);

  canSubmit = computed(() =>
    !this.isSubmitting() && this.videoFile() !== null
  );

  privacyOptions: { value: ReelPrivacy; label: string; icon: string }[] = [
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

  ngOnInit() {}

  private buildAvatarUrl(displayName: string, username: string): string {
    const name = displayName || username || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
  }

  cyclePrivacy() {
    const idx = this.privacyOptions.findIndex(o => o.value === this.privacy());
    const next = this.privacyOptions[(idx + 1) % this.privacyOptions.length];
    if (next) this.privacy.set(next.value);
  }

  getPrivacyOptionLabel(value: ReelPrivacy) {
    return this.privacyOptions.find(o => o.value === value)?.label ?? '';
  }

  onClose() {
    this.close.emit();
    this.reset();
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('video/')) return;

    this.videoFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        this.videoPreviewUrl.set(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  removeVideo() {
    this.videoFile.set(null);
    this.videoPreviewUrl.set(null);
  }

  extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w\u00C0-\u024F-]+/g) ?? [];
    return [...new Set(matches.map(h => h.slice(1).toLowerCase()))];
  }

  onSubmit() {
    const file = this.videoFile();
    if (!this.canSubmit() || !file) return;

    const descText = this.description().trim();
    const inline = this.extractHashtags(descText).map(t => t.toLowerCase());
    const inputTags = (this.hashtagsInput() || '')
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => t.replace(/^#/, '').replace(/\s+/g, '-').toLowerCase());

    const hashtags = [...new Set([...inline, ...inputTags])];

    const payload: CreateReelPayload = {
      videoFile: file,
      description: descText,
      hashtags,
      music: '',
      privacy: this.privacy(),
    };

    this.isSubmitting.set(true);
    this.submitReel.emit(payload);
    this.reset();
  }

  private reset() {
    this.description.set('');
    this.videoFile.set(null);
    this.videoPreviewUrl.set(null);
    this.hashtagsInput.set('');
    this.privacy.set('public');
    this.isSubmitting.set(false);
  }
}
