import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Banner, PaginationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class BannerService {
  private readonly api = inject(ApiService);

  getBanners(params?: PaginationParams): Observable<ApiResponse<Banner[]>> {
    return this.api.get('/banner', params as Record<string, unknown>);
  }

  getBanner(id: string): Observable<ApiResponse<Banner>> {
    return this.api.get(`/banner/${id}`);
  }

  createBanner(formData: FormData): Observable<ApiResponse<Banner>> {
    return this.api.postFormData('/banner', formData);
  }

  updateBanner(id: string, formData: FormData): Observable<ApiResponse<Banner>> {
    return this.api.putFormData(`/banner/${id}`, formData);
  }

  toggleBanner(id: string): Observable<ApiResponse<void>> {
    return this.api.patch(`/banner/${id}/toggle`);
  }

  deleteBanner(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/banner/${id}`);
  }

  getAnalytics(id: string): Observable<ApiResponse<unknown>> {
    return this.api.get(`/banner/${id}/analytics`);
  }

  getStats(): Observable<ApiResponse<unknown>> {
    return this.api.get('/banner/stats');
  }
}
