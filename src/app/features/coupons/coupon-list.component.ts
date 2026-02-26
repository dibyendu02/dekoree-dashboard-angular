import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe, PercentPipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { CouponService } from '../../core/services/coupon.service';
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
  template: `
    <app-page-header title="Coupons" subtitle="Manage discount coupons">
      <button class="btn btn-primary" (click)="openForm()">
        <span class="material-icons text-lg">add</span> Create Coupon
      </button>
    </app-page-header>

    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1">
          <app-search-input placeholder="Search coupons..." (searchChange)="onSearch($event)" />
        </div>
        <select class="filter-select w-40" (change)="onTypeFilter($any($event.target).value)">
          <option value="">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="6" />
    } @else if (filteredCoupons().length === 0 && allCoupons().length === 0) {
      <div class="card">
        <app-empty-state
          icon="local_offer"
          title="No coupons yet"
          message="Create your first coupon to offer discounts."
          actionText="Create Coupon"
          (action)="openForm()"
        />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="toggleSort('code')"
                    [class.sort-active]="sortField() === 'code'">
                  Code
                  <span class="material-icons sort-icon">{{ getSortIcon('code') }}</span>
                </th>
                <th>Type</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Uses</th>
                <th>Active</th>
                <th class="sortable" (click)="toggleSort('expiryDate')"
                    [class.sort-active]="sortField() === 'expiryDate'">
                  Expires
                  <span class="material-icons sort-icon">{{ getSortIcon('expiryDate') }}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (coupon of paginatedCoupons(); track coupon._id) {
                <tr>
                  <td>
                    <span class="text-sm font-mono font-bold" style="color: var(--color-primary)">
                      {{ coupon.code }}
                    </span>
                  </td>
                  <td>
                    <span class="chip bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      {{ coupon.discountType | titlecase }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm font-semibold" style="color: var(--color-text)">
                      @if (coupon.discountType === 'percentage') {
                        {{ coupon.discountValue }}%
                      } @else {
                        {{ coupon.discountValue | currencyInr }}
                      }
                    </span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-secondary)">
                      {{ coupon.minOrderAmount | currencyInr }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-secondary)">
                      {{ coupon.usedCount ?? 0 }} / {{ coupon.maxUses ?? '∞' }}
                    </span>
                  </td>
                  <td>
                    <label class="toggle-switch" (click)="$event.stopPropagation()">
                      <input type="checkbox"
                        [checked]="coupon.isActive"
                        (change)="toggleActive(coupon)"
                      />
                      <span class="toggle-track"></span>
                    </label>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-muted)">
                      {{ coupon.expiryDate | date:'mediumDate' }}
                    </span>
                  </td>
                  <td>
                    <div class="relative">
                      <button class="btn-icon" (click)="toggleMenu(coupon._id)">
                        <span class="material-icons">more_vert</span>
                      </button>
                      @if (openMenuId() === coupon._id) {
                        <div class="dropdown-menu">
                          <button (click)="openForm(coupon); closeMenu()">
                            <span class="material-icons text-lg">edit</span> Edit
                          </button>
                          <hr />
                          <button class="text-red-500" (click)="deleteCoupon(coupon); closeMenu()">
                            <span class="material-icons text-lg">delete</span> Delete
                          </button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="8" class="text-center py-8 text-sm" style="color: var(--color-text-muted)">
                    No matching coupons
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <div class="flex items-center gap-3">
            <span>Rows per page:</span>
            <select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); currentPage.set(0)">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
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
export class CouponListComponent implements OnInit {
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

  ngOnInit(): void { this.loadCoupons(); }

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
