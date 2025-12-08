import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

// Toast notification component
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" 
             [class.toast-enter]="true"
             role="alert"
             [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @case ('warning') { ⚠ }
              @case ('info') { ℹ }
            }
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button 
            class="toast-close" 
            (click)="toastService.remove(toast.id)"
            aria-label="Close notification">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .toast-icon {
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: rgba(0, 0, 0, 0.05);
      color: #333;
    }

    /* Success Toast */
    .toast-success {
      border-left-color: #10b981;
    }

    .toast-success .toast-icon {
      background: #d1fae5;
      color: #10b981;
    }

    /* Error Toast */
    .toast-error {
      border-left-color: #ef4444;
    }

    .toast-error .toast-icon {
      background: #fee2e2;
      color: #ef4444;
    }

    /* Warning Toast */
    .toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-warning .toast-icon {
      background: #fef3c7;
      color: #f59e0b;
    }

    /* Info Toast */
    .toast-info {
      border-left-color: #3b82f6;
    }

    .toast-info .toast-icon {
      background: #dbeafe;
      color: #3b82f6;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .toast-container {
        right: 12px;
        left: 12px;
        max-width: none;
      }

      .toast {
        padding: 12px;
      }

      .toast-message {
        font-size: 13px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .toast {
        background: #1f2937;
      }

      .toast-message {
        color: #e5e7eb;
      }

      .toast-close {
        color: #9ca3af;
      }

      .toast-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #e5e7eb;
      }
    }
  `]
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
