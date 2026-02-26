import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, DashboardStats, SalesAnalytics } from '../models';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly api = inject(ApiService);

  getDashboard(params?: Record<string, unknown>): Observable<ApiResponse<DashboardStats>> {
    return this.api.get('/analytics/dashboard', params);
  }

  getSales(params?: Record<string, unknown>): Observable<ApiResponse<SalesAnalytics>> {
    return this.api.get('/analytics/sales', params);
  }

  getUserAnalytics(params?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.get('/analytics/users', params);
  }

  getProductAnalytics(params?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.get('/analytics/products', params);
  }

  getMarketingAnalytics(params?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.get('/analytics/marketing', params);
  }

  getFinancialAnalytics(params?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.get('/analytics/financial', params);
  }

  getOperationalAnalytics(params?: Record<string, unknown>): Observable<ApiResponse<unknown>> {
    return this.api.get('/analytics/operational', params);
  }
}
