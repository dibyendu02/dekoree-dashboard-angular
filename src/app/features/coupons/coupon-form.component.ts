import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatCheckboxModule, MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      {{ isEdit ? 'Edit Coupon' : 'Create Coupon' }}
    </h2>
    <mat-dialog-content class="!max-h-[70vh]">
      <form [formGroup]="form" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Coupon Code</mat-label>
            <input matInput formControlName="code" style="text-transform: uppercase" />
            <mat-error>Code is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Discount Type</mat-label>
            <mat-select formControlName="discountType">
              <mat-option value="percentage">Percentage</mat-option>
              <mat-option value="fixed">Fixed Amount</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
          <mat-error>Description is required</mat-error>
        </mat-form-field>

        <div class="grid grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Discount Value</mat-label>
            <input matInput type="number" formControlName="discountValue" />
            <mat-error>Must be greater than 0</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Max Discount (₹)</mat-label>
            <input matInput type="number" formControlName="maxDiscount" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Min Order (₹)</mat-label>
            <input matInput type="number" formControlName="minOrderAmount" />
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            <mat-error>Start date is required</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            <mat-error>End date is required</mat-error>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Usage Limit</mat-label>
            <input matInput type="number" formControlName="usageLimit" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Per User Limit</mat-label>
            <input matInput type="number" formControlName="usageLimitPerUser" />
          </mat-form-field>
        </div>

        <div class="flex gap-6 py-2">
          <mat-checkbox formControlName="isPublic">Public Coupon</mat-checkbox>
          <mat-checkbox formControlName="isActive">Active</mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="!gap-2 !pb-4 !pr-6">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="submitting()" (click)="onSubmit()">
        @if (submitting()) { <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner> }
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class CouponFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<CouponFormComponent>);
  private readonly dialogData = inject<{ coupon?: Coupon }>(MAT_DIALOG_DATA);

  readonly submitting = signal(false);
  get isEdit(): boolean { return !!this.dialogData?.coupon; }

  readonly form = this.fb.group({
    code: ['', Validators.required],
    description: ['', Validators.required],
    discountType: ['percentage' as 'percentage' | 'fixed'],
    discountValue: [0, [Validators.required, Validators.min(1)]],
    maxDiscount: [null as number | null],
    minOrderAmount: [0],
    startDate: [null as Date | null, Validators.required],
    endDate: [null as Date | null, Validators.required],
    usageLimit: [null as number | null],
    usageLimitPerUser: [1],
    isPublic: [true],
    isActive: [true],
  });

  ngOnInit(): void {
    if (this.dialogData?.coupon) {
      const c = this.dialogData.coupon;
      this.form.patchValue({
        ...c,
        startDate: c.startDate ? new Date(c.startDate) : null,
        endDate: c.endDate ? new Date(c.endDate) : null,
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    const values = this.form.getRawValue();
    const payload = {
      code: values.code ?? '',
      description: values.description ?? '',
      discountType: values.discountType ?? 'percentage',
      discountValue: values.discountValue ?? 0,
      minOrderAmount: values.minOrderAmount ?? 0,
      usageLimitPerUser: values.usageLimitPerUser ?? 1,
      isPublic: values.isPublic ?? true,
      isActive: values.isActive ?? true,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
      maxDiscount: values.maxDiscount ?? undefined,
      usageLimit: values.usageLimit ?? undefined,
    } as Partial<Coupon>;

    const request = this.isEdit
      ? this.couponService.updateCoupon(this.dialogData.coupon!._id, payload)
      : this.couponService.createCoupon(payload);

    request.subscribe({
      next: () => { this.toast.success(`Coupon ${this.isEdit ? 'updated' : 'created'}`); this.dialogRef.close(true); },
      error: () => { this.toast.error(`Failed to ${this.isEdit ? 'update' : 'create'} coupon`); this.submitting.set(false); },
    });
  }
}
