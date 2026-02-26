import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--color-text)">
          {{ title() }}
        </h1>
        @if (subtitle()) {
          <p class="text-sm mt-1" style="color: var(--color-text-secondary)">
            {{ subtitle() }}
          </p>
        }
      </div>
      <div class="flex items-center gap-3">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
