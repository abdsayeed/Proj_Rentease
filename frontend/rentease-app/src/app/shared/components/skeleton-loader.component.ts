import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// skeleton types
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card' | 'list';

// Loading placeholder component
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container">
      <div *ngFor="let item of repeatArray" class="skeleton-wrapper">
        <!-- Text skeleton -->
        <div *ngIf="variant === 'text'" 
             class="skeleton skeleton-text"
             [style.width.%]="width"
             [style.height.px]="height || 20">
        </div>

        <!-- Circular skeleton -->
        <div *ngIf="variant === 'circular'" 
             class="skeleton skeleton-circular"
             [style.width.px]="width || 48"
             [style.height.px]="height || 48">
        </div>

        <!-- Rectangular skeleton -->
        <div *ngIf="variant === 'rectangular'" 
             class="skeleton skeleton-rectangular"
             [style.width.%]="width || 100"
             [style.height.px]="height || 200">
        </div>

        <!-- Card skeleton -->
        <div *ngIf="variant === 'card'" class="skeleton-card">
          <div class="skeleton skeleton-rectangular" style="height: 200px;"></div>
          <div class="skeleton-card-content">
            <div class="skeleton skeleton-text" style="width: 80%; height: 20px;"></div>
            <div class="skeleton skeleton-text" style="width: 60%; height: 16px; margin-top: 8px;"></div>
            <div class="skeleton skeleton-text" style="width: 40%; height: 16px; margin-top: 8px;"></div>
          </div>
        </div>

        <!-- List skeleton -->
        <div *ngIf="variant === 'list'" class="skeleton-list-item">
          <div class="skeleton skeleton-circular" style="width: 40px; height: 40px;"></div>
          <div class="skeleton-list-content">
            <div class="skeleton skeleton-text" style="width: 70%; height: 16px;"></div>
            <div class="skeleton skeleton-text" style="width: 50%; height: 14px; margin-top: 6px;"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .skeleton {
      background: linear-gradient(
        90deg,
        #e5e7eb 0%,
        #f3f4f6 50%,
        #e5e7eb 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
      border-radius: 0.25rem;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-text {
      height: 20px;
    }

    .skeleton-circular {
      border-radius: 50%;
    }

    .skeleton-rectangular {
      width: 100%;
    }

    .skeleton-card {
      border-radius: 0.5rem;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .skeleton-card-content {
      padding: 1rem;
    }

    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: var(--bg-surface, #ffffff);
    }

    .skeleton-list-content {
      flex: 1;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'rectangular';
  @Input() width?: number;
  @Input() height?: number;
  @Input() repeat: number = 1;

  get repeatArray(): number[] {
    return Array(this.repeat).fill(0);
  }
}
