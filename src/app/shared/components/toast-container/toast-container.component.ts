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
          class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border animate-slide-in min-w-[320px]"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300': toast.type === 'success',
            'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300': toast.type === 'error',
            'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300': toast.type === 'warning',
            'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300': toast.type === 'info'
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
            class="text-current opacity-60 hover:opacity-100 transition-opacity"
            (click)="toastService.remove(toast.id)"
          >
            <span class="material-icons text-base">close</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
