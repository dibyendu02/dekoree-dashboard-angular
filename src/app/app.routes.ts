import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { ChatContext } from './core/models/chat-context.model';

// ─── Chat Context definitions ──────────────────────────────────────
// Each route declares its context via `data.chatContext`.
// LayoutComponent reads this on every NavigationEnd and pushes the
// value into ChatContextService — no component coupling needed.
//
// For routes that need async data (e.g. order/:id), swap `data` for
// a `resolve` block using a ResolveFn<ChatContext>.
// See: src/app/core/resolvers/chat-context.resolver.ts

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
        data: {
          chatContext: {
            page: 'dashboard',
            breadcrumbs: ['Dashboard'],
            metadata: {
              description: 'Analytics and KPI overview',
              features: ['revenue chart', 'order trends', 'top products', 'recent orders'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list.component').then(
            (m) => m.ProductListComponent,
          ),
        data: {
          chatContext: {
            page: 'products',
            breadcrumbs: ['Products'],
            metadata: {
              description: 'Product catalogue with inventory management',
              features: ['product list', 'stock levels', 'categories', 'filters'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/order-list.component').then(
            (m) => m.OrderListComponent,
          ),
        data: {
          chatContext: {
            page: 'orders',
            breadcrumbs: ['Orders'],
            metadata: {
              description: 'Customer order management and fulfilment tracking',
              features: ['order list', 'status filters', 'payment status', 'fulfilment'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list.component').then(
            (m) => m.UserListComponent,
          ),
        data: {
          chatContext: {
            page: 'users',
            breadcrumbs: ['Users'],
            metadata: {
              description: 'Customer accounts and user management',
              features: ['user list', 'account status', 'roles'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/coupons/coupon-list.component').then(
            (m) => m.CouponListComponent,
          ),
        data: {
          chatContext: {
            page: 'coupons',
            breadcrumbs: ['Coupons'],
            metadata: {
              description: 'Discount coupon management',
              features: ['coupon list', 'discount types', 'validity', 'usage limits'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'banners',
        loadComponent: () =>
          import('./features/banners/banner-list.component').then(
            (m) => m.BannerListComponent,
          ),
        data: {
          chatContext: {
            page: 'banners',
            breadcrumbs: ['Banners'],
            metadata: {
              description: 'Promotional banner management',
              features: ['banner list', 'active banners', 'image assets'],
            },
          } satisfies ChatContext,
        },
      },

      {
        path: 'attributes',
        loadComponent: () =>
          import('./features/product-attributes/product-attributes.component').then(
            (m) => m.ProductAttributesComponent,
          ),
        data: {
          chatContext: {
            page: 'product-attributes',
            breadcrumbs: ['Product Attributes'],
            metadata: {
              description: 'Product taxonomy: colours, types, plant types, categories',
              features: ['colours', 'product types', 'plant types', 'categories'],
            },
          } satisfies ChatContext,
        },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
