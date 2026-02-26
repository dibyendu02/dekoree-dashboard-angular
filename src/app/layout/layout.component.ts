import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, NgClass],
  template: `
    <div class="flex h-screen overflow-hidden" style="background: var(--color-surface-alt)">
      <app-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="sidebarCollapsed.update(v => !v)"
      />

      <div
        class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
        [ngClass]="sidebarCollapsed() ? 'ml-[76px]' : 'ml-[264px]'"
      >
        <app-topbar />
        <main class="flex-1 overflow-y-auto">
          <div class="page-container animate-fade-in">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  readonly sidebarCollapsed = signal(false);
}
