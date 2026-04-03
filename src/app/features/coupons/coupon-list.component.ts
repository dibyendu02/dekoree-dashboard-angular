import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe, PercentPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { CouponService } from '../../core/services/coupon.service';
import { ChatContextService } from '../../core/services/chat-context.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Coupon } from '../../core/models';
import { CouponFormComponent } from './coupon-form.component';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    PercentPipe,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
  ],
  templateUrl: './coupon-list.component.html',
})
export class CouponListComponent implements OnInit, OnDestroy {
  private readonly chatContext = inject(ChatContextService);
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly allCoupons = signal<Coupon[]>([]);
  readonly filteredCoupons = signal<Coupon[]>([]);
  readonly searchTerm = signal('');
  readonly typeFilter = signal('');
  readonly sortField = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly openMenuId = signal<string | null>(null);

  ngOnInit(): void {
    this.chatContext.set({
      page: 'coupons',
      breadcrumbs: ['Coupons'],
      metadata: {
        description: 'Discount coupon management',
        features: ['coupon list', 'discount types', 'validity', 'usage limits'],
      },
    });
    this.loadCoupons();
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim().toLowerCase());
    this.applyFilters();
  }

  onTypeFilter(type: string): void {
    this.typeFilter.set(type);
    this.applyFilters();
  }

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

  paginatedCoupons(): Coupon[] {
    const s = this.currentPage() * this.pageSize();
    return this.filteredCoupons().slice(s, s + this.pageSize());
  }

  totalPages(): number { return Math.max(1, Math.ceil(this.filteredCoupons().length / this.pageSize())); }

  paginationLabel(): string {
    const t = this.filteredCoupons().length;
    const s = this.currentPage() * this.pageSize() + 1;
    const e = Math.min(s + this.pageSize() - 1, t);
    return t ? `${s}–${e} of ${t}` : '0 of 0';
  }

  openForm(coupon?: Coupon): void {
    const ref = this.dialog.open(CouponFormComponent, {
      width: '550px',
      data: coupon ? { coupon } : null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadCoupons();
    });
  }

  toggleActive(coupon: Coupon): void {
    const newActive = !coupon.isActive;
    this.couponService.updateCoupon(coupon._id, { isActive: newActive }).subscribe({
      next: () => {
        coupon.isActive = newActive;
        this.toast.success(`Coupon ${newActive ? 'activated' : 'deactivated'}`);
      },
      error: () => this.toast.error('Failed to update coupon'),
    });
  }

  deleteCoupon(coupon: Coupon): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Coupon', message: `Delete coupon "${coupon.code}"? This cannot be undone.`, confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.couponService.deleteCoupon(coupon._id).subscribe({
        next: () => {
          this.toast.success('Coupon deleted');
          this.allCoupons.update(list => list.filter(c => c._id !== coupon._id));
          this.applyFilters();
        },
        error: () => this.toast.error('Failed to delete coupon'),
      });
    });
  }

  private applyFilters(): void {
    let data = [...this.allCoupons()];
    const search = this.searchTerm();
    const type = this.typeFilter();

    if (search) data = data.filter(c => c.code.toLowerCase().includes(search));
    if (type) data = data.filter(c => c.discountType === type);

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

    this.filteredCoupons.set(data);
    if (this.currentPage() >= this.totalPages()) this.currentPage.set(0);
  }

  private loadCoupons(): void {
    this.loading.set(true);
    this.couponService.getCoupons().subscribe({
      next: (res) => {
        const coupons = res.data ?? (res as unknown as Coupon[]);
        this.allCoupons.set(Array.isArray(coupons) ? coupons : []);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load coupons'); this.loading.set(false); },
    });
  }
}
