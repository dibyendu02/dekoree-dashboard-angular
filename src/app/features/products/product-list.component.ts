import { Component, inject, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Product } from '../../core/models';
import { ProductFormComponent } from './product-form.component';
import { ProductDetailComponent } from './product-detail.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    TitleCasePipe,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
  ],
  template: `
    <app-page-header title="Products" subtitle="Manage your product catalog">
      <button class="btn btn-primary" (click)="openForm()">
        <span class="material-icons text-lg">add</span> Add Product
      </button>
    </app-page-header>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1">
          <app-search-input placeholder="Search products..." (searchChange)="onSearch($event)" />
        </div>
        <select class="filter-select w-40" (change)="onCategoryFilter($any($event.target).value)">
          <option value="">All Categories</option>
          @for (cat of categories(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
        <select class="filter-select w-36" (change)="onStatusFilter($any($event.target).value)">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (filteredProducts().length === 0 && allProducts().length === 0) {
      <div class="card">
        <app-empty-state
          icon="inventory_2"
          title="No products yet"
          message="Start by adding your first product."
          actionText="Add Product"
          (action)="openForm()"
        />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th class="sortable" (click)="toggleSort('name')"
                    [class.sort-active]="sortField() === 'name'">
                  Name
                  <span class="material-icons sort-icon">{{ getSortIcon('name') }}</span>
                </th>
                <th>Category</th>
                <th class="sortable" (click)="toggleSort('price')"
                    [class.sort-active]="sortField() === 'price'">
                  Price
                  <span class="material-icons sort-icon">{{ getSortIcon('price') }}</span>
                </th>
                <th class="sortable" (click)="toggleSort('stock')"
                    [class.sort-active]="sortField() === 'stock'">
                  Stock
                  <span class="material-icons sort-icon">{{ getSortIcon('stock') }}</span>
                </th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (product of paginatedProducts(); track product._id) {
                <tr class="cursor-pointer" (click)="viewProduct(product)">
                  <td>
                    @if (product.images?.[0]) {
                      <img [src]="product.images![0]" [alt]="product.name"
                           class="w-12 h-12 rounded-lg object-cover border"
                           style="border-color: var(--color-border)" />
                    } @else {
                      <div class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <span class="material-icons text-gray-400">image</span>
                      </div>
                    }
                  </td>
                  <td>
                    <div>
                      <p class="text-sm font-medium" style="color: var(--color-text)">{{ product.name }}</p>
                      @if (product.sku) {
                        <p class="text-xs" style="color: var(--color-text-muted)">SKU: {{ product.sku }}</p>
                      }
                    </div>
                  </td>
                  <td>
                    @if (product.category) {
                      <span class="chip bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {{ getCategoryName(product.category) }}
                      </span>
                    }
                  </td>
                  <td>
                    <div>
                      <span class="text-sm font-semibold" style="color: var(--color-text)">
                        {{ product.price | currencyInr }}
                      </span>
                      @if (product.mrp && product.mrp > product.price) {
                        <span class="text-xs line-through ml-1" style="color: var(--color-text-muted)">
                          {{ product.mrp | currencyInr }}
                        </span>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="text-sm"
                      [class.text-red-500]="(product.stock ?? 0) < 5"
                      [style.color]="(product.stock ?? 0) >= 5 ? 'var(--color-text-secondary)' : ''">
                      {{ product.stock ?? 0 }}
                    </span>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <label class="toggle-switch">
                      <input type="checkbox"
                        [checked]="product.isActive !== false"
                        (change)="toggleActive(product)"
                      />
                      <span class="toggle-track"></span>
                    </label>
                  </td>
                  <td (click)="$event.stopPropagation()">
                    <div class="relative">
                      <button class="btn-icon" (click)="toggleMenu(product._id)">
                        <span class="material-icons">more_vert</span>
                      </button>
                      @if (openMenuId() === product._id) {
                        <div class="dropdown-menu">
                          <button (click)="viewProduct(product); closeMenu()">
                            <span class="material-icons text-lg">visibility</span> View
                          </button>
                          <button (click)="openForm(product); closeMenu()">
                            <span class="material-icons text-lg">edit</span> Edit
                          </button>
                          <hr />
                          <button class="text-red-500" (click)="deleteProduct(product); closeMenu()">
                            <span class="material-icons text-lg">delete</span> Delete
                          </button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-8 text-sm" style="color: var(--color-text-muted)">
                    No matching products
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="flex items-center gap-3">
            <span>Rows per page:</span>
            <select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); currentPage.set(0)">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
            <span>{{ paginationLabel() }}</span>
          </div>
          <div class="pagination-controls">
            <button [disabled]="currentPage() === 0" (click)="currentPage.set(0)">
              <span class="material-icons text-sm">first_page</span>
            </button>
            <button [disabled]="currentPage() === 0" (click)="currentPage.update(p => p - 1)">
              <span class="material-icons text-sm">chevron_left</span>
            </button>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="currentPage.update(p => p + 1)">
              <span class="material-icons text-sm">chevron_right</span>
            </button>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="currentPage.set(totalPages() - 1)">
              <span class="material-icons text-sm">last_page</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly allProducts = signal<Product[]>([]);
  readonly filteredProducts = signal<Product[]>([]);
  readonly categories = signal<string[]>([]);
  readonly searchTerm = signal('');
  readonly categoryFilter = signal('');
  readonly statusFilter = signal('');
  readonly sortField = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly openMenuId = signal<string | null>(null);

  ngOnInit(): void { this.loadProducts(); }

  onSearch(term: string): void { this.searchTerm.set(term.trim().toLowerCase()); this.applyFilters(); }
  onCategoryFilter(cat: string): void { this.categoryFilter.set(cat); this.applyFilters(); }
  onStatusFilter(val: string): void { this.statusFilter.set(val); this.applyFilters(); }

  toggleSort(field: string): void {
    if (this.sortField() === field) this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    else { this.sortField.set(field); this.sortDirection.set('asc'); }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  toggleMenu(id: string): void { this.openMenuId.set(this.openMenuId() === id ? null : id); }
  closeMenu(): void { this.openMenuId.set(null); }

  paginatedProducts(): Product[] {
    const s = this.currentPage() * this.pageSize();
    return this.filteredProducts().slice(s, s + this.pageSize());
  }
  totalPages(): number { return Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize())); }
  paginationLabel(): string {
    const t = this.filteredProducts().length;
    const s = this.currentPage() * this.pageSize() + 1;
    const e = Math.min(s + this.pageSize() - 1, t);
    return t ? `${s}–${e} of ${t}` : '0 of 0';
  }

  getCategoryName(cat: string | { name?: string }): string {
    return typeof cat === 'string' ? cat : (cat?.name ?? '-');
  }

  openForm(product?: Product): void {
    const ref = this.dialog.open(ProductFormComponent, { width: '700px', maxHeight: '90vh', data: product ? { product } : null });
    ref.afterClosed().subscribe(ok => { if (ok) this.loadProducts(); });
  }

  viewProduct(product: Product): void {
    this.dialog.open(ProductDetailComponent, { width: '700px', maxHeight: '90vh', data: { product } });
  }

  toggleActive(product: Product): void {
    const newActive = product.isActive === false;
    const fd = new FormData();
    fd.append('isActive', String(newActive));
    this.productService.updateProduct(product._id, fd).subscribe({
      next: () => { product.isActive = newActive; this.toast.success(`Product ${newActive ? 'activated' : 'deactivated'}`); },
      error: () => this.toast.error('Failed to update'),
    });
  }

  deleteProduct(product: Product): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Product', message: `Delete "${product.name}"? This cannot be undone.`, confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.productService.deleteProduct(product._id).subscribe({
        next: () => { this.toast.success('Product deleted'); this.allProducts.update(p => p.filter(x => x._id !== product._id)); this.applyFilters(); },
        error: () => this.toast.error('Failed to delete product'),
      });
    });
  }

  private applyFilters(): void {
    let data = [...this.allProducts()];
    const search = this.searchTerm();
    const cat = this.categoryFilter();
    const status = this.statusFilter();

    if (search) data = data.filter(p => p.name.toLowerCase().includes(search) || (p.sku ?? '').toLowerCase().includes(search));
    if (cat) data = data.filter(p => this.getCategoryName(p.category as string) === cat);
    if (status) data = data.filter(p => String(p.isActive !== false) === status);

    const field = this.sortField();
    if (field) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[field] ?? '';
        const vb = (b as unknown as Record<string, unknown>)[field] ?? '';
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    this.filteredProducts.set(data);
    if (this.currentPage() >= this.totalPages()) this.currentPage.set(0);
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productService.getProducts({ limit: 200 }).subscribe({
      next: (res) => {
        const products = res.data ?? (res as unknown as Product[]);
        const list = Array.isArray(products) ? products : [];
        this.allProducts.set(list);
        const cats = [...new Set(list.map(p => this.getCategoryName(p.category as string)).filter(Boolean))];
        this.categories.set(cats);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load products'); this.loading.set(false); },
    });
  }
}
