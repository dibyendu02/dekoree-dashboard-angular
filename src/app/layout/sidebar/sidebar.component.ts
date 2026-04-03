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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
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
