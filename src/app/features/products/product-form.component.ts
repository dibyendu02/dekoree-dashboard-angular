import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { ProductService } from '../../core/services/product.service';
import { ProductAttributesService } from '../../core/services/product-attributes.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, ImageUploadComponent],
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly attrService = inject(ProductAttributesService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject<{ close: (v: unknown) => void }>('DIALOG_REF' as never);
  private readonly data = inject<{ product?: Product } | null>('DIALOG_DATA' as never);

  readonly saving = signal(false);
  readonly categories = signal<{ _id: string; name: string }[]>([]);
  readonly productTypes = signal<{ _id: string; name: string }[]>([]);
  readonly colors = signal<{ _id: string; name: string }[]>([]);
  readonly isEdit: boolean;
  private readonly editId: string;
  private imageFiles: File[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    shortDescription: [''],
    longDescription: [''],
    price: [0, [Validators.required, Validators.min(1)]],
    mrp: [0],
    stock: [0],
    sku: [''],
    category: [''],
    productType: [''],
    color: [''],
    weight: [0],
    length: [0],
    width: [0],
    height: [0],
    isActive: [true],
    isFeatured: [false],
    faqs: this.fb.array<ReturnType<typeof this.createFaqGroup>>([]),
  });

  get faqArray(): FormArray {
    return this.form.get('faqs') as FormArray;
  }

  constructor() {
    const product = this.data?.product;
    this.isEdit = !!product;
    this.editId = product?._id ?? '';
  }

  ngOnInit(): void {
    this.loadAttributes();
    const product = this.data?.product;
    if (product) {
      this.form.patchValue({
        name: product.name,
        shortDescription: product.shortDescription ?? '',
        longDescription: product.longDescription ?? '',
        price: product.price,
        mrp: product.mrp ?? 0,
        stock: product.stock ?? 0,
        sku: product.sku ?? '',
        category: typeof product.category === 'string' ? product.category : (product.category as { _id: string })?._id ?? '',
        productType: product.productType ?? '',
        color: product.color ?? '',
        weight: product.weight ?? 0,
        length: product.length ?? 0,
        width: product.width ?? 0,
        height: product.height ?? 0,
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured ?? false,
      });
      product.faqs?.forEach(f => {
        const group = this.createFaqGroup();
        group.patchValue(f);
        this.faqArray.push(group);
      });
    }
  }

  addFaq(): void {
    this.faqArray.push(this.createFaqGroup());
  }

  removeFaq(i: number): void {
    this.faqArray.removeAt(i);
  }

  onImagesChange(files: File[]): void {
    this.imageFiles = files;
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
      if (key === 'faqs') {
        formData.append('faqs', JSON.stringify(value));
      } else if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    this.imageFiles.forEach(file => formData.append('images', file));

    const obs$ = this.isEdit
      ? this.productService.updateProduct(this.editId, formData)
      : this.productService.createProduct(formData);

    obs$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Product updated' : 'Product created');
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.error('Failed to save product');
        this.saving.set(false);
      },
    });
  }

  private createFaqGroup() {
    return this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required],
    });
  }

  private loadAttributes(): void {
    this.attrService.getCategories().subscribe({
      next: (r) => this.categories.set(r.data ?? []),
    });
    this.attrService.getProductTypes().subscribe({
      next: (r) => this.productTypes.set(r.data ?? []),
    });
    this.attrService.getColors().subscribe({
      next: (r) => this.colors.set(r.data ?? []),
    });
  }
}
