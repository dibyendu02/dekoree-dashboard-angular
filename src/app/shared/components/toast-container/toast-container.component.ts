import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-in min-w-[320px]"
          [ngClass]="{
            'toast-success': toast.type === 'success',
            'toast-error': toast.type === 'error',
            'toast-warning': toast.type === 'warning',
            'toast-info': toast.type === 'info'
          }"
        >
          <span class="material-icons text-lg mt-0.5">
            @switch (toast.type) {
              @case ('success') { check_circle }
              @case ('error') { error }
              @case ('warning') { warning }
              @case ('info') { info }
            }
          </span>
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          <button
            class="opacity-70 hover:opacity-100 transition-opacity"
            (click)="toastService.remove(toast.id)"
          >
            <span class="material-icons text-base">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-success {
      background: #ECFDF5;
      border: 1px solid #86EFAC;
      color: #14532D;
    }
    .toast-error {
      background: #FEF2F2;
      border: 1px solid #FCA5A5;
      color: #7F1D1D;
    }
    .toast-warning {
      background: #FFFBEB;
      border: 1px solid #FCD34D;
      color: #78350F;
    }
    .toast-info {
      background: #F0FDF4;
      border: 1px solid #86EFAC;
      color: #14532D;
    }
    :host-context(.dark) .toast-success {
      background: rgba(20, 83, 45, 0.9);
      border-color: #166534;
      color: #BBF7D0;
    }
    :host-context(.dark) .toast-error {
      background: rgba(127, 29, 29, 0.9);
      border-color: #991B1B;
      color: #FECACA;
    }
    :host-context(.dark) .toast-warning {
      background: rgba(120, 53, 15, 0.9);
      border-color: #92400E;
      color: #FDE68A;
    }
    :host-context(.dark) .toast-info {
      background: rgba(20, 83, 45, 0.9);
      border-color: #166534;
      color: #BBF7D0;
    }
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
