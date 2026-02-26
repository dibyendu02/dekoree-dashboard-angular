import { Component, input } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, DecimalPipe],
  template: `
    <div class="card p-5 hover:shadow-md transition-shadow duration-200">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium" style="color: var(--color-text-muted)">
            {{ label() }}
          </p>
          <p class="text-2xl font-bold mt-1" style="color: var(--color-text)">
            @if (prefix()) {
              <span class="text-lg">{{ prefix() }}</span>
            }
            {{ value() | number }}
          </p>
          @if (trend() !== undefined) {
            <div class="flex items-center gap-1 mt-2">
              <span
                class="material-icons text-sm"
                [ngClass]="{
                  'text-green-500': trend()! >= 0,
                  'text-red-500': trend()! < 0
                }"
              >
                {{ trend()! >= 0 ? 'trending_up' : 'trending_down' }}
              </span>
              <span
                class="text-xs font-semibold"
                [ngClass]="{
                  'text-green-600 dark:text-green-400': trend()! >= 0,
                  'text-red-600 dark:text-red-400': trend()! < 0
                }"
              >
                {{ trend()! >= 0 ? '+' : '' }}{{ trend() | number:'1.1-1' }}%
              </span>
              <span class="text-xs" style="color: var(--color-text-muted)">vs last period</span>
            </div>
          }
        </div>
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center"
          [ngClass]="iconBgClass()"
        >
          <span class="material-icons text-xl" [ngClass]="iconColorClass()">
            {{ icon() }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly trend = input<number>();
  readonly prefix = input<string>();
  readonly color = input<'primary' | 'green' | 'blue' | 'amber' | 'red'>('primary');

  iconBgClass(): string {
    const map: Record<string, string> = {
      primary: 'bg-indigo-50 dark:bg-indigo-900/30',
      green: 'bg-green-50 dark:bg-green-900/30',
      blue: 'bg-blue-50 dark:bg-blue-900/30',
      amber: 'bg-amber-50 dark:bg-amber-900/30',
      red: 'bg-red-50 dark:bg-red-900/30',
    };
    return map[this.color()] ?? map['primary'];
  }

  iconColorClass(): string {
    const map: Record<string, string> = {
      primary: 'text-indigo-600 dark:text-indigo-400',
      green: 'text-green-600 dark:text-green-400',
      blue: 'text-blue-600 dark:text-blue-400',
      amber: 'text-amber-600 dark:text-amber-400',
      red: 'text-red-600 dark:text-red-400',
    };
    return map[this.color()] ?? map['primary'];
  }
}
