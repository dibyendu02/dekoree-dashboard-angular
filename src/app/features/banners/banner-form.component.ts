import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { BannerService } from '../../core/services/banner.service';
import { ToastService } from '../../core/services/toast.service';
import { Banner } from '../../core/models';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatProgressSpinnerModule, ImageUploadComponent,
  ],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      {{ isEdit ? 'Edit Banner' : 'Create Banner' }}
    </h2>
    <mat-dialog-content class="!max-h-[70vh]">
      <form [formGroup]="form" class="space-y-4">
        <app-image-upload hint="Max 10MB" (filesChange)="onImageChange($event)" />

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type">
              <mat-option value="promotional">Promotional</mat-option>
              <mat-option value="informational">Informational</mat-option>
              <mat-option value="seasonal">Seasonal</mat-option>
              <mat-option value="category">Category</mat-option>
              <mat-option value="product">Product</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Position</mat-label>
            <mat-select formControlName="position">
              <mat-option value="hero">Hero</mat-option>
              <mat-option value="category">Category</mat-option>
              <mat-option value="product">Product</mat-option>
              <mat-option value="footer">Footer</mat-option>
              <mat-option value="popup">Popup</mat-option>
              <mat-option value="sidebar">Sidebar</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Link URL</mat-label>
            <input matInput formControlName="link" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Button Text</mat-label>
            <input matInput formControlName="buttonText" />
          </mat-form-field>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Device Target</mat-label>
            <mat-select formControlName="deviceTarget">
              <mat-option value="all">All Devices</mat-option>
              <mat-option value="desktop">Desktop</mat-option>
              <mat-option value="mobile">Mobile</mat-option>
              <mat-option value="tablet">Tablet</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Display Order</mat-label>
            <input matInput type="number" formControlName="displayOrder" />
          </mat-form-field>
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
export class BannerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bannerService = inject(BannerService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<BannerFormComponent>);
  private readonly dialogData = inject<{ banner?: Banner }>(MAT_DIALOG_DATA);

  readonly submitting = signal(false);
  private imageFile: File | null = null;
  get isEdit(): boolean { return !!this.dialogData?.banner; }

  readonly form = this.fb.group({
    description: [''],
    type: ['promotional'],
    position: ['hero'],
    link: [''],
    buttonText: [''],
    deviceTarget: ['all'],
    displayOrder: [0],
  });

  ngOnInit(): void {
    if (this.dialogData?.banner) {
      const b = this.dialogData.banner;
      this.form.patchValue({
        description: b.description ?? '',
        type: b.type ?? 'promotional',
        position: b.position ?? 'hero',
        link: b.link ?? '',
        buttonText: b.buttonText ?? '',
        deviceTarget: b.deviceTarget ?? 'all',
        displayOrder: b.displayOrder ?? 0,
      });
    }
  }

  onImageChange(files: File[]): void { this.imageFile = files[0] ?? null; }

  onSubmit(): void {
    this.submitting.set(true);
    const formData = new FormData();
    const values = this.form.getRawValue();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    if (this.imageFile) formData.append('image', this.imageFile);

    const request = this.isEdit
      ? this.bannerService.updateBanner(this.dialogData.banner!._id, formData)
      : this.bannerService.createBanner(formData);

    request.subscribe({
      next: () => { this.toast.success(`Banner ${this.isEdit ? 'updated' : 'created'}`); this.dialogRef.close(true); },
      error: () => { this.toast.error(`Failed to ${this.isEdit ? 'update' : 'create'} banner`); this.submitting.set(false); },
    });
  }
}
