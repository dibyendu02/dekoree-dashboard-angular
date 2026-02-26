import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatChipsModule, StatusBadgeComponent, CurrencyInrPipe],
  template: `
    <h2 mat-dialog-title class="!text-lg !font-semibold" style="color: var(--color-text)">
      Product Details
    </h2>

    <mat-dialog-content class="!max-h-[70vh]">
      <!-- Image Gallery -->
      @if (product.images?.length) {
        <div class="mb-6">
          <img
            [src]="selectedImage()"
            [alt]="product.name"
            class="w-full h-64 object-contain rounded-xl border mb-3"
            style="background: var(--color-surface-alt); border-color: var(--color-border)"
          />
          <div class="flex gap-2 overflow-x-auto pb-2">
            @for (img of product.images; track $index) {
              <img
                [src]="img"
                [alt]="product.name"
                class="w-16 h-16 rounded-lg object-cover cursor-pointer border-2 transition-colors shrink-0"
                [class.border-indigo-500]="selectedImage() === img"
                [class.border-transparent]="selectedImage() !== img"
                (click)="selectedImage.set(img)"
              />
            }
          </div>
        </div>
      }

      <!-- Info -->
      <h3 class="text-xl font-bold mb-2" style="color: var(--color-text)">{{ product.name }}</h3>

      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          {{ product.price | currencyInr }}
        </span>
        @if (product.originalPrice && product.originalPrice > product.price) {
          <span class="text-lg line-through" style="color: var(--color-text-muted)">
            {{ product.originalPrice | currencyInr }}
          </span>
          <app-status-badge [status]="product.discountPercentage + '% OFF'" variant="success" />
        }
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">Stock</p>
          <p class="text-sm font-semibold" style="color: var(--color-text)">{{ product.stock ?? 0 }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">SKU</p>
          <p class="text-sm font-semibold" style="color: var(--color-text)">{{ product.sku || '-' }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">Status</p>
          <app-status-badge [status]="product.isActive ? 'active' : 'inactive'" />
        </div>
        <div>
          <p class="text-xs font-medium uppercase" style="color: var(--color-text-muted)">Weight</p>
          <p class="text-sm font-semibold" style="color: var(--color-text)">{{ product.weight ?? 0 }}g</p>
        </div>
      </div>

      <!-- Badges -->
      <div class="flex flex-wrap gap-2 mb-4">
        @if (product.isFeatured) {
          <mat-chip-set><mat-chip class="!bg-indigo-100 !text-indigo-700">Featured</mat-chip></mat-chip-set>
        }
        @if (product.isBestseller) {
          <mat-chip-set><mat-chip class="!bg-amber-100 !text-amber-700">Bestseller</mat-chip></mat-chip-set>
        }
        @if (product.isTrending) {
          <mat-chip-set><mat-chip class="!bg-green-100 !text-green-700">Trending</mat-chip></mat-chip-set>
        }
      </div>

      @if (product.description) {
        <div class="mb-4">
          <p class="text-xs font-medium uppercase mb-1" style="color: var(--color-text-muted)">Description</p>
          <div class="text-sm prose max-w-none" style="color: var(--color-text-secondary)" [innerHTML]="product.description"></div>
        </div>
      }

      @if (product.faqs?.length) {
        <div>
          <p class="text-xs font-medium uppercase mb-2" style="color: var(--color-text-muted)">FAQs</p>
          @for (faq of product.faqs; track $index) {
            <div class="mb-3 p-3 rounded-lg" style="background: var(--color-surface-alt)">
              <p class="text-sm font-semibold mb-1" style="color: var(--color-text)">{{ faq.question }}</p>
              <p class="text-sm" style="color: var(--color-text-secondary)">{{ faq.answer }}</p>
            </div>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="!pb-4 !pr-6">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ProductDetailComponent {
  private readonly data = inject<{ product: Product }>(MAT_DIALOG_DATA);
  readonly product = this.data.product;
  readonly selectedImage = signal(this.product.images?.[0] ?? '');
}
