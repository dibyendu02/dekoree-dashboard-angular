import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, OrderStatus } from '../../core/models';
import { OrderDetailComponent } from './order-detail.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    TitleCasePipe,
    CurrencyInrPipe,
    RelativeTimePipe,
  ],
  template: `
    <app-page-header title="Orders" subtitle="Track and manage customer orders" />

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <app-search-input
            placeholder="Search by order number..."
            (searchChange)="onSearch($event)"
          />
        </div>
        <mat-form-field appearance="outline" class="!w-48">
          <mat-label>Status</mat-label>
          <mat-select (selectionChange)="onStatusFilter($event.value)">
            <mat-option value="">All Statuses</mat-option>
            @for (status of orderStatuses; track status) {
              <mat-option [value]="status">{{ status | titlecase }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="!w-44">
          <mat-label>Payment</mat-label>
          <mat-select (selectionChange)="onPaymentFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="Online">Online</mat-option>
            <mat-option value="COD">COD</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (dataSource.data.length === 0) {
      <div class="card">
        <app-empty-state
          icon="local_shipping"
          title="No orders found"
          message="Orders will appear here when customers place them."
        />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="orderNumber">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Order #</th>
              <td mat-cell *matCellDef="let order">
                <span class="text-sm font-medium" style="color: var(--color-text)">
                  #{{ order.orderNumber ?? order._id.slice(-6) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="customer">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let order">
                <span class="text-sm" style="color: var(--color-text-secondary)">
                  {{ getCustomerName(order) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="totalAmount">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Amount</th>
              <td mat-cell *matCellDef="let order">
                <span class="text-sm font-semibold" style="color: var(--color-text)">
                  {{ order.totalAmount | currencyInr }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let order">
                <app-status-badge [status]="order.status ?? 'pending'" />
              </td>
            </ng-container>

            <ng-container matColumnDef="paymentMethod">
              <th mat-header-cell *matHeaderCellDef>Payment</th>
              <td mat-cell *matCellDef="let order">
                <span class="text-sm" style="color: var(--color-text-secondary)">
                  {{ order.paymentMethod ?? '-' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let order">
                <span class="text-sm" style="color: var(--color-text-muted)">
                  {{ order.createdAt | relativeTime }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let order">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <span class="material-icons">more_vert</span>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewOrder(order)">
                    <span class="material-icons mr-2">visibility</span> View Details
                  </button>
                  @if (order.status === 'pending') {
                    <hr style="border-color: var(--color-border)" />
                    <button mat-menu-item (click)="deleteOrder(order)" class="!text-red-500">
                      <span class="material-icons mr-2">delete</span> Delete
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" class="cursor-pointer" (click)="viewOrder(row)"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="10" showFirstLastButtons></mat-paginator>
      </div>
    }
  `,
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly displayedColumns = ['orderNumber', 'customer', 'totalAmount', 'status', 'paymentMethod', 'createdAt', 'actions'];
  readonly orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'rto_initiated', 'rto_delivered'];

  dataSource = new MatTableDataSource<Order>([]);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }
  @ViewChild(MatSort) set sort(s: MatSort) { if (s) this.dataSource.sort = s; }

  ngOnInit(): void {
    this.loadOrders();
  }

  getCustomerName(order: Order): string {
    const user = order.user;
    if (!user || typeof user === 'string') return '-';
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '-';
  }

  onSearch(term: string): void {
    this.dataSource.filter = term.trim().toLowerCase();
  }

  onStatusFilter(status: string): void {
    if (!status) { this.dataSource.filter = ''; return; }
    this.dataSource.filterPredicate = (data) => data.status === status;
    this.dataSource.filter = status;
  }

  onPaymentFilter(method: string): void {
    if (!method) { this.dataSource.filter = ''; return; }
    this.dataSource.filterPredicate = (data) => data.paymentMethod === method;
    this.dataSource.filter = method;
  }

  viewOrder(order: Order): void {
    const dialogRef = this.dialog.open(OrderDetailComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { order },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadOrders();
    });
  }

  deleteOrder(order: Order): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Order',
        message: `Delete order #${order.orderNumber ?? order._id.slice(-6)}? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.orderService.deleteOrder(order._id).subscribe({
        next: () => {
          this.toast.success('Order deleted');
          this.dataSource.data = this.dataSource.data.filter(o => o._id !== order._id);
        },
        error: () => this.toast.error('Failed to delete order'),
      });
    });
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders({ limit: 200 }).subscribe({
      next: (res) => {
        const orders = res.data ?? (res as unknown as Order[]);
        this.dataSource.data = Array.isArray(orders) ? orders : [];
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load orders');
        this.loading.set(false);
      },
    });
  }
}
