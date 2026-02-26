import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
  template: `
    <aside
      class="fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300"
      [ngClass]="collapsed() ? 'w-[76px]' : 'w-[264px]'"
      [style.background]="'linear-gradient(180deg, #1A3C1E 0%, #152E18 50%, #0F2412 100%)'"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center gap-3 px-5 shrink-0"
        style="border-bottom: 1px solid rgba(255,255,255,0.08)"
      >
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
             style="background: linear-gradient(135deg, #4CAF50, #2E7D32);">
          <span class="material-icons text-white text-lg">eco</span>
        </div>
        @if (!collapsed()) {
          <div class="flex flex-col">
            <span class="text-[15px] font-semibold tracking-tight text-white/95">Dekoree</span>
            <span class="text-[10px] font-medium text-white/40 uppercase tracking-widest">Admin</span>
          </div>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-5 overflow-y-auto">
        @if (!collapsed()) {
          <p class="px-6 mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            Menu
          </p>
        }
        <ul class="space-y-0.5 px-3">
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="sidebar-active"
                class="sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
                [ngClass]="{ 'justify-center': collapsed() }"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="material-icons text-[20px] shrink-0">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span>{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Collapse Toggle -->
      <div class="p-3 shrink-0" style="border-top: 1px solid rgba(255,255,255,0.08)">
        <button
          class="sidebar-link w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200"
          (click)="toggleCollapse.emit()"
        >
          <span class="material-icons text-[20px]">
            {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
          </span>
          @if (!collapsed()) {
            <span>Collapse</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: `
    .sidebar-link {
      color: rgba(255, 255, 255, 0.55);
    }
    .sidebar-link:hover {
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255, 255, 255, 0.06);
    }
    :host ::ng-deep .sidebar-active {
      background: rgba(76, 175, 80, 0.15) !important;
      color: #A5D6A7 !important;
    }
    :host ::ng-deep .sidebar-active .material-icons {
      color: #81C784 !important;
    }
  `,
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly toggleCollapse = output();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Products', icon: 'inventory_2', route: '/products' },
    { label: 'Orders', icon: 'local_shipping', route: '/orders' },
    { label: 'Users', icon: 'people', route: '/users' },
    { label: 'Coupons', icon: 'local_offer', route: '/coupons' },
    { label: 'Banners', icon: 'image', route: '/banners' },
    { label: 'Attributes', icon: 'label', route: '/attributes' },
  ];
}
