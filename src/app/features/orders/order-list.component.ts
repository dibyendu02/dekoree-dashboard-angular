import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { ChatContextService } from '../../core/services/chat-context.service';
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
  templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit, OnDestroy {
  private readonly chatContext = inject(ChatContextService);
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
    this.chatContext.set({
      page: 'orders',
      breadcrumbs: ['Orders'],
      metadata: {
        description: 'Customer order management and fulfilment tracking',
        features: ['order list', 'status filters', 'payment status', 'fulfilment'],
      },
    });
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
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
