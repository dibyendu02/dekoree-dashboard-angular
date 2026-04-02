import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list.component').then(
            (m) => m.UserListComponent,
          ),
      },

      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/coupons/coupon-list.component').then(
            (m) => m.CouponListComponent,
          ),
      },

      {
        path: 'banners',
        loadComponent: () =>
          import('./features/banners/banner-list.component').then(
            (m) => m.BannerListComponent,
          ),
      },

      {
        path: 'attributes',
        loadComponent: () =>
          import('./features/product-attributes/product-attributes.component').then(
            (m) => m.ProductAttributesComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
