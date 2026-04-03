import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.html',
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
