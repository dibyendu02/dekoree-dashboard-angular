import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Product, PaginationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(params?: PaginationParams): Observable<ApiResponse<Product[]>> {
    return this.api.get('/product', params as Record<string, unknown>);
  }

  getProduct(id: string): Observable<ApiResponse<Product>> {
    return this.api.get(`/product/${id}`);
  }

  createProduct(formData: FormData): Observable<ApiResponse<Product>> {
    return this.api.postFormData('/product', formData);
  }

  updateProduct(id: string, formData: FormData): Observable<ApiResponse<Product>> {
    return this.api.putFormData(`/product/${id}`, formData);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/product/${id}`);
  }

  updateStock(id: string, stock: number): Observable<ApiResponse<Product>> {
    return this.api.put(`/product/${id}/stock`, { stock });
  }

  toggleStatus(id: string): Observable<ApiResponse<Product>> {
    return this.api.put(`/product/${id}/toggle-status`, {});
  }

  toggleFeatured(id: string): Observable<ApiResponse<Product>> {
    return this.api.put(`/product/${id}/toggle-featured`, {});
  }

  getStats(): Observable<ApiResponse<unknown>> {
    return this.api.get('/product/stats');
  }

  getLowStock(): Observable<ApiResponse<Product[]>> {
    return this.api.get('/product/low-stock');
  }

  bulkUpdate(ids: string[], data: Partial<Product>): Observable<ApiResponse<void>> {
    return this.api.put('/product/bulk-update', { ids, ...data });
  }

  bulkDelete(ids: string[]): Observable<ApiResponse<void>> {
    return this.api.delete('/product/bulk-delete', { ids });
  }

  importProducts(file: FormData): Observable<ApiResponse<void>> {
    return this.api.postFormData('/product/import', file);
  }

  exportProducts(): Observable<Blob> {
    return this.api.get('/product/export');
  }

  duplicateProduct(id: string): Observable<ApiResponse<Product>> {
    return this.api.post(`/product/${id}/duplicate`, {});
  }
}
