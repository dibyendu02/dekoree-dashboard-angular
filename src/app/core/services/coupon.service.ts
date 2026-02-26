import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Coupon, PaginationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = inject(ApiService);

  getCoupons(params?: PaginationParams): Observable<ApiResponse<Coupon[]>> {
    return this.api.get('/coupon', params as Record<string, unknown>);
  }

  getCoupon(id: string): Observable<ApiResponse<Coupon>> {
    return this.api.get(`/coupon/${id}`);
  }

  createCoupon(data: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.api.post('/coupon', data);
  }

  updateCoupon(id: string, data: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.api.put(`/coupon/${id}`, data);
  }

  toggleCoupon(id: string): Observable<ApiResponse<void>> {
    return this.api.patch(`/coupon/${id}/toggle`);
  }

  deleteCoupon(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/coupon/${id}`);
  }

  getAnalytics(id: string): Observable<ApiResponse<unknown>> {
    return this.api.get(`/coupon/${id}/analytics`);
  }

  getStats(): Observable<ApiResponse<unknown>> {
    return this.api.get('/coupon/stats');
  }

  bulkDelete(ids: string[]): Observable<ApiResponse<void>> {
    return this.api.delete('/coupon/bulk-delete', { ids });
  }
}
