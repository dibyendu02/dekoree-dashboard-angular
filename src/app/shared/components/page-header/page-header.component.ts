import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
      <div>
        <h1 class="text-xl font-bold tracking-tight" style="color: var(--color-text)">
          {{ title() }}
        </h1>
        @if (subtitle()) {
          <p class="text-[13px] mt-0.5 font-medium" style="color: var(--color-text-muted)">
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
