import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { ToastService } from '../services/toast.service';
import { User, LoginRequest, LoginResponse } from '../models';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly _token = signal<string | null>(localStorage.getItem('authToken'));
  private readonly _user = signal<User | null>(this.loadUser());
  private readonly _loading = signal(false);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  constructor() {
    if (environment.mockAuth && !this._token()) {
      this.bootstrapMockSession();
    }
  }

  async login(credentials: LoginRequest): Promise<boolean> {
    this._loading.set(true);
    try {
      if (environment.mockAuth) {
        return await this.mockLogin(credentials);
      }

      const response = await firstValueFrom(
        this.api.post<LoginResponse>('/user/login', credentials)
      );
      if (response?.token) {
        this._token.set(response.token);
        this._user.set(response.user);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userId', response.user?._id ?? response.user?.id ?? '');
        localStorage.setItem('user', JSON.stringify(response.user));
        return true;
      }
      this.toast.error('Invalid credentials');
      return false;
    } catch (err: unknown) {
      const message = this.extractError(err);
      this.toast.error(message);
      return false;
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private extractError(err: unknown): string {
    const e = err as { error?: { message?: string; error?: string }; message?: string };
    return e?.error?.message ?? e?.error?.error ?? e?.message ?? 'Login failed';
  }

  private async mockLogin(credentials: LoginRequest): Promise<boolean> {
    const identifier = credentials.identifier?.trim();
    const password = credentials.password?.trim();

    if (!identifier || !password) {
      this.toast.error('Email/phone and password are required');
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const user: User = {
      ...this.defaultMockUser(),
      email: identifier.includes('@') ? identifier : 'admin@dekoree.com',
      phone: identifier.includes('@') ? undefined : identifier,
    };
    this.setSession('mock-auth-token', user);

    return true;
  }

  private bootstrapMockSession(): void {
    this.setSession('mock-auth-token', this.defaultMockUser());
  }

  private defaultMockUser(): User {
    return {
      _id: 'mock-admin-id',
      id: 'mock-admin-id',
      firstName: 'Mock',
      lastName: 'Admin',
      email: 'admin@dekoree.com',
      isAdmin: true,
      isActive: true,
    };
  }

  private setSession(token: string, user: User): void {
    this._token.set(token);
    this._user.set(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user._id ?? user.id ?? '');
    localStorage.setItem('user', JSON.stringify(user));
  }
}
