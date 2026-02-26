import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

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
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      {{ data.title }}
    </h2>
    <mat-dialog-content>
      <p class="text-sm" style="color: var(--color-text-secondary)">
        {{ data.message }}
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!gap-2 !pb-4 !pr-6">
      <button mat-button (click)="dialogRef.close(false)">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button
        mat-flat-button
        [color]="data.confirmColor || 'warn'"
        (click)="dialogRef.close(true)"
      >
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
}
