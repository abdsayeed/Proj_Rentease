import { Injectable, signal } from '@angular/core';

// toast interface
export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Toast service - shows notifications
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  public toasts = signal<Toast[]>([]);

  // show success toast
  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  // show error toast
  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  // show warning toast
  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  // show info toast
  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  // show toast helper
  private show(message: string, type: Toast['type'], duration: number): void {
    const id = ++this.toastIdCounter;
    const toast: Toast = { id, message, type, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  // remove toast by id
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  // clear all toasts
  clearAll(): void {
    this.toasts.set([]);
  }
}
