import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule],
  template: `
    <header
      class="h-16 flex items-center justify-between px-6 border-b sticky top-0 z-20"
      style="background: var(--color-surface); border-color: var(--color-border)"
    >
      <!-- Left -->
      <div class="flex items-center gap-4">
        <h2 class="text-sm font-medium" style="color: var(--color-text-secondary)">
          Admin Dashboard
        </h2>
      </div>

      <!-- Right -->
      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button
          mat-icon-button
          (click)="theme.toggle()"
          class="!text-gray-500"
          title="Toggle theme"
        >
          <span class="material-icons text-xl">
            {{ theme.isDark() ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Notifications -->
        <button mat-icon-button class="!text-gray-500" title="Notifications">
          <span class="material-icons text-xl">notifications_none</span>
        </button>

        <!-- User Menu -->
        <button
          mat-button
          [matMenuTriggerFor]="userMenu"
          class="!ml-2 !rounded-lg"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40
                     flex items-center justify-center"
            >
              <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {{ userInitial }}
              </span>
            </div>
            <span class="text-sm font-medium hidden sm:inline" style="color: var(--color-text)">
              {{ userName }}
            </span>
            <span class="material-icons text-base" style="color: var(--color-text-muted)">
              expand_more
            </span>
          </div>
        </button>
        <mat-menu #userMenu="matMenu" class="!mt-1">
          <button mat-menu-item disabled>
            <span class="material-icons mr-2">person</span>
            Profile
          </button>
          <button mat-menu-item disabled>
            <span class="material-icons mr-2">settings</span>
            Settings
          </button>
          <hr class="my-1" style="border-color: var(--color-border)" />
          <button mat-menu-item (click)="auth.logout()">
            <span class="material-icons mr-2 text-red-500">logout</span>
            <span class="text-red-500">Logout</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);

  get userName(): string {
    const user = this.auth.user();
    if (user?.firstName) return `${user.firstName} ${user.lastName ?? ''}`.trim();
    return user?.email ?? 'Admin';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }
}
