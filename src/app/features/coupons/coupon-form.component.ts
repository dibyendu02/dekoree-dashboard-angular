import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './coupon-form.component.html',
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
