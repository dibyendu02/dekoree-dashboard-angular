/**
 * Base resolver type and helpers for route-level chat context.
 *
 * Two patterns are supported — pick whichever fits the route:
 *
 * ① Static route data (no async fetch needed):
 *   ─────────────────────────────────────────────
 *   Add a `chatContext` key directly to the route's `data` object.
 *   The LayoutComponent reads it from ActivatedRoute on NavigationEnd.
 *
 *   Example:
 *     {
 *       path: 'dashboard',
 *       loadComponent: () => import(…),
 *       data: {
 *         chatContext: {
 *           page: 'dashboard',
 *           breadcrumbs: ['Dashboard'],
 *           metadata: { features: ['analytics', 'charts'] },
 *         } satisfies ChatContext,
 *       },
 *     }
 *
 * ② Dynamic resolver (needs HTTP data before context is known):
 *   ─────────────────────────────────────────────────────────────
 *   Implement `ResolveFn<ChatContext>` and attach it via `resolve`.
 *
 *   Example:
 *     {
 *       path: 'orders/:id',
 *       loadComponent: () => import(…),
 *       resolve: { chatContext: orderDetailChatContextResolver },
 *     }
 *
 * In both cases the resolved value lands in
 *   `activatedRoute.snapshot.data['chatContext']`
 * which LayoutComponent reads automatically.
 */

import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ChatContext } from '../models/chat-context.model';
import { OrderService } from '../services/order.service';

// ─── Example: Dynamic resolver for the Order detail page ──────────────────────
//
// Shows how to fetch real data and shape it into a lean ChatContext.
// The resolver only exposes metadata, NOT the full order object —
// keeping the payload the RAG backend receives small and focused.

export const orderDetailChatContextResolver: ResolveFn<ChatContext> = (
  route: ActivatedRouteSnapshot,
): Observable<ChatContext> => {
  const orderService = inject(OrderService);
  const orderId = route.paramMap.get('id') ?? '';

  return orderService.getOrder(orderId).pipe(
    map((order): ChatContext => ({
      page: 'order-detail',
      entityId: orderId,
      breadcrumbs: ['Orders', `#${orderId.slice(-6).toUpperCase()}`],
      metadata: {
        status: (order as any)?.data?.status,
        totalAmount: (order as any)?.data?.totalAmount,
        itemCount: (order as any)?.data?.items?.length,
        customerName: (order as any)?.data?.customerName,
      },
    })),
    catchError((): Observable<ChatContext> =>
      of({ page: 'order-detail', entityId: orderId, breadcrumbs: ['Orders', 'Detail'] }),
    ),
  );
};
