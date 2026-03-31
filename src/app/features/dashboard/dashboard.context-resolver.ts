import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ChatContext } from '../../core/models/chat-context.model';

/**
 * Fetches live dashboard stats before the route activates and shapes
 * them into a ChatContext so the AI receives the actual numbers
 * (revenue, orders, users, products) visible on screen.
 *
 * Falls back to a minimal static context if the API call fails.
 */
export const dashboardChatContextResolver: ResolveFn<ChatContext> = () => {
  const analytics = inject(AnalyticsService);

  return analytics.getDashboard().pipe(
    map((res): ChatContext => {
      const s = res.data;
      return {
        page: 'dashboard',
        breadcrumbs: ['Dashboard'],
        metadata: {
          description: 'Analytics and KPI overview',
          // ── Live numbers the AI can reason about ──────────────
          totalRevenue: s?.totalRevenue,
          totalOrders: s?.totalOrders,
          totalUsers: s?.totalUsers,
          totalProducts: s?.totalProducts,
          revenueGrowth: s?.revenueGrowth,
          ordersGrowth: s?.ordersGrowth,
          averageOrderValue: s?.averageOrderValue,
          pendingOrders: s?.pendingOrders,
          completedOrders: s?.completedOrders,
          conversionRate: s?.conversionRate,
          alerts: s?.alerts ?? [],
          // top products (names + prices only — keep payload lean)
          topProducts: s?.topProducts?.map(p => ({
            name: (p as any).name,
            price: (p as any).price,
            stock: (p as any).stock,
          })),
        },
      };
    }),
    catchError(() =>
      of<ChatContext>({
        page: 'dashboard',
        breadcrumbs: ['Dashboard'],
        metadata: { description: 'Analytics and KPI overview' },
      }),
    ),
  );
};
