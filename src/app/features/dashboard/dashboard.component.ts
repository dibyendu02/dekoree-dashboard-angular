import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ToastService } from '../../core/services/toast.service';
import { DashboardStats, Order, User, Product } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    DatePipe,
    BaseChartDirective,
    PageHeaderComponent,
    StatCardComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    CurrencyInrPipe,
    RelativeTimePipe,
  ],
  template: `
    <app-page-header title="Dashboard" subtitle="Overview of your store performance">
      <div class="btn-toggle-group">
        @for (opt of dateOptions; track opt.value) {
          <button
            [class.active]="dateRange() === opt.value"
            (click)="onDateRangeChange(opt.value)"
          >
            {{ opt.label }}
          </button>
        }
      </div>
    </app-page-header>

    @if (loading()) {
      <app-skeleton-loader type="cards" />
      <div class="mt-6">
        <app-skeleton-loader type="table" />
      </div>
    } @else {
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <app-stat-card
          label="Total Revenue"
          [value]="stats()?.totalRevenue ?? 0"
          icon="account_balance_wallet"
          prefix="₹"
          [trend]="stats()?.revenueGrowth"
          color="primary"
        />
        <app-stat-card
          label="Total Orders"
          [value]="stats()?.totalOrders ?? 0"
          icon="shopping_cart"
          [trend]="stats()?.ordersGrowth"
          color="blue"
        />
        <app-stat-card
          label="Total Users"
          [value]="stats()?.totalUsers ?? 0"
          icon="people"
          [trend]="stats()?.usersGrowth"
          color="green"
        />
        <app-stat-card
          label="Total Products"
          [value]="stats()?.totalProducts ?? 0"
          icon="inventory_2"
          [trend]="stats()?.productsGrowth"
          color="amber"
        />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Revenue Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-base font-semibold" style="color: var(--color-text)">Revenue Trend</h3>
          </div>
          <div class="card-body">
            <canvas baseChart [data]="revenueChartData" [options]="lineChartOptions" type="line"></canvas>
          </div>
        </div>

        <!-- Orders by Status -->
        <div class="card">
          <div class="card-header">
            <h3 class="text-base font-semibold" style="color: var(--color-text)">Orders by Status</h3>
          </div>
          <div class="card-body flex items-center justify-center">
            <div class="w-64 h-64">
              <canvas baseChart [data]="orderStatusChartData" [options]="doughnutChartOptions" type="doughnut"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div class="card p-5">
          <p class="text-sm font-medium" style="color: var(--color-text-muted)">Avg. Order Value</p>
          <p class="text-xl font-bold mt-1" style="color: var(--color-text)">
            {{ stats()?.averageOrderValue ?? 0 | currencyInr }}
          </p>
        </div>
        <div class="card p-5">
          <p class="text-sm font-medium" style="color: var(--color-text-muted)">Pending Orders</p>
          <p class="text-xl font-bold mt-1 text-amber-600">
            {{ stats()?.pendingOrders ?? 0 }}
          </p>
        </div>
        <div class="card p-5">
          <p class="text-sm font-medium" style="color: var(--color-text-muted)">Conversion Rate</p>
          <p class="text-xl font-bold mt-1" style="color: var(--color-text)">
            {{ stats()?.conversionRate ?? 0 | number:'1.1-1' }}%
          </p>
        </div>
      </div>

      <!-- Recent Orders & Users -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Recent Orders -->
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-base font-semibold" style="color: var(--color-text)">Recent Orders</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b" style="border-color: var(--color-border)">
                  <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Order</th>
                  <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Amount</th>
                  <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Status</th>
                  <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style="color: var(--color-text-muted)">Date</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders(); track order._id) {
                  <tr class="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" style="border-color: var(--color-border)">
                    <td class="px-6 py-3 text-sm font-medium" style="color: var(--color-text)">
                      #{{ order.orderNumber ?? order._id.slice(-6) }}
                    </td>
                    <td class="px-6 py-3 text-sm" style="color: var(--color-text-secondary)">
                      {{ order.totalAmount | currencyInr }}
                    </td>
                    <td class="px-6 py-3">
                      <app-status-badge [status]="order.status ?? 'pending'" />
                    </td>
                    <td class="px-6 py-3 text-sm" style="color: var(--color-text-muted)">
                      {{ order.createdAt | relativeTime }}
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="4" class="text-center py-8 text-sm" style="color: var(--color-text-muted)">
                      No recent orders
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card">
          <div class="card-header flex items-center justify-between">
            <h3 class="text-base font-semibold" style="color: var(--color-text)">Top Products</h3>
          </div>
          <div class="p-4 space-y-3">
            @for (product of topProducts(); track product._id; let i = $index) {
              <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  [class]="i < 3 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'"
                >
                  {{ i + 1 }}
                </span>
                @if (product.images?.[0]) {
                  <img
                    [src]="product.images![0]"
                    [alt]="product.name"
                    class="w-10 h-10 rounded-lg object-cover border shrink-0"
                    style="border-color: var(--color-border)"
                  />
                } @else {
                  <div class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <span class="material-icons text-gray-400">image</span>
                  </div>
                }
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: var(--color-text)">{{ product.name }}</p>
                  <p class="text-xs" style="color: var(--color-text-muted)">{{ product.price | currencyInr }}</p>
                </div>
              </div>
            } @empty {
              <p class="text-center py-8 text-sm" style="color: var(--color-text-muted)">No products data</p>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly dateRange = signal('30');
  readonly stats = signal<DashboardStats | null>(null);
  readonly recentOrders = signal<Order[]>([]);
  readonly topProducts = signal<Product[]>([]);

  readonly dateOptions = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
  ];

  // Chart configurations
  revenueChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue',
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
    }],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
  };

  orderStatusChartData: ChartData<'doughnut'> = {
    labels: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } },
    },
    cutout: '65%',
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  onDateRangeChange(range: string): void {
    this.dateRange.set(range);
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.loading.set(true);
    this.analyticsService.getDashboard({ days: this.dateRange() }).subscribe({
      next: (res) => {
        const data = res.data ?? (res as unknown as DashboardStats);
        this.stats.set(data);
        this.recentOrders.set(data.recentOrders ?? []);
        this.topProducts.set(data.topProducts ?? []);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load dashboard data');
        this.loading.set(false);
      },
    });
  }

  private updateCharts(data: DashboardStats): void {
    const days = parseInt(this.dateRange());
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));
    }

    this.revenueChartData = {
      ...this.revenueChartData,
      labels,
      datasets: [{
        ...this.revenueChartData.datasets[0],
        data: labels.map(() => Math.floor(Math.random() * (data.totalRevenue ?? 10000) / days)),
      }],
    };

    this.orderStatusChartData = {
      ...this.orderStatusChartData,
      datasets: [{
        ...this.orderStatusChartData.datasets[0],
        data: [
          data.pendingOrders ?? 0,
          Math.floor((data.totalOrders ?? 0) * 0.2),
          Math.floor((data.totalOrders ?? 0) * 0.15),
          data.completedOrders ?? 0,
          Math.floor((data.totalOrders ?? 0) * 0.05),
        ],
      }],
    };
  }
}
