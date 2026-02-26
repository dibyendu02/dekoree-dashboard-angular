import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { User } from '../../core/models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, StatusBadgeComponent, CurrencyInrPipe, RelativeTimePipe],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      User Details
    </h2>
    <mat-dialog-content class="!max-h-[70vh]">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ (user.firstName ?? 'U').charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <h3 class="text-lg font-bold" style="color: var(--color-text)">
            {{ user.firstName }} {{ user.lastName }}
          </h3>
          <p class="text-sm" style="color: var(--color-text-secondary)">{{ user.email }}</p>
          <div class="flex gap-2 mt-1">
            @if (user.isAdmin) {
              <app-status-badge status="Admin" variant="primary" />
            }
            <app-status-badge [status]="user.isActive !== false ? 'active' : 'inactive'" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        @for (field of infoFields; track field.label) {
          <div class="p-3 rounded-lg" style="background: var(--color-surface-alt)">
            <p class="text-xs font-medium uppercase mb-1" style="color: var(--color-text-muted)">{{ field.label }}</p>
            <p class="text-sm font-semibold" style="color: var(--color-text)">{{ field.value }}</p>
          </div>
        }
      </div>

      @if (user.addresses?.length) {
        <h4 class="text-sm font-semibold mt-6 mb-3" style="color: var(--color-text)">Addresses</h4>
        @for (addr of user.addresses; track $index) {
          <div class="p-3 rounded-lg mb-2" style="background: var(--color-surface-alt)">
            <p class="text-sm" style="color: var(--color-text-secondary)">
              {{ addr.street }}, {{ addr.city }}, {{ addr.state }} {{ addr.pincode }}
            </p>
            @if (addr.isDefault) {
              <app-status-badge status="Default" variant="primary" class="mt-1" />
            }
          </div>
        }
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!pb-4 !pr-6">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class UserDetailComponent {
  private readonly data = inject<{ user: User }>(MAT_DIALOG_DATA);
  readonly user = this.data.user;

  get infoFields() {
    return [
      { label: 'Phone', value: this.user.phone ?? '-' },
      { label: 'Gender', value: this.user.gender ?? '-' },
      { label: 'Total Orders', value: String(this.user.totalOrders ?? 0) },
      { label: 'Total Spent', value: `₹${(this.user.totalSpent ?? 0).toLocaleString('en-IN')}` },
      { label: 'Email Verified', value: this.user.isEmailVerified ? 'Yes' : 'No' },
      { label: 'Phone Verified', value: this.user.isPhoneVerified ? 'Yes' : 'No' },
      { label: 'Joined', value: this.user.createdAt ? new Date(this.user.createdAt).toLocaleDateString('en-IN') : '-' },
      { label: 'Last Login', value: this.user.lastLoginDate ? new Date(this.user.lastLoginDate).toLocaleDateString('en-IN') : '-' },
    ];
  }
}
