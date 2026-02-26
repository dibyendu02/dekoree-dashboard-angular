import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Order, PaginationParams, ShipmentRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  getOrders(params?: PaginationParams): Observable<ApiResponse<Order[]>> {
    return this.api.get('/order', params as Record<string, unknown>);
  }

  getOrder(id: string): Observable<ApiResponse<Order>> {
    return this.api.get(`/order/${id}`);
  }

  updateOrder(id: string, data: Partial<Order>): Observable<ApiResponse<Order>> {
    return this.api.put(`/order/${id}`, data);
  }

  cancelOrder(id: string): Observable<ApiResponse<void>> {
    return this.api.post(`/order/${id}/cancel`, {});
  }

  createShipment(id: string, data: ShipmentRequest): Observable<ApiResponse<unknown>> {
    return this.api.post(`/order/${id}/shipment`, data);
  }

  processRefund(id: string, data: { amount: number; reason: string }): Observable<ApiResponse<unknown>> {
    return this.api.post(`/order/${id}/refund`, data);
  }

  getRefundStatus(id: string): Observable<ApiResponse<unknown>> {
    return this.api.get(`/order/${id}/refund/status`);
  }

  trackShipment(id: string): Observable<ApiResponse<unknown>> {
    return this.api.get(`/order/${id}/track`);
  }

  deleteOrder(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/order/${id}`);
  }

  getStats(): Observable<ApiResponse<unknown>> {
    return this.api.get('/order/stats');
  }

  bulkUpdate(ids: string[], status: string): Observable<ApiResponse<void>> {
    return this.api.put('/order/bulk-update', { ids, status });
  }

  exportOrders(): Observable<Blob> {
    return this.api.get('/order/export');
  }
}
