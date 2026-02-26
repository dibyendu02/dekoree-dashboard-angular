import { Component, inject } from '@angular/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        {{ data.title }}
      </h2>
    </div>
    <div class="px-6 py-3">
      <p class="text-sm" style="color: var(--color-text-secondary)">
        {{ data.message }}
      </p>
    </div>
    <div class="flex justify-end gap-2 px-6 pb-5 pt-3">
      <button class="btn btn-ghost" (click)="dialogRef.close(false)">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        class="btn"
        [class.btn-primary]="data.confirmColor !== 'warn'"
        [class.btn-warn]="data.confirmColor === 'warn'"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>('DIALOG_DATA' as never);
  readonly dialogRef = inject<{ close: (v: boolean) => void }>('DIALOG_REF' as never);
}
