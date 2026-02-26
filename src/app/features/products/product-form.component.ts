import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { ProductService } from '../../core/services/product.service';
import { ProductAttributesService } from '../../core/services/product-attributes.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Category, ColorOption, ProductType, PlantType } from '../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    ImageUploadComponent,
  ],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      {{ isEdit ? 'Edit Product' : 'Add New Product' }}
    </h2>

    <mat-dialog-content class="!max-h-[70vh]">
      <form [formGroup]="form" class="space-y-4">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Product Name</mat-label>
            <input matInput formControlName="name" />
            <mat-error>Name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>SKU</mat-label>
            <input matInput formControlName="sku" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"></textarea>
        </mat-form-field>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              @for (cat of categories(); track cat._id) {
                <mat-option [value]="cat._id">{{ cat.name }}</mat-option>
              }
            </mat-select>
            <mat-error>Category is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Product Type</mat-label>
            <mat-select formControlName="productType">
              @for (type of productTypes(); track type._id) {
                <mat-option [value]="type._id">{{ type.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Color</mat-label>
            <mat-select formControlName="color">
              @for (color of colors(); track color._id) {
                <mat-option [value]="color._id">{{ color.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Pricing -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Price (₹)</mat-label>
            <input matInput type="number" formControlName="price" />
            <mat-error>Price is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Original Price (₹)</mat-label>
            <input matInput type="number" formControlName="originalPrice" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Discount %</mat-label>
            <input matInput [value]="discountPercent()" disabled />
          </mat-form-field>
        </div>

        <!-- Stock -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Stock</mat-label>
            <input matInput type="number" formControlName="stock" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Low Stock Threshold</mat-label>
            <input matInput type="number" formControlName="lowStockThreshold" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Weight (g)</mat-label>
            <input matInput type="number" formControlName="weight" />
          </mat-form-field>
        </div>

        <!-- Plant attributes -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <mat-form-field appearance="outline">
            <mat-label>Plant Type</mat-label>
            <mat-select formControlName="plantType">
              @for (type of plantTypes(); track type._id) {
                <mat-option [value]="type._id">{{ type.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Water Requirement</mat-label>
            <mat-select formControlName="waterRequirement">
              <mat-option value="low">Low</mat-option>
              <mat-option value="medium">Medium</mat-option>
              <mat-option value="high">High</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sunlight</mat-label>
            <mat-select formControlName="sunlightRequirement">
              <mat-option value="low">Low</mat-option>
              <mat-option value="partial">Partial</mat-option>
              <mat-option value="full">Full</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <!-- Toggles -->
        <div class="flex flex-wrap gap-6 py-2">
          <mat-checkbox formControlName="isFeatured">Featured</mat-checkbox>
          <mat-checkbox formControlName="isBestseller">Bestseller</mat-checkbox>
          <mat-checkbox formControlName="isTrending">Trending</mat-checkbox>
          <mat-checkbox formControlName="codAvailable">COD Available</mat-checkbox>
        </div>

        <!-- Images -->
        <div>
          <label class="text-sm font-medium block mb-2" style="color: var(--color-text-secondary)">
            Product Images
          </label>
          <app-image-upload
            [multiple]="true"
            hint="Upload up to 5 images, max 10MB each"
            (filesChange)="onImagesChange($event)"
          />
        </div>

        <!-- FAQs -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium" style="color: var(--color-text-secondary)">FAQs</label>
            <button mat-button type="button" (click)="addFaq()" class="!text-indigo-600">
              <span class="material-icons text-sm mr-1">add</span> Add FAQ
            </button>
          </div>
          @for (faq of faqs.controls; track $index; let i = $index) {
            <div class="flex gap-3 mb-3 items-start" [formGroupName]="'faqs'">
              <div formArrayName="faqs" class="flex-1 grid grid-cols-2 gap-3">
                <div [formGroupName]="i">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Question</mat-label>
                    <input matInput formControlName="question" />
                  </mat-form-field>
                </div>
                <div [formGroupName]="i">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Answer</mat-label>
                    <input matInput formControlName="answer" />
                  </mat-form-field>
                </div>
              </div>
              <button
                mat-icon-button
                type="button"
                (click)="removeFaq(i)"
                class="!text-red-400 mt-2"
              >
                <span class="material-icons">close</span>
              </button>
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!gap-2 !pb-4 !pr-6">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="submitting()"
        (click)="onSubmit()"
      >
        @if (submitting()) {
          <mat-spinner diameter="18" class="inline-block mr-2"></mat-spinner>
        }
        {{ isEdit ? 'Update' : 'Create' }} Product
      </button>
    </mat-dialog-actions>
  `,
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly attrService = inject(ProductAttributesService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject(MatDialogRef<ProductFormComponent>);
  private readonly dialogData = inject<{ product?: Product }>(MAT_DIALOG_DATA);

  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);
  readonly colors = signal<ColorOption[]>([]);
  readonly productTypes = signal<ProductType[]>([]);
  readonly plantTypes = signal<PlantType[]>([]);

  private imageFiles: File[] = [];

  get isEdit(): boolean {
    return !!this.dialogData?.product;
  }

  readonly form = this.fb.group({
    name: ['', Validators.required],
    sku: [''],
    description: [''],
    category: ['', Validators.required],
    productType: [''],
    color: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    originalPrice: [0],
    stock: [0],
    lowStockThreshold: [5],
    weight: [0],
    plantType: [''],
    waterRequirement: [''],
    sunlightRequirement: [''],
    isFeatured: [false],
    isBestseller: [false],
    isTrending: [false],
    codAvailable: [true],
    faqs: this.fb.array<ReturnType<typeof this.createFaqGroup>>([]),
  });

  get faqs(): FormArray {
    return this.form.get('faqs') as FormArray;
  }

  discountPercent = signal('0%');

  ngOnInit(): void {
    this.loadAttributes();

    if (this.dialogData?.product) {
      const p = this.dialogData.product;
      this.form.patchValue({
        name: p.name,
        sku: p.sku ?? '',
        description: p.description ?? '',
        category: typeof p.category === 'string' ? p.category : (p.category as Category)?._id ?? '',
        productType: p.productType ?? '',
        color: p.color ?? '',
        price: p.price,
        originalPrice: p.originalPrice ?? 0,
        stock: p.stock ?? 0,
        lowStockThreshold: p.lowStockThreshold ?? 5,
        weight: p.weight ?? 0,
        plantType: p.plantType ?? '',
        waterRequirement: p.waterRequirement ?? '',
        sunlightRequirement: p.sunlightRequirement ?? '',
        isFeatured: p.isFeatured ?? false,
        isBestseller: p.isBestseller ?? false,
        isTrending: p.isTrending ?? false,
        codAvailable: p.codAvailable ?? true,
      });
      p.faqs?.forEach(faq => {
        this.faqs.push(this.fb.group({ question: [faq.question], answer: [faq.answer] }));
      });
    }

    this.form.get('price')?.valueChanges.subscribe(() => this.updateDiscount());
    this.form.get('originalPrice')?.valueChanges.subscribe(() => this.updateDiscount());
  }

  addFaq(): void {
    this.faqs.push(this.createFaqGroup());
  }

  removeFaq(index: number): void {
    this.faqs.removeAt(index);
  }

  onImagesChange(files: File[]): void {
    this.imageFiles = files;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const formData = new FormData();
    const values = this.form.getRawValue();

    Object.entries(values).forEach(([key, value]) => {
      if (key === 'faqs') {
        formData.append('faqs', JSON.stringify(value));
      } else if (value !== null && value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });

    this.imageFiles.forEach(file => formData.append('images', file));

    const request = this.isEdit
      ? this.productService.updateProduct(this.dialogData.product!._id, formData)
      : this.productService.createProduct(formData);

    request.subscribe({
      next: () => {
        this.toast.success(`Product ${this.isEdit ? 'updated' : 'created'} successfully`);
        this.dialogRef.close(true);
      },
      error: () => {
        this.toast.error(`Failed to ${this.isEdit ? 'update' : 'create'} product`);
        this.submitting.set(false);
      },
    });
  }

  private createFaqGroup() {
    return this.fb.group({ question: [''], answer: [''] });
  }

  private updateDiscount(): void {
    const price = this.form.get('price')?.value ?? 0;
    const original = this.form.get('originalPrice')?.value ?? 0;
    if (original > 0 && price < original) {
      const percent = Math.round(((original - price) / original) * 100);
      this.discountPercent.set(`${percent}%`);
    } else {
      this.discountPercent.set('0%');
    }
  }

  private loadAttributes(): void {
    this.attrService.getCategories().subscribe(res => {
      this.categories.set((res.data ?? res) as unknown as Category[]);
    });
    this.attrService.getColors().subscribe(res => {
      this.colors.set((res.data ?? res) as unknown as ColorOption[]);
    });
    this.attrService.getProductTypes().subscribe(res => {
      this.productTypes.set((res.data ?? res) as unknown as ProductType[]);
    });
    this.attrService.getPlantTypes().subscribe(res => {
      this.plantTypes.set((res.data ?? res) as unknown as PlantType[]);
    });
  }
}
