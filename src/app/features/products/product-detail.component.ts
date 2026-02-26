import { Component, inject, signal } from '@angular/core';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyInrPipe, StatusBadgeComponent],
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        Product Details
      </h2>
    </div>

    <div class="px-6 py-3 overflow-y-auto" style="max-height: 70vh">
      <!-- Image Gallery -->
      @if (product.images?.length) {
        <div class="mb-6">
          <img
            [src]="selectedImage()"
            [alt]="product.name"
            class="w-full h-64 object-contain rounded-xl border mb-3"
            style="background: var(--color-surface-alt); border-color: var(--color-border)"
          />
          @if (product.images!.length > 1) {
            <div class="flex gap-2 overflow-x-auto pb-1">
              @for (img of product.images!; track $index) {
                <img
                  [src]="img"
                  [alt]="product.name"
                  class="w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all"
                  [class.border-indigo-500]="selectedImage() === img"
                  [class.opacity-60]="selectedImage() !== img"
                  [style.border-color]="selectedImage() === img ? '' : 'var(--color-border)'"
                  (click)="selectedImage.set(img)"
                />
              }
            </div>
          }
        </div>
      }

      <!-- Name & Price -->
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-1" style="color: var(--color-text)">{{ product.name }}</h3>
        <div class="flex items-center gap-3">
          <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ product.price | currencyInr }}
          </span>
          @if (product.mrp && product.mrp > product.price) {
            <span class="text-base line-through" style="color: var(--color-text-muted)">
              {{ product.mrp | currencyInr }}
            </span>
            <span class="chip bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              {{ getDiscount() }}% off
            </span>
          }
        </div>
      </div>

      <!-- Status Chips -->
      <div class="flex gap-2 mb-4">
        <app-status-badge [status]="product.isActive !== false ? 'active' : 'inactive'" />
        @if (product.isFeatured) {
          <span class="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Featured</span>
        }
        @if (product.category) {
          <span class="chip bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {{ getCategoryName() }}
          </span>
        }
      </div>

      <!-- Description -->
      @if (product.shortDescription) {
        <div class="mb-4 p-4 rounded-lg" style="background: var(--color-surface-alt)">
          <p class="text-sm" style="color: var(--color-text-secondary)">{{ product.shortDescription }}</p>
        </div>
      }

      <!-- Details Grid -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        @for (field of detailFields; track field.label) {
          <div class="p-3 rounded-lg" style="background: var(--color-surface-alt)">
            <p class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">{{ field.label }}</p>
            <p class="text-sm font-semibold mt-0.5" style="color: var(--color-text)">{{ field.value }}</p>
          </div>
        }
      </div>

      <!-- FAQs -->
      @if (product.faqs?.length) {
        <h4 class="text-sm font-semibold mb-2" style="color: var(--color-text)">FAQs</h4>
        @for (faq of product.faqs; track $index) {
          <div class="mb-3 p-3 rounded-lg" style="background: var(--color-surface-alt)">
            <p class="text-sm font-medium mb-1" style="color: var(--color-text)">{{ faq.question }}</p>
            <p class="text-sm" style="color: var(--color-text-secondary)">{{ faq.answer }}</p>
          </div>
        }
      }
    </div>

    <div class="flex justify-end px-6 pb-5 pt-3">
      <button class="btn btn-ghost" (click)="dialogRef.close()">Close</button>
    </div>
  `,
})
export class ProductDetailComponent {
  private readonly data = inject<{ product: Product }>('DIALOG_DATA' as never);
  readonly dialogRef = inject<{ close: (v?: unknown) => void }>('DIALOG_REF' as never);
  readonly product = this.data.product;
  readonly selectedImage = signal(this.product.images?.[0] ?? '');

  getDiscount(): number {
    if (!this.product.mrp || this.product.mrp <= this.product.price) return 0;
    return Math.round(((this.product.mrp - this.product.price) / this.product.mrp) * 100);
  }

  getCategoryName(): string {
    const cat = this.product.category;
    return typeof cat === 'string' ? cat : (cat as { name?: string })?.name ?? '-';
  }

  get detailFields() {
    return [
      { label: 'Stock', value: String(this.product.stock ?? 0) },
      { label: 'SKU', value: this.product.sku ?? '-' },
      { label: 'Weight', value: this.product.weight ? `${this.product.weight}g` : '-' },
      { label: 'Dimensions', value: this.product.length ? `${this.product.length}×${this.product.width}×${this.product.height} cm` : '-' },
    ];
  }
}
