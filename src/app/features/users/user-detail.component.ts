import { Component, inject } from '@angular/core';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { User } from '../../core/models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [StatusBadgeComponent, CurrencyInrPipe, RelativeTimePipe],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent {
  private readonly data = inject<{ user: User }>('DIALOG_DATA' as never);
  readonly dialogRef = inject<{ close: (v?: unknown) => void }>('DIALOG_REF' as never);
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
