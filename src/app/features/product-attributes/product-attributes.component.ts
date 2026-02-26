import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { ProductAttributesService } from '../../core/services/product-attributes.service';
import { ToastService } from '../../core/services/toast.service';
import { Category, ColorOption, ProductType, PlantType } from '../../core/models';

@Component({
  selector: 'app-product-attributes',
  standalone: true,
  imports: [
    FormsModule, MatTabsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatDialogModule, MatProgressSpinnerModule,
    PageHeaderComponent, EmptyStateComponent, ImageUploadComponent,
  ],
  template: `
    <app-page-header title="Product Attributes" subtitle="Manage categories, colors, and types" />

    <div class="card">
      <mat-tab-group animationDuration="200ms" class="custom-tabs">
        <!-- Categories -->
        <mat-tab label="Categories">
          <div class="p-6">
            <div class="flex gap-3 mb-6">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Category Name</mat-label>
                <input matInput [(ngModel)]="newCategoryName" placeholder="Enter category name" />
              </mat-form-field>
              <button mat-flat-button color="primary" [disabled]="addingCategory()" (click)="addCategory()" class="!h-14">
                @if (addingCategory()) { <mat-spinner diameter="18"></mat-spinner> } @else { Add }
              </button>
            </div>
            <app-image-upload hint="Category image (optional)" (filesChange)="onCategoryImageChange($event)" />

            <div class="mt-6 space-y-2">
              @for (cat of categories(); track cat._id) {
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  @if (cat.image) {
                    <img [src]="cat.image" class="w-10 h-10 rounded-lg object-cover" />
                  } @else {
                    <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span class="material-icons text-gray-400">folder</span>
                    </div>
                  }
                  <span class="flex-1 text-sm font-medium" style="color: var(--color-text)">{{ cat.name }}</span>
                  <button mat-icon-button (click)="deleteCategory(cat)" class="!text-red-400">
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
              } @empty {
                <app-empty-state icon="folder" title="No categories" message="Add your first category above." />
              }
            </div>
          </div>
        </mat-tab>

        <!-- Colors -->
        <mat-tab label="Colors">
          <div class="p-6">
            <div class="flex gap-3 mb-6">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Color Name</mat-label>
                <input matInput [(ngModel)]="newColorName" placeholder="Enter color name" />
              </mat-form-field>
              <button mat-flat-button color="primary" [disabled]="addingColor()" (click)="addColor()" class="!h-14">
                @if (addingColor()) { <mat-spinner diameter="18"></mat-spinner> } @else { Add }
              </button>
            </div>
            <div class="space-y-2">
              @for (color of colors(); track color._id) {
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div class="w-6 h-6 rounded-full border" style="background: {{ color.name }}; border-color: var(--color-border)"></div>
                  <span class="flex-1 text-sm font-medium" style="color: var(--color-text)">{{ color.name }}</span>
                  <button mat-icon-button (click)="deleteColor(color)" class="!text-red-400">
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
              } @empty {
                <app-empty-state icon="palette" title="No colors" message="Add your first color above." />
              }
            </div>
          </div>
        </mat-tab>

        <!-- Product Types -->
        <mat-tab label="Product Types">
          <div class="p-6">
            <div class="flex gap-3 mb-6">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Product Type</mat-label>
                <input matInput [(ngModel)]="newProductType" placeholder="Enter product type" />
              </mat-form-field>
              <button mat-flat-button color="primary" [disabled]="addingProductType()" (click)="addProductType()" class="!h-14">
                @if (addingProductType()) { <mat-spinner diameter="18"></mat-spinner> } @else { Add }
              </button>
            </div>
            <div class="space-y-2">
              @for (type of productTypes(); track type._id) {
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span class="material-icons text-lg" style="color: var(--color-text-muted)">label</span>
                  <span class="flex-1 text-sm font-medium" style="color: var(--color-text)">{{ type.name }}</span>
                  <button mat-icon-button (click)="deleteProductType(type)" class="!text-red-400">
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
              } @empty {
                <app-empty-state icon="label" title="No product types" message="Add your first product type above." />
              }
            </div>
          </div>
        </mat-tab>

        <!-- Plant Types -->
        <mat-tab label="Plant Types">
          <div class="p-6">
            <div class="flex gap-3 mb-6">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Plant Type</mat-label>
                <input matInput [(ngModel)]="newPlantType" placeholder="Enter plant type" />
              </mat-form-field>
              <button mat-flat-button color="primary" [disabled]="addingPlantType()" (click)="addPlantType()" class="!h-14">
                @if (addingPlantType()) { <mat-spinner diameter="18"></mat-spinner> } @else { Add }
              </button>
            </div>
            <div class="space-y-2">
              @for (type of plantTypes(); track type._id) {
                <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span class="material-icons text-lg" style="color: var(--color-text-muted)">eco</span>
                  <span class="flex-1 text-sm font-medium" style="color: var(--color-text)">{{ type.name }}</span>
                  <button mat-icon-button (click)="deletePlantType(type)" class="!text-red-400">
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
              } @empty {
                <app-empty-state icon="eco" title="No plant types" message="Add your first plant type above." />
              }
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
})
export class ProductAttributesComponent implements OnInit {
  private readonly attrService = inject(ProductAttributesService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly categories = signal<Category[]>([]);
  readonly colors = signal<ColorOption[]>([]);
  readonly productTypes = signal<ProductType[]>([]);
  readonly plantTypes = signal<PlantType[]>([]);

  readonly addingCategory = signal(false);
  readonly addingColor = signal(false);
  readonly addingProductType = signal(false);
  readonly addingPlantType = signal(false);

  newCategoryName = '';
  newColorName = '';
  newProductType = '';
  newPlantType = '';
  private categoryImage: File | null = null;

  ngOnInit(): void { this.loadAll(); }

  onCategoryImageChange(files: File[]): void { this.categoryImage = files[0] ?? null; }

  addCategory(): void {
    if (!this.newCategoryName.trim()) return;
    this.addingCategory.set(true);
    const fd = new FormData();
    fd.append('name', this.newCategoryName.trim());
    if (this.categoryImage) fd.append('image', this.categoryImage);
    this.attrService.createCategory(fd).subscribe({
      next: (res) => {
        const cat = (res.data ?? res) as unknown as Category;
        this.categories.update(c => [...c, cat]);
        this.newCategoryName = '';
        this.categoryImage = null;
        this.toast.success('Category added');
        this.addingCategory.set(false);
      },
      error: () => { this.toast.error('Failed to add category'); this.addingCategory.set(false); },
    });
  }

  deleteCategory(cat: Category): void {
    this.confirmDelete('category', () => {
      this.attrService.deleteCategory(cat._id).subscribe({
        next: () => { this.categories.update(c => c.filter(x => x._id !== cat._id)); this.toast.success('Category deleted'); },
        error: () => this.toast.error('Failed to delete category'),
      });
    });
  }

  addColor(): void {
    if (!this.newColorName.trim()) return;
    this.addingColor.set(true);
    this.attrService.createColor(this.newColorName.trim()).subscribe({
      next: (res) => {
        const color = (res.data ?? res) as unknown as ColorOption;
        this.colors.update(c => [...c, color]);
        this.newColorName = '';
        this.toast.success('Color added');
        this.addingColor.set(false);
      },
      error: () => { this.toast.error('Failed to add color'); this.addingColor.set(false); },
    });
  }

  deleteColor(color: ColorOption): void {
    this.confirmDelete('color', () => {
      this.attrService.deleteColor(color._id).subscribe({
        next: () => { this.colors.update(c => c.filter(x => x._id !== color._id)); this.toast.success('Color deleted'); },
        error: () => this.toast.error('Failed to delete color'),
      });
    });
  }

  addProductType(): void {
    if (!this.newProductType.trim()) return;
    this.addingProductType.set(true);
    this.attrService.createProductType(this.newProductType.trim()).subscribe({
      next: (res) => {
        const type = (res.data ?? res) as unknown as ProductType;
        this.productTypes.update(t => [...t, type]);
        this.newProductType = '';
        this.toast.success('Product type added');
        this.addingProductType.set(false);
      },
      error: () => { this.toast.error('Failed to add product type'); this.addingProductType.set(false); },
    });
  }

  deleteProductType(type: ProductType): void {
    this.confirmDelete('product type', () => {
      this.attrService.deleteProductType(type._id).subscribe({
        next: () => { this.productTypes.update(t => t.filter(x => x._id !== type._id)); this.toast.success('Product type deleted'); },
        error: () => this.toast.error('Failed to delete product type'),
      });
    });
  }

  addPlantType(): void {
    if (!this.newPlantType.trim()) return;
    this.addingPlantType.set(true);
    this.attrService.createPlantType(this.newPlantType.trim()).subscribe({
      next: (res) => {
        const type = (res.data ?? res) as unknown as PlantType;
        this.plantTypes.update(t => [...t, type]);
        this.newPlantType = '';
        this.toast.success('Plant type added');
        this.addingPlantType.set(false);
      },
      error: () => { this.toast.error('Failed to add plant type'); this.addingPlantType.set(false); },
    });
  }

  deletePlantType(type: PlantType): void {
    this.confirmDelete('plant type', () => {
      this.attrService.deletePlantType(type._id).subscribe({
        next: () => { this.plantTypes.update(t => t.filter(x => x._id !== type._id)); this.toast.success('Plant type deleted'); },
        error: () => this.toast.error('Failed to delete plant type'),
      });
    });
  }

  private confirmDelete(name: string, callback: () => void): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: `Delete ${name}`, message: `Are you sure you want to delete this ${name}?`, confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => { if (ok) callback(); });
  }

  private loadAll(): void {
    this.attrService.getCategories().subscribe(res => {
      this.categories.set(((res.data ?? res) as unknown as Category[]) ?? []);
    });
    this.attrService.getColors().subscribe(res => {
      this.colors.set(((res.data ?? res) as unknown as ColorOption[]) ?? []);
    });
    this.attrService.getProductTypes().subscribe(res => {
      this.productTypes.set(((res.data ?? res) as unknown as ProductType[]) ?? []);
    });
    this.attrService.getPlantTypes().subscribe(res => {
      this.plantTypes.set(((res.data ?? res) as unknown as PlantType[]) ?? []);
    });
  }
}
