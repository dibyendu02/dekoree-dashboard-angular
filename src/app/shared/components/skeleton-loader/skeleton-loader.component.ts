import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    @switch (type()) {
      @case ('table') {
        <div class="space-y-3 p-4">
          <div class="skeleton h-10 w-full rounded-md"></div>
          @for (_ of rows; track $index) {
            <div class="skeleton h-14 w-full rounded-md"></div>
          }
        </div>
      }
      @case ('cards') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (_ of [1,2,3,4]; track $index) {
            <div class="card p-5">
              <div class="skeleton h-4 w-24 mb-3"></div>
              <div class="skeleton h-8 w-32 mb-2"></div>
              <div class="skeleton h-3 w-20"></div>
            </div>
          }
        </div>
      }
      @case ('form') {
        <div class="space-y-6 p-4">
          @for (_ of [1,2,3,4]; track $index) {
            <div>
              <div class="skeleton h-4 w-20 mb-2"></div>
              <div class="skeleton h-10 w-full"></div>
            </div>
          }
        </div>
      }
      @default {
        <div class="skeleton" [style.height.px]="height()" [style.width]="width()"></div>
      }
    }
  `,
})
export class SkeletonLoaderComponent {
  readonly type = input<'table' | 'cards' | 'form' | 'custom'>('custom');
  readonly height = input(20);
  readonly width = input('100%');
  readonly count = input(5);

  get rows(): number[] {
    return Array.from({ length: this.count() });
  }
}
