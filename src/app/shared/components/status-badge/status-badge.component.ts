import { Component, input, computed } from '@angular/core';
import { NgClass } from '@angular/common';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const STATUS_MAP: Record<string, BadgeVariant> = {
  delivered: 'success',
  completed: 'success',
  active: 'success',
  paid: 'success',
  processing: 'info',
  shipped: 'info',
  out_for_delivery: 'info',
  pending: 'warning',
  cancelled: 'error',
  returned: 'error',
  rto_initiated: 'error',
  rto_delivered: 'error',
  failed: 'error',
  inactive: 'neutral',
  expired: 'neutral',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      [ngClass]="badgeClasses()"
    >
      {{ displayText() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  readonly variant = input<BadgeVariant>();

  readonly displayText = computed(() =>
    this.status().replace(/_/g, ' ')
  );

  readonly badgeClasses = computed(() => {
    const v = this.variant() ?? STATUS_MAP[this.status()] ?? 'neutral';
    const map: Record<BadgeVariant, string> = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      error: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
      neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      primary: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    };
    return map[v];
  });
}
