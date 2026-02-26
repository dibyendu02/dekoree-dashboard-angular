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
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        {{ isEdit ? 'Edit Product' : 'Add Product' }}
      </h2>
    </div>

    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="px-6 py-3 overflow-y-auto" style="max-height: 70vh">
      <div class="grid grid-cols-2 gap-4">
        <!-- Name -->
        <div class="form-field col-span-2">
          <label>Product Name</label>
          <input formControlName="name" placeholder="Enter product name" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <span class="form-error">Name is required</span>
          }
        </div>

        <!-- Short Description -->
        <div class="form-field col-span-2">
          <label>Short Description</label>
          <textarea formControlName="shortDescription" rows="2" placeholder="Brief description..."></textarea>
        </div>

        <!-- Long Description -->
        <div class="form-field col-span-2">
          <label>Long Description</label>
          <textarea formControlName="longDescription" rows="3" placeholder="Detailed description..."></textarea>
        </div>

        <!-- Price & MRP -->
        <div class="form-field">
          <label>Price (₹)</label>
          <input type="number" formControlName="price" />
          @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
            <span class="form-error">Price is required</span>
          }
        </div>
        <div class="form-field">
          <label>MRP (₹)</label>
          <input type="number" formControlName="mrp" />
        </div>

        <!-- Stock & SKU -->
        <div class="form-field">
          <label>Stock</label>
          <input type="number" formControlName="stock" />
        </div>
        <div class="form-field">
          <label>SKU</label>
          <input formControlName="sku" placeholder="Optional SKU" />
        </div>

        <!-- Category & Type -->
        <div class="form-field">
          <label>Category</label>
          <select formControlName="category">
            <option value="">Select category</option>
            @for (cat of categories(); track cat._id) {
              <option [value]="cat._id">{{ cat.name }}</option>
            }
          </select>
        </div>
        <div class="form-field">
          <label>Product Type</label>
          <select formControlName="productType">
            <option value="">Select type</option>
            @for (type of productTypes(); track type._id) {
              <option [value]="type._id">{{ type.name }}</option>
            }
          </select>
        </div>

        <!-- Color -->
        <div class="form-field">
          <label>Color</label>
          <select formControlName="color">
            <option value="">Select color</option>
            @for (color of colors(); track color._id) {
              <option [value]="color._id">{{ color.name }}</option>
            }
          </select>
        </div>

        <div class="form-field">
          <label>Weight (g)</label>
          <input type="number" formControlName="weight" />
        </div>

        <!-- Dimensions -->
        <div class="col-span-2 grid grid-cols-3 gap-4">
          <div class="form-field">
            <label>Length (cm)</label>
            <input type="number" formControlName="length" />
          </div>
          <div class="form-field">
            <label>Width (cm)</label>
            <input type="number" formControlName="width" />
          </div>
          <div class="form-field">
            <label>Height (cm)</label>
            <input type="number" formControlName="height" />
          </div>
        </div>

        <!-- Image Upload -->
        <div class="col-span-2">
          <label
            class="block text-sm font-medium mb-2"
            style="color: var(--color-text-secondary)"
          >
            Product Images
          </label>
          <app-image-upload [multiple]="true" (filesChange)="onImagesChange($event)" />
        </div>

        <!-- FAQ Section -->
        <div class="col-span-2">
          <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium" style="color: var(--color-text-secondary)">FAQs</label>
            <button type="button" class="btn btn-ghost text-sm" (click)="addFaq()">
              <span class="material-icons text-base">add</span> Add FAQ
            </button>
          </div>
          @for (faq of faqArray.controls; track $index; let i = $index) {
            <div class="card p-4 mb-3" [formGroupName]="'faqs'">
              <div [formGroupName]="i">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-xs font-semibold" style="color: var(--color-text-muted)">FAQ {{ i + 1 }}</span>
                  <button type="button" class="btn-icon !w-7 !h-7" (click)="removeFaq(i)">
                    <span class="material-icons text-base text-red-500">delete</span>
                  </button>
                </div>
                <div class="form-field mb-2">
                  <label>Question</label>
                  <input formControlName="question" placeholder="Enter question" />
                </div>
                <div class="form-field">
                  <label>Answer</label>
                  <textarea formControlName="answer" rows="2" placeholder="Enter answer"></textarea>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Checkboxes -->
        <div class="col-span-2 flex gap-6">
          <label class="custom-checkbox">
            <input type="checkbox" formControlName="isActive" />
            <span>Active</span>
          </label>
          <label class="custom-checkbox">
            <input type="checkbox" formControlName="isFeatured" />
            <span>Featured</span>
          </label>
        </div>
      </div>
    </form>

    <div class="flex justify-end gap-2 px-6 pb-5 pt-3">
      <button type="button" class="btn btn-ghost" (click)="dialogRef.close(null)">Cancel</button>
      <button type="button" class="btn btn-primary" [disabled]="saving() || form.invalid" (click)="onSubmit()">
        @if (saving()) {
          <span class="spinner w-4 h-4 border-white/30 border-t-white mr-1"></span>
        }
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </div>
  `,
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
