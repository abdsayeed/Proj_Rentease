import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Reusable card component
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.hoverable]="hoverable">
      <div class="card-header" *ngIf="hasHeader">
        <ng-content select="[header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content select="[body]"></ng-content>
        <ng-content></ng-content>
      </div>
      <div class="card-footer" *ngIf="hasFooter">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--bg-surface, #ffffff);
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.3s;
    }

    .card.hoverable:hover {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .card-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      font-weight: 600;
      font-size: 1.125rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    .card-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color, #e5e7eb);
      background: var(--bg-muted, #f9fafb);
    }
  `]
})
export class CardComponent {
  @Input() hoverable: boolean = false;
  @Input() hasHeader: boolean = true;
  @Input() hasFooter: boolean = false;
}
