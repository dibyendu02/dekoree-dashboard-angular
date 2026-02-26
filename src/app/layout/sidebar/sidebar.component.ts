import { Component, input, output, signal } from '@angular/core';
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
      class="fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 border-r"
      [ngClass]="collapsed() ? 'w-[72px]' : 'w-[260px]'"
      style="background: var(--color-surface); border-color: var(--color-border)"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center gap-3 px-5 border-b shrink-0"
        style="border-color: var(--color-border)"
      >
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <span class="text-white font-bold text-sm">D</span>
        </div>
        @if (!collapsed()) {
          <span class="text-lg font-bold" style="color: var(--color-text)">Dekoree</span>
        }
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <ul class="space-y-1 px-3">
          @for (item of navItems; track item.route) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="active-link"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                onmouseover="this.style.background='var(--color-surface-hover)'"
                onmouseout="if(!this.classList.contains('active-link')) this.style.background='transparent'"
                [ngClass]="{ 'justify-center': collapsed() }"
                style="color: var(--color-text-secondary); background: transparent"
                [title]="collapsed() ? item.label : ''"
              >
                <span class="material-icons text-xl">{{ item.icon }}</span>
                @if (!collapsed()) {
                  <span>{{ item.label }}</span>
                }
              </a>
            </li>
          }
        </ul>
      </nav>

      <!-- Collapse Toggle -->
      <div class="p-3 border-t shrink-0" style="border-color: var(--color-border)">
        <button
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          onmouseover="this.style.background='var(--color-surface-hover)'"
          onmouseout="this.style.background='transparent'"
          style="color: var(--color-text-muted); background: transparent"
          (click)="toggleCollapse.emit()"
        >
          <span class="material-icons text-xl">
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
    :host ::ng-deep .active-link {
      background-color: var(--color-primary) !important;
      color: white !important;
    }
    :host ::ng-deep .active-link .material-icons {
      color: white !important;
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
