import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Category, ColorOption, ProductType, PlantType } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductAttributesService {
  private readonly api = inject(ApiService);

  // Categories
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.api.get('/category');
  }

  createCategory(formData: FormData): Observable<ApiResponse<Category>> {
    return this.api.postFormData('/category', formData);
  }

  deleteCategory(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/category/${id}`);
  }

  // Colors
  getColors(): Observable<ApiResponse<ColorOption[]>> {
    return this.api.get('/color');
  }

  createColor(name: string): Observable<ApiResponse<ColorOption>> {
    return this.api.post('/color', { name });
  }

  deleteColor(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/color/${id}`);
  }

  // Product Types
  getProductTypes(): Observable<ApiResponse<ProductType[]>> {
    return this.api.get('/product-type');
  }

  createProductType(name: string): Observable<ApiResponse<ProductType>> {
    return this.api.post('/product-type', { name });
  }

  deleteProductType(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/product-type/${id}`);
  }

  // Plant Types
  getPlantTypes(): Observable<ApiResponse<PlantType[]>> {
    return this.api.get('/plant-type');
  }

  createPlantType(name: string): Observable<ApiResponse<PlantType>> {
    return this.api.post('/plant-type', { name });
  }

  deletePlantType(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/plant-type/${id}`);
  }
}
