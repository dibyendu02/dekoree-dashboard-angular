import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { ProductService } from '../../core/services/product.service';
import { ChatContextService } from '../../core/services/chat-context.service';
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
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly chatContext = inject(ChatContextService);
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

  ngOnInit(): void {
    this.chatContext.set({
      page: 'products',
      breadcrumbs: ['Products'],
      metadata: {
        description: 'Product catalogue with inventory management',
        features: ['product list', 'stock levels', 'categories', 'filters'],
      },
    });
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
  }

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
