import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `
    @if (isSmallScreen()) {
      <div
        class="min-h-screen flex items-center justify-center p-6 text-center"
        style="background: var(--color-surface-alt); color: var(--color-text)"
      >
        <div class="max-w-md">
          <h1 class="text-xl font-semibold mb-2">Not Optimised For Mobile</h1>
          <p style="color: var(--color-text-secondary)">
            This admin panel is not optimised for viewing on small screens. Desktop view is preferred.
          </p>
        </div>
      </div>
    } @else {
      <router-outlet />
      <app-toast-container />
    }
  `,
})
export class App {
  readonly isSmallScreen = signal(false);

  constructor() {
    this.updateViewportState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateViewportState();
  }

  private updateViewportState(): void {
    this.isSmallScreen.set(window.innerWidth < 1024);
  }
}
