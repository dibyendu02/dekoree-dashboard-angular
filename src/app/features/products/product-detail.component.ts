import { Component, inject, signal } from '@angular/core';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CurrencyInrPipe, StatusBadgeComponent],
  templateUrl: './product-detail.component.html',
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
