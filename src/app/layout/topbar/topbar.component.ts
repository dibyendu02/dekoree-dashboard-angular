import { Component, inject, signal, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
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
