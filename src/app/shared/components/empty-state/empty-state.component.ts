import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <span
        class="material-icons text-6xl mb-4"
        style="color: var(--color-text-muted)"
      >
        {{ icon() }}
      </span>
      <h3 class="text-lg font-semibold mb-1" style="color: var(--color-text)">
        {{ title() }}
      </h3>
      <p class="text-sm mb-6 text-center max-w-sm" style="color: var(--color-text-secondary)">
        {{ message() }}
      </p>
      @if (actionText()) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          {{ actionText() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('No data found');
  readonly message = input('There are no items to display.');
  readonly actionText = input<string>();
  readonly action = output();
}
