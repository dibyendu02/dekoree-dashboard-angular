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
  templateUrl: './banner-form.component.html',
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
