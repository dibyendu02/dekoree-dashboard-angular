import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { Coupon } from '../../core/models';
import { CouponFormComponent } from './coupon-form.component';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatMenuModule, MatDialogModule, MatSlideToggleModule, MatSelectModule,
    PageHeaderComponent, SearchInputComponent, StatusBadgeComponent,
    SkeletonLoaderComponent, EmptyStateComponent,
  ],
  template: `
    <app-page-header title="Coupons" subtitle="Manage discount coupons">
      <button mat-flat-button color="primary" (click)="openForm()">
        <span class="material-icons text-lg mr-1">add</span> Add Coupon
      </button>
    </app-page-header>

    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <app-search-input placeholder="Search coupons..." (searchChange)="onSearch($event)" />
        </div>
        <mat-form-field appearance="outline" class="!w-40">
          <mat-label>Status</mat-label>
          <mat-select (selectionChange)="onStatusFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="active">Active</mat-option>
            <mat-option value="inactive">Inactive</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="!w-44">
          <mat-label>Type</mat-label>
          <mat-select (selectionChange)="onTypeFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="percentage">Percentage</mat-option>
            <mat-option value="fixed">Fixed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="6" />
    } @else if (dataSource.data.length === 0) {
      <div class="card">
        <app-empty-state icon="local_offer" title="No coupons found" message="Create your first coupon to offer discounts." actionText="Add Coupon" (action)="openForm()" />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Code</th>
              <td mat-cell *matCellDef="let c">
                <span class="text-sm font-mono font-bold" style="color: var(--color-primary)">{{ c.code }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="discount">
              <th mat-header-cell *matHeaderCellDef>Discount</th>
              <td mat-cell *matCellDef="let c">
                <span class="text-sm font-semibold" style="color: var(--color-text)">
                  {{ c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="validity">
              <th mat-header-cell *matHeaderCellDef>Valid Until</th>
              <td mat-cell *matCellDef="let c">
                <span class="text-sm" style="color: var(--color-text-secondary)">
                  {{ c.endDate | date:'mediumDate' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="usage">
              <th mat-header-cell *matHeaderCellDef>Usage</th>
              <td mat-cell *matCellDef="let c">
                <span class="text-sm" style="color: var(--color-text-secondary)">
                  {{ c.usedCount ?? 0 }}/{{ c.usageLimit ?? '∞' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let c">
                <mat-slide-toggle [checked]="c.isActive" (change)="toggleCoupon(c)" color="primary"></mat-slide-toggle>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <span class="material-icons">more_vert</span>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="openForm(c)">
                    <span class="material-icons mr-2">edit</span> Edit
                  </button>
                  <hr style="border-color: var(--color-border)" />
                  <button mat-menu-item (click)="deleteCoupon(c)" class="!text-red-500">
                    <span class="material-icons mr-2">delete</span> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25]" [pageSize]="10" showFirstLastButtons></mat-paginator>
      </div>
    }
  `,
})
export class CouponListComponent implements OnInit {
  private readonly couponService = inject(CouponService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly displayedColumns = ['code', 'discount', 'validity', 'usage', 'status', 'actions'];
  dataSource = new MatTableDataSource<Coupon>([]);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }
  @ViewChild(MatSort) set sort(s: MatSort) { if (s) this.dataSource.sort = s; }

  ngOnInit(): void { this.loadCoupons(); }

  onSearch(term: string): void { this.dataSource.filter = term.trim().toLowerCase(); }

  onStatusFilter(status: string): void {
    if (!status) { this.dataSource.filter = ''; return; }
    this.dataSource.filterPredicate = (data) => (status === 'active') === (data.isActive !== false);
    this.dataSource.filter = status;
  }

  onTypeFilter(type: string): void {
    if (!type) { this.dataSource.filter = ''; return; }
    this.dataSource.filterPredicate = (data) => data.discountType === type;
    this.dataSource.filter = type;
  }

  openForm(coupon?: Coupon): void {
    const ref = this.dialog.open(CouponFormComponent, { width: '700px', maxHeight: '90vh', data: { coupon } });
    ref.afterClosed().subscribe(result => { if (result) this.loadCoupons(); });
  }

  toggleCoupon(coupon: Coupon): void {
    this.couponService.toggleCoupon(coupon._id).subscribe({
      next: () => { coupon.isActive = !coupon.isActive; this.toast.success(`Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`); },
      error: () => this.toast.error('Failed to toggle coupon'),
    });
  }

  deleteCoupon(coupon: Coupon): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Coupon', message: `Delete coupon "${coupon.code}"?`, confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.couponService.deleteCoupon(coupon._id).subscribe({
        next: () => { this.toast.success('Coupon deleted'); this.dataSource.data = this.dataSource.data.filter(c => c._id !== coupon._id); },
        error: () => this.toast.error('Failed to delete coupon'),
      });
    });
  }

  private loadCoupons(): void {
    this.loading.set(true);
    this.couponService.getCoupons({ limit: 200 }).subscribe({
      next: (res) => {
        const coupons = res.data ?? (res as unknown as Coupon[]);
        this.dataSource.data = Array.isArray(coupons) ? coupons : [];
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load coupons'); this.loading.set(false); },
    });
  }
}
