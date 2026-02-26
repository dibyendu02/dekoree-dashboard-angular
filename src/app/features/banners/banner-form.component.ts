import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { BannerService } from '../../core/services/banner.service';
import { ToastService } from '../../core/services/toast.service';
import { Banner } from '../../core/models';

@Component({
  selector: 'app-banner-form',
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadComponent],
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        {{ isEdit ? 'Edit Banner' : 'Add Banner' }}
      </h2>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-3 overflow-y-auto" style="max-height: 70vh">
      <div class="form-field mb-4">
        <label>Title</label>
        <input formControlName="title" placeholder="Banner title" />
        @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
          <span class="form-error">Title is required</span>
        }
      </div>

      <div class="form-field mb-4">
        <label>Link URL</label>
        <input formControlName="link" placeholder="https://..." />
      </div>

      <div class="form-field mb-4">
        <label>Position</label>
        <select formControlName="position">
          <option value="">Select position</option>
          <option value="home_top">Home Top</option>
          <option value="home_middle">Home Middle</option>
          <option value="home_bottom">Home Bottom</option>
          <option value="category">Category Page</option>
        </select>
      </div>

      <div class="form-field mb-4">
        <label>Sort Order</label>
        <input type="number" formControlName="sortOrder" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-2" style="color: var(--color-text-secondary)">
          Banner Image
        </label>
        <app-image-upload hint="Recommended: 1200×400px" (filesChange)="onImageChange($event)" />
      </div>

      <div>
        <label class="custom-checkbox">
          <input type="checkbox" formControlName="isActive" />
          <span>Active</span>
        </label>
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
export class BannerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly bannerService = inject(BannerService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject<{ close: (v: unknown) => void }>('DIALOG_REF' as never);
  private readonly data = inject<{ banner?: Banner } | null>('DIALOG_DATA' as never);

  readonly saving = signal(false);
  readonly isEdit: boolean;
  private readonly editId: string;
  private imageFile: File | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    link: [''],
    position: [''],
    sortOrder: [0],
    isActive: [true],
  });

  constructor() {
    const banner = this.data?.banner;
    this.isEdit = !!banner;
    this.editId = banner?._id ?? '';
  }

  ngOnInit(): void {
    const banner = this.data?.banner;
    if (banner) {
      this.form.patchValue({
        title: banner.title,
        link: banner.link ?? '',
        position: banner.position ?? '',
        sortOrder: banner.sortOrder ?? 0,
        isActive: banner.isActive ?? true,
      });
    }
  }

  onImageChange(files: File[]): void {
    this.imageFile = files[0] ?? null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const formData = new FormData();
    const raw = this.form.getRawValue();

    Object.entries(raw).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (this.imageFile) {
      formData.append('image', this.imageFile);
    }

    const obs$ = this.isEdit
      ? this.bannerService.updateBanner(this.editId, formData)
      : this.bannerService.createBanner(formData);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Banner updated' : 'Banner created');
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.error('Failed to save banner');
        this.saving.set(false);
      },
    });
  }
}
