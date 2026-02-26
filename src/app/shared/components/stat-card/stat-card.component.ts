import { Component, input } from '@angular/core';
import { NgClass, DecimalPipe } from '@angular/common';

type CardColor = 'primary' | 'green' | 'blue' | 'amber' | 'red';

interface ColorConfig {
  iconBg: string;
  iconBgDark: string;
  iconColor: string;
  iconColorDark: string;
  borderColor: string;
}

const COLOR_MAP: Record<CardColor, ColorConfig> = {
  primary: {
    iconBg: '#d1fae5',
    iconBgDark: 'rgba(6,95,70,0.35)',
    iconColor: '#059669',
    iconColorDark: '#6ee7b7',
    borderColor: '#10b981',
  },
  green: {
    iconBg: '#dcfce7',
    iconBgDark: 'rgba(22,101,52,0.35)',
    iconColor: '#16a34a',
    iconColorDark: '#86efac',
    borderColor: '#22c55e',
  },
  blue: {
    iconBg: '#ccfbf1',
    iconBgDark: 'rgba(19,78,74,0.35)',
    iconColor: '#0d9488',
    iconColorDark: '#5eead4',
    borderColor: '#14b8a6',
  },
  amber: {
    iconBg: '#fef3c7',
    iconBgDark: 'rgba(120,53,15,0.35)',
    iconColor: '#d97706',
    iconColorDark: '#fcd34d',
    borderColor: '#f59e0b',
  },
  red: {
    iconBg: '#fee2e2',
    iconBgDark: 'rgba(127,29,29,0.35)',
    iconColor: '#dc2626',
    iconColorDark: '#fca5a5',
    borderColor: '#ef4444',
  },
};

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, DecimalPipe],
  template: `
    <div
      class="stat-card group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-default"
      [style.--icon-bg]="colorConfig.iconBg"
      [style.--icon-bg-dark]="colorConfig.iconBgDark"
      [style.--icon-color]="colorConfig.iconColor"
      [style.--icon-color-dark]="colorConfig.iconColorDark"
      [style.--accent-border]="colorConfig.borderColor"
    >
      <div class="relative flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wider mb-1" style="color: var(--color-text-muted)">
            {{ label() }}
          </p>
          <p class="text-[26px] font-bold tracking-tight leading-tight" style="color: var(--color-text)">
            @if (prefix()) {
              <span class="text-lg font-semibold" style="color: var(--color-text-secondary)">{{ prefix() }}</span>
            }
            {{ value() | number }}
          </p>
          @if (trend() !== undefined) {
            <div class="flex items-center gap-1.5 mt-3">
              <span
                class="trend-pill inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                [ngClass]="{
                  'trend-up': trend()! >= 0,
                  'trend-down': trend()! < 0
                }"
              >
                <span class="material-icons text-[14px]">
                  {{ trend()! >= 0 ? 'trending_up' : 'trending_down' }}
                </span>
                {{ trend()! >= 0 ? '+' : '' }}{{ trend() | number:'1.1-1' }}%
              </span>
              <span class="text-[11px] font-medium" style="color: var(--color-text-muted)">vs last period</span>
            </div>
          }
        </div>
        <div class="icon-box w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
          <span class="icon-inner material-icons text-xl">
            {{ icon() }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .stat-card {
      background: var(--color-surface);
      border-color: var(--color-border);
      border-left: 3px solid var(--accent-border);
      box-shadow: var(--shadow-sm);
    }
    .stat-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }
    .icon-box {
      background: var(--icon-bg);
    }
    .icon-inner {
      color: var(--icon-color);
    }
    .trend-up {
      background: #dcfce7;
      color: #15803d;
    }
    .trend-down {
      background: #fee2e2;
      color: #b91c1c;
    }

    :host-context(.dark) .icon-box {
      background: var(--icon-bg-dark);
    }
    :host-context(.dark) .icon-inner {
      color: var(--icon-color-dark);
    }
    :host-context(.dark) .trend-up {
      background: rgba(22, 101, 52, 0.4);
      color: #86efac;
    }
    :host-context(.dark) .trend-down {
      background: rgba(127, 29, 29, 0.4);
      color: #fca5a5;
    }
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<string>();
  readonly trend = input<number>();
  readonly prefix = input<string>();
  readonly color = input<CardColor>('primary');

  get colorConfig(): ColorConfig {
    return COLOR_MAP[this.color()] ?? COLOR_MAP['primary'];
  }
}
