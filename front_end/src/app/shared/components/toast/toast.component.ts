import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 11000">
      <div *ngFor="let toast of toasts" 
           class="toast show align-items-center border-0"
           [ngClass]="getToastClass(toast.type)"
           role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <i [ngClass]="getIconClass(toast.type)" class="me-2"></i>
            {{ toast.message }}
          </div>
          <button type="button" 
                  class="btn-close btn-close-white me-2 m-auto" 
                  (click)="removeToast(toast.id)"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast {
      min-width: 300px;
      margin-bottom: 0.5rem;
    }

    .toast-body {
      color: white;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, toast.duration);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  getToastClass(type: string): string {
    const classes: { [key: string]: string } = {
      'success': 'bg-success',
      'error': 'bg-danger',
      'warning': 'bg-warning',
      'info': 'bg-info'
    };
    return classes[type] || 'bg-info';
  }

  getIconClass(type: string): string {
    const icons: { [key: string]: string } = {
      'success': 'bi bi-check-circle-fill',
      'error': 'bi bi-x-circle-fill',
      'warning': 'bi bi-exclamation-triangle-fill',
      'info': 'bi bi-info-circle-fill'
    };
    return icons[type] || 'bi bi-info-circle-fill';
  }
}
