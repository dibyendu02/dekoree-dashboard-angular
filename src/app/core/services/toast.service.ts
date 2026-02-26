import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const toast: Toast = {
      id: crypto.randomUUID(),
      message,
      type,
      duration,
    };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => this.remove(toast.id), duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error', 6000);
  }

  warning(message: string): void {
    this.show(message, 'warning', 5000);
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  remove(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
