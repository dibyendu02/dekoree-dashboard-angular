import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models';
import { ProductFormComponent } from './product-form.component';
import { ProductDetailComponent } from './product-detail.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    DecimalPipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSelectModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
    TruncatePipe,
  ],
  template: `
    <app-page-header title="Products" subtitle="Manage your product catalog">
      <button mat-flat-button color="primary" (click)="openForm()">
        <span class="material-icons text-lg mr-1">add</span>
        Add Product
      </button>
    </app-page-header>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <app-search-input
            placeholder="Search products..."
            (searchChange)="onSearch($event)"
          />
        </div>
        <mat-form-field appearance="outline" class="!w-48">
          <mat-label>Category</mat-label>
          <mat-select (selectionChange)="onCategoryFilter($event.value)">
            <mat-option value="">All Categories</mat-option>
            @for (cat of categories(); track cat) {
              <mat-option [value]="cat">{{ cat }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="!w-44">
          <mat-label>Status</mat-label>
          <mat-select (selectionChange)="onStatusFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
            <mat-option value="low-stock">Low Stock</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (dataSource.data.length === 0) {
      <div class="card">
        <app-empty-state
          icon="inventory_2"
          title="No products found"
          message="Start building your catalog by adding your first product."
          actionText="Add Product"
          (action)="openForm()"
        />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <!-- Image -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let product">
                @if (product.images?.[0]) {
                  <img
                    [src]="product.images[0]"
                    [alt]="product.name"
                    class="w-10 h-10 rounded-lg object-cover border"
                    style="border-color: var(--color-border)"
                  />
                } @else {
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span class="material-icons text-gray-400 text-lg">image</span>
                  </div>
                }
              </td>
            </ng-container>

            <!-- Name -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let product">
                <span class="font-medium text-sm" style="color: var(--color-text)">
                  {{ product.name | truncate:40 }}
                </span>
              </td>
            </ng-container>

            <!-- Category -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let product">
                <span class="text-sm" style="color: var(--color-text-secondary)">
                  {{ getCategoryName(product.category) }}
                </span>
              </td>
            </ng-container>

            <!-- Price -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
              <td mat-cell *matCellDef="let product">
                <span class="text-sm font-medium" style="color: var(--color-text)">
                  {{ product.price | currencyInr }}
                </span>
                @if (product.originalPrice && product.originalPrice > product.price) {
                  <span class="text-xs line-through ml-1" style="color: var(--color-text-muted)">
                    {{ product.originalPrice | currencyInr }}
                  </span>
                }
              </td>
            </ng-container>

            <!-- Stock -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock</th>
              <td mat-cell *matCellDef="let product">
                <span
                  class="text-sm font-medium"
                  [class.text-red-500]="(product.stock ?? 0) <= (product.lowStockThreshold ?? 5)"
                  [style.color]="(product.stock ?? 0) > (product.lowStockThreshold ?? 5) ? 'var(--color-text)' : ''"
                >
                  {{ product.stock ?? 0 }}
                </span>
                @if ((product.stock ?? 0) <= (product.lowStockThreshold ?? 5)) {
                  <span class="material-icons text-red-500 text-sm ml-1 align-middle">warning</span>
                }
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let product">
                <mat-slide-toggle
                  [checked]="product.isActive"
                  (change)="toggleStatus(product)"
                  color="primary"
                ></mat-slide-toggle>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let product">
                <button mat-icon-button [matMenuTriggerFor]="actionMenu">
                  <span class="material-icons">more_vert</span>
                </button>
                <mat-menu #actionMenu="matMenu">
                  <button mat-menu-item (click)="viewProduct(product)">
                    <span class="material-icons mr-2">visibility</span> View
                  </button>
                  <button mat-menu-item (click)="openForm(product)">
                    <span class="material-icons mr-2">edit</span> Edit
                  </button>
                  <button mat-menu-item (click)="duplicateProduct(product)">
                    <span class="material-icons mr-2">content_copy</span> Duplicate
                  </button>
                  <hr style="border-color: var(--color-border)" />
                  <button mat-menu-item (click)="deleteProduct(product)" class="!text-red-500">
                    <span class="material-icons mr-2">delete</span> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" class="cursor-pointer"></tr>
          </table>
        </div>

        <mat-paginator
          [pageSizeOptions]="[10, 25, 50]"
          [pageSize]="10"
          showFirstLastButtons
        ></mat-paginator>
      </div>
    }
  `,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly categories = signal<string[]>([]);
  readonly displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'status', 'actions'];

  dataSource = new MatTableDataSource<Product>([]);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) this.dataSource.paginator = p;
  }
  @ViewChild(MatSort) set sort(s: MatSort) {
    if (s) this.dataSource.sort = s;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  onSearch(term: string): void {
    this.dataSource.filter = term.trim().toLowerCase();
  }

  onCategoryFilter(category: string): void {
    if (category) {
      this.dataSource.filterPredicate = (data) =>
        this.getCategoryName(data.category).toLowerCase() === category.toLowerCase();
      this.dataSource.filter = category;
    } else {
      this.dataSource.filterPredicate = (data, filter) =>
        data.name.toLowerCase().includes(filter);
      this.dataSource.filter = '';
    }
  }

  onStatusFilter(status: string): void {
    if (!status) {
      this.dataSource.filterPredicate = (data, filter) =>
        data.name.toLowerCase().includes(filter);
      this.dataSource.filter = '';
      return;
    }
    this.dataSource.filterPredicate = (data) => {
      if (status === 'active') return data.isActive === true;
      if (status === 'inactive') return data.isActive === false;
      if (status === 'low-stock') return (data.stock ?? 0) <= (data.lowStockThreshold ?? 5);
      return true;
    };
    this.dataSource.filter = status;
  }

  getCategoryName(category: unknown): string {
    if (!category) return '-';
    if (typeof category === 'string') return category;
    return (category as { name?: string }).name ?? '-';
  }

  openForm(product?: Product): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { product },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadProducts();
    });
  }

  viewProduct(product: Product): void {
    this.dialog.open(ProductDetailComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { product },
    });
  }

  toggleStatus(product: Product): void {
    this.productService.toggleStatus(product._id).subscribe({
      next: () => {
        product.isActive = !product.isActive;
        this.toast.success(`Product ${product.isActive ? 'activated' : 'deactivated'}`);
      },
      error: () => this.toast.error('Failed to update product status'),
    });
  }

  duplicateProduct(product: Product): void {
    this.productService.duplicateProduct(product._id).subscribe({
      next: () => {
        this.toast.success('Product duplicated');
        this.loadProducts();
      },
      error: () => this.toast.error('Failed to duplicate product'),
    });
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product',
        message: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.productService.deleteProduct(product._id).subscribe({
        next: () => {
          this.toast.success('Product deleted');
          this.dataSource.data = this.dataSource.data.filter(p => p._id !== product._id);
        },
        error: () => this.toast.error('Failed to delete product'),
      });
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({ limit: 200 }).subscribe({
      next: (res) => {
        const products = res.data ?? (res as unknown as Product[]);
        this.dataSource.data = Array.isArray(products) ? products : [];
        const cats = new Set<string>();
        this.dataSource.data.forEach(p => {
          const name = this.getCategoryName(p.category);
          if (name !== '-') cats.add(name);
        });
        this.categories.set(Array.from(cats));
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load products');
        this.loading.set(false);
      },
    });
  }
}
