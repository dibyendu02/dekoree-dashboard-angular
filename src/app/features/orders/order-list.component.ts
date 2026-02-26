import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
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
import { DialogService } from '../../shared/services/dialog.service';
import { Order, OrderStatus } from '../../core/models';
import { OrderDetailComponent } from './order-detail.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    DatePipe,
    TitleCasePipe,
    PageHeaderComponent,
    SearchInputComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
    RelativeTimePipe,
  ],
  template: `
    <app-page-header title="Orders" subtitle="Track and manage customer orders" />

    <!-- Filters -->
    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1">
          <app-search-input
            placeholder="Search by order number..."
            (searchChange)="onSearch($event)"
          />
        </div>
        <select class="filter-select w-48" (change)="onStatusFilter($any($event.target).value)">
          <option value="">All Statuses</option>
          @for (status of orderStatuses; track status) {
            <option [value]="status">{{ status | titlecase }}</option>
          }
        </select>
        <select class="filter-select w-44" (change)="onPaymentFilter($any($event.target).value)">
          <option value="">All Payments</option>
          <option value="Online">Online</option>
          <option value="COD">COD</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (filteredOrders().length === 0 && allOrders().length === 0) {
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
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="toggleSort('orderNumber')"
                    [class.sort-active]="sortField() === 'orderNumber'">
                  Order #
                  <span class="material-icons sort-icon">{{ getSortIcon('orderNumber') }}</span>
                </th>
                <th>Customer</th>
                <th class="sortable" (click)="toggleSort('totalAmount')"
                    [class.sort-active]="sortField() === 'totalAmount'">
                  Amount
                  <span class="material-icons sort-icon">{{ getSortIcon('totalAmount') }}</span>
                </th>
                <th>Status</th>
                <th>Payment</th>
                <th class="sortable" (click)="toggleSort('createdAt')"
                    [class.sort-active]="sortField() === 'createdAt'">
                  Date
                  <span class="material-icons sort-icon">{{ getSortIcon('createdAt') }}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (order of paginatedOrders(); track order._id) {
                <tr class="cursor-pointer" (click)="viewOrder(order)">
                  <td>
                    <span class="text-sm font-medium" style="color: var(--color-text)">
                      #{{ order.orderNumber ?? order._id.slice(-6) }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-secondary)">
                      {{ getCustomerName(order) }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm font-semibold" style="color: var(--color-text)">
                      {{ order.totalAmount | currencyInr }}
                    </span>
                  </td>
                  <td>
                    <app-status-badge [status]="order.status ?? 'pending'" />
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-secondary)">
                      {{ order.paymentMethod ?? '-' }}
                    </span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-muted)">
                      {{ order.createdAt | relativeTime }}
                    </span>
                  </td>
                  <td>
                    <div class="relative" (click)="$event.stopPropagation()">
                      <button class="btn-icon" (click)="toggleMenu(order._id)">
                        <span class="material-icons">more_vert</span>
                      </button>
                      @if (openMenuId() === order._id) {
                        <div class="dropdown-menu">
                          <button (click)="viewOrder(order); closeMenu()">
                            <span class="material-icons text-lg">visibility</span> View Details
                          </button>
                          @if (order.status === 'pending') {
                            <hr />
                            <button class="text-red-500" (click)="deleteOrder(order); closeMenu()">
                              <span class="material-icons text-lg">delete</span> Delete
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="text-center py-8 text-sm" style="color: var(--color-text-muted)">
                    No matching orders
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
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly allOrders = signal<Order[]>([]);
  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly paymentFilter = signal('');
  readonly sortField = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly openMenuId = signal<string | null>(null);
  readonly orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'rto_initiated', 'rto_delivered'];

  readonly filteredOrders = signal<Order[]>([]);

  ngOnInit(): void {
    this.loadOrders();
  }

  getCustomerName(order: Order): string {
    const user = order.user;
    if (!user || typeof user === 'string') return '-';
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '-';
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim().toLowerCase());
    this.applyFilters();
  }

  onStatusFilter(status: string): void {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onPaymentFilter(method: string): void {
    this.paymentFilter.set(method);
    this.applyFilters();
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  paginatedOrders(): Order[] {
    const start = this.currentPage() * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders().length / this.pageSize()));
  }

  paginationLabel(): string {
    const total = this.filteredOrders().length;
    const start = this.currentPage() * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return total ? `${start}–${end} of ${total}` : '0 of 0';
  }

  viewOrder(order: Order): void {
    const ref = this.dialog.open(OrderDetailComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: { order },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadOrders();
    });
  }

  deleteOrder(order: Order): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Order',
        message: `Delete order #${order.orderNumber ?? order._id.slice(-6)}? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.orderService.deleteOrder(order._id).subscribe({
        next: () => {
          this.toast.success('Order deleted');
          this.allOrders.update(orders => orders.filter(o => o._id !== order._id));
          this.applyFilters();
        },
        error: () => this.toast.error('Failed to delete order'),
      });
    });
  }

  private applyFilters(): void {
    let data = [...this.allOrders()];
    const search = this.searchTerm();
    const status = this.statusFilter();
    const payment = this.paymentFilter();

    if (search) {
      data = data.filter(o =>
        (o.orderNumber ?? o._id).toLowerCase().includes(search) ||
        this.getCustomerName(o).toLowerCase().includes(search)
      );
    }
    if (status) {
      data = data.filter(o => o.status === status);
    }
    if (payment) {
      data = data.filter(o => o.paymentMethod === payment);
    }

    // Sort
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

    this.filteredOrders.set(data);
    if (this.currentPage() >= this.totalPages()) {
      this.currentPage.set(0);
    }
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.orderService.getOrders({ limit: 200 }).subscribe({
      next: (res) => {
        const orders = res.data ?? (res as unknown as Order[]);
        this.allOrders.set(Array.isArray(orders) ? orders : []);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load orders');
        this.loading.set(false);
      },
    });
  }
}
