import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileGroup } from '@fe/domain/profile';

@Component({
  selector: 'app-profile-group-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="profile-card group-card">
      <div>
        <h3>{{ group.name }}</h3>
        <p class="profile-card-meta">{{ group.membersCount }} thành viên</p>
        <p class="card-text">{{ group.description }}</p>
      </div>
    </article>
  `,
  styles: [`
    .profile-card {
      padding: var(--spacing-4);
      border-radius: 8px;
      background: var(--color-surface-base);
      border: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: space-between;
      gap: var(--spacing-4);
      align-items: center;
    }

    h3 {
      margin: 0;
      font-size: var(--font-size-md);
      font-weight: 700;
      color: var(--color-text-base);
    }

    .profile-card-meta {
      margin: 0.25rem 0 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .card-text {
      margin: var(--spacing-3) 0 0;
      color: var(--color-text-base);
      font-size: var(--font-size-body);
      line-height: 1.6;
      max-width: 55ch;
    }

    @media (max-width: 640px) {
      .profile-card {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
})
export class ProfileGroupCardComponent {
  @Input() group!: ProfileGroup;
}
