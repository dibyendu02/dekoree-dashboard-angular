import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
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
          class="btn-icon"
          (click)="theme.toggle()"
          title="Toggle theme"
        >
          <span class="material-icons text-xl">
            {{ theme.isDark() ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Notifications -->
        <button class="btn-icon" title="Notifications">
          <span class="material-icons text-xl">notifications_none</span>
        </button>

        <!-- User Menu -->
        <div class="relative ml-2">
          <button
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
            style="background: transparent"
            onmouseover="this.style.background='var(--color-surface-hover)'"
            onmouseout="this.style.background='transparent'"
            (click)="menuOpen.set(!menuOpen()); $event.stopPropagation()"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center"
              style="background: var(--color-primary-light); opacity: 0.15"
            >
              <span class="text-sm font-semibold" style="color: var(--color-primary)">
                {{ userInitial }}
              </span>
            </div>
            <span class="text-sm font-medium hidden sm:inline" style="color: var(--color-text)">
              {{ userName }}
            </span>
            <span class="material-icons text-base" style="color: var(--color-text-muted)">
              expand_more
            </span>
          </button>

          @if (menuOpen()) {
            <div class="dropdown-menu mt-1">
              <button disabled>
                <span class="material-icons text-lg">person</span>
                Profile
              </button>
              <button disabled>
                <span class="material-icons text-lg">settings</span>
                Settings
              </button>
              <hr />
              <button (click)="auth.logout(); menuOpen.set(false)">
                <span class="material-icons text-lg text-red-500">logout</span>
                <span class="text-red-500">Logout</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
  private readonly elRef = inject(ElementRef);

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.menuOpen.set(false);
    }
  }

  get userName(): string {
    const user = this.auth.user();
    if (user?.firstName) return `${user.firstName} ${user.lastName ?? ''}`.trim();
    return user?.email ?? 'Admin';
  }

  get userInitial(): string {
    return this.userName.charAt(0).toUpperCase();
  }
}
