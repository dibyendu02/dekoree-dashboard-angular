import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        {{ isEdit ? 'Edit Coupon' : 'Create Coupon' }}
      </h2>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-3 overflow-y-auto" style="max-height: 70vh">
      <div class="grid grid-cols-2 gap-4">
        <div class="form-field col-span-2">
          <label for="code">Coupon Code</label>
          <input id="code" formControlName="code" placeholder="e.g. SAVE20" style="text-transform: uppercase" />
          @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
            <span class="form-error">Code is required</span>
          }
        </div>

        <div class="form-field">
          <label for="discountType">Discount Type</label>
          <select id="discountType" formControlName="discountType">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>

        <div class="form-field">
          <label for="discountValue">Discount Value</label>
          <input id="discountValue" type="number" formControlName="discountValue" />
          @if (form.get('discountValue')?.hasError('required') && form.get('discountValue')?.touched) {
            <span class="form-error">Value is required</span>
          }
        </div>

        <div class="form-field">
          <label for="minOrderAmount">Min. Order Amount (₹)</label>
          <input id="minOrderAmount" type="number" formControlName="minOrderAmount" />
        </div>

        <div class="form-field">
          <label for="maxDiscount">Max Discount (₹)</label>
          <input id="maxDiscount" type="number" formControlName="maxDiscount" />
        </div>

        <div class="form-field">
          <label for="maxUses">Max Uses</label>
          <input id="maxUses" type="number" formControlName="maxUses" />
        </div>

        <div class="form-field">
          <label for="expiryDate">Expiry Date</label>
          <input id="expiryDate" type="date" formControlName="expiryDate" />
          @if (form.get('expiryDate')?.hasError('required') && form.get('expiryDate')?.touched) {
            <span class="form-error">Expiry date is required</span>
          }
        </div>

        <div class="form-field col-span-2">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" rows="2" placeholder="Optional description..."></textarea>
        </div>

        <div class="col-span-2">
          <label class="custom-checkbox">
            <input type="checkbox" formControlName="isActive" />
            <span>Active</span>
          </label>
        </div>
      </div>
    </form>

    <div class="flex justify-end gap-2 px-6 pb-5 pt-3">
      <button type="button" class="btn btn-ghost" (click)="dialogRef.close(null)">Cancel</button>
      <button
        type="button"
        class="btn btn-primary"
        [disabled]="saving() || form.invalid"
        (click)="onSubmit()"
      >
        @if (saving()) {
          <span class="spinner w-4 h-4 border-white/30 border-t-white mr-1"></span>
        }
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </div>
  `,
})
export class CouponFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject<{ close: (v: unknown) => void }>('DIALOG_REF' as never);
  private readonly data = inject<{ coupon?: Coupon } | null>('DIALOG_DATA' as never);

  readonly saving = signal(false);
  readonly isEdit: boolean;
  private readonly editId: string;

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    discountType: ['percentage' as 'percentage' | 'fixed'],
    discountValue: [0, [Validators.required, Validators.min(1)]],
    minOrderAmount: [0],
    maxDiscount: [0],
    maxUses: [0],
    expiryDate: ['', Validators.required],
    description: [''],
    isActive: [true],
  });

  constructor() {
    const coupon = this.data?.coupon;
    this.isEdit = !!coupon;
    this.editId = coupon?._id ?? '';
  }

  ngOnInit(): void {
    const coupon = this.data?.coupon;
    if (coupon) {
      this.form.patchValue({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount ?? 0,
        maxDiscount: coupon.maxDiscount ?? 0,
        maxUses: coupon.maxUses ?? 0,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
        description: coupon.description ?? '',
        isActive: coupon.isActive ?? true,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();

    const obs$ = this.isEdit
      ? this.couponService.updateCoupon(this.editId, value)
      : this.couponService.createCoupon(value);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Coupon updated' : 'Coupon created');
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.error('Failed to save coupon');
        this.saving.set(false);
      },
    });
  }
}
