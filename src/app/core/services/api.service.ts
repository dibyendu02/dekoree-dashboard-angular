import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import * as MockData from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  private readonly useMockAsFallback = true; // Hardcoded for now, can be environment-based

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http
      .get<T>(`${this.baseUrl}${path}`, { params: httpParams })
      .pipe(catchError((error) => this.handleError<T>(path, 'GET', error)));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError((error) => this.handleError<T>(path, 'POST', error)));
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, formData)
      .pipe(catchError((error) => this.handleError<T>(path, 'POST', error)));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError((error) => this.handleError<T>(path, 'PUT', error)));
  }

  putFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, formData)
      .pipe(catchError((error) => this.handleError<T>(path, 'PUT', error)));
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${path}`, body ?? {})
      .pipe(catchError((error) => this.handleError<T>(path, 'PATCH', error)));
  }

  delete<T>(path: string, body?: unknown): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${path}`, { body })
      .pipe(catchError((error) => this.handleError<T>(path, 'DELETE', error)));
  }

  private handleError<T>(path: string, method: string, error: any): Observable<T> {
    if (this.useMockAsFallback) {
      console.warn(`API call failed for ${method} ${path}, returning mock data. Error:`, error);
      const mockResponse = this.getMockData(path, method);
      if (mockResponse !== undefined) {
        return of({
          success: true,
          data: mockResponse,
          message: 'Mock data (API fallback)',
        } as unknown as T);
      }
    }
    return throwError(() => error);
  }

  private getMockData(path: string, method: string): any {
    // Exact matches
    const exactMatches: Record<string, any> = {
      '/analytics/dashboard': MockData.MOCK_DASHBOARD_STATS,
      '/analytics/sales': MockData.MOCK_SALES_ANALYTICS,
      '/analytics/users': MockData.MOCK_USER_ANALYTICS,
      '/analytics/products': MockData.MOCK_PRODUCT_ANALYTICS,
      '/analytics/marketing': MockData.MOCK_GENERIC_STATS,
      '/analytics/financial': MockData.MOCK_GENERIC_STATS,
      '/analytics/operational': MockData.MOCK_GENERIC_STATS,
      '/product': MockData.MOCK_PRODUCTS,
      '/product/stats': MockData.MOCK_DASHBOARD_STATS,
      '/product/low-stock': MockData.MOCK_PRODUCTS.slice(0, 2),
      '/order': MockData.MOCK_ORDERS,
      '/order/stats': MockData.MOCK_DASHBOARD_STATS,
      '/user': MockData.MOCK_USERS,
      '/user/stats': MockData.MOCK_DASHBOARD_STATS,
      '/coupon': MockData.MOCK_COUPONS,
      '/banner': MockData.MOCK_BANNERS,
      '/color': MockData.MOCK_COLORS,
      '/product-type': MockData.MOCK_PRODUCT_TYPES,
      '/plant-type': MockData.MOCK_PLANT_TYPES,
      '/category': MockData.MOCK_CATEGORIES,
      '/product-attributes/colors': MockData.MOCK_COLORS,
      '/product-attributes/product-types': MockData.MOCK_PRODUCT_TYPES,
      '/product-attributes/plant-types': MockData.MOCK_PLANT_TYPES,
      '/product-attributes/categories': MockData.MOCK_CATEGORIES,
    };

    if (exactMatches[path]) return exactMatches[path];

    // Path patterns
    if (method === 'GET') {
      if (path.startsWith('/product/')) {
        const id = path.split('/')[2];
        return MockData.MOCK_PRODUCTS.find((p) => p._id === id) || MockData.MOCK_PRODUCTS[0];
      }
      if (path.startsWith('/order/')) {
        const id = path.split('/')[2];
        return MockData.MOCK_ORDERS.find((o) => o._id === id) || MockData.MOCK_ORDERS[0];
      }
      if (path.startsWith('/user/profile/')) {
        const id = path.split('/')[3];
        return MockData.MOCK_USERS.find((u) => u._id === id) || MockData.MOCK_USERS[0];
      }
      if (path.startsWith('/user/')) {
        const id = path.split('/')[2];
        return MockData.MOCK_USERS.find((u) => u._id === id) || MockData.MOCK_USERS[0];
      }
      if (path.startsWith('/coupon/')) {
        const id = path.split('/')[2];
        return MockData.MOCK_COUPONS.find((c) => c._id === id) || MockData.MOCK_COUPONS[0];
      }
      if (path.startsWith('/banner/')) {
        const id = path.split('/')[2];
        return MockData.MOCK_BANNERS.find((b) => b._id === id) || MockData.MOCK_BANNERS[0];
      }
    }

    // Default for mutations
    if (method !== 'GET') {
      return { message: 'Action simulated with mock data' };
    }

    return undefined;
  }
}
