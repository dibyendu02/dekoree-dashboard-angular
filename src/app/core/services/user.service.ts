import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User, PaginationParams } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getUsers(params?: PaginationParams): Observable<ApiResponse<User[]>> {
    return this.api.get('/user', params as Record<string, unknown>);
  }

  getUser(id: string): Observable<ApiResponse<User>> {
    return this.api.get(`/user/profile/${id}`);
  }

  updateUser(id: string, data: Partial<User>): Observable<ApiResponse<User>> {
    return this.api.put(`/user/profile/${id}`, data);
  }

  toggleStatus(id: string): Observable<ApiResponse<void>> {
    return this.api.patch(`/user/${id}/toggle-status`);
  }

  makeAdmin(id: string): Observable<ApiResponse<void>> {
    return this.api.patch(`/user/${id}/make-admin`);
  }

  removeAdmin(id: string): Observable<ApiResponse<void>> {
    return this.api.patch(`/user/${id}/remove-admin`);
  }

  deleteUser(id: string): Observable<ApiResponse<void>> {
    return this.api.delete(`/user/${id}`);
  }

  getStats(): Observable<ApiResponse<unknown>> {
    return this.api.get('/user/stats');
  }

  getActivity(id: string): Observable<ApiResponse<unknown>> {
    return this.api.get(`/user/${id}/activity`);
  }

  bulkUpdateStatus(ids: string[], isActive: boolean): Observable<ApiResponse<void>> {
    return this.api.put('/user/bulk-update-status', { ids, isActive });
  }

  exportUsers(): Observable<Blob> {
    return this.api.get('/user/export');
  }
}
