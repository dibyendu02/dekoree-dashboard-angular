import { Component, inject, signal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { Order, OrderStatus, ShipmentRequest } from '../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TitleCasePipe,
    StatusBadgeComponent,
    CurrencyInrPipe,
    RelativeTimePipe,
  ],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  readonly dialogRef = inject<{ close: (v: unknown) => void }>('DIALOG_REF' as never);
  private readonly data = inject<{ order: Order }>('DIALOG_DATA' as never);

  readonly order = this.data.order;
  readonly updating = signal(false);
  readonly creatingShipment = signal(false);
  readonly changed = signal(false);

  newStatus: string = this.order.status ?? 'processing';
  readonly statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

  readonly shipmentForm = this.fb.group({
    length: [10, [Validators.required, Validators.min(1)]],
    width: [10, [Validators.required, Validators.min(1)]],
    height: [10, [Validators.required, Validators.min(1)]],
    weight: [500, [Validators.required, Validators.min(1)]],
  });

  isUserObject(): boolean {
    return !!this.order.user && typeof this.order.user !== 'string';
  }

  get userObj() {
    return this.order.user as import('../../core/models').User;
  }

  formatStatus(s: string): string {
    return s.replace(/_/g, ' ');
  }

  updateStatus(): void {
    if (this.newStatus === this.order.status) return;
    this.updating.set(true);
    this.orderService.updateOrder(this.order._id, { status: this.newStatus as OrderStatus }).subscribe({
      next: () => {
        this.order.status = this.newStatus as OrderStatus;
        this.changed.set(true);
        this.toast.success('Order status updated');
        this.updating.set(false);
      },
      error: () => {
        this.toast.error('Failed to update status');
        this.updating.set(false);
      },
    });
  }

  createShipment(): void {
    if (this.shipmentForm.invalid) return;
    this.creatingShipment.set(true);
    const raw = this.shipmentForm.getRawValue();
    const shipment: ShipmentRequest = {
      length: raw.length ?? 10,
      width: raw.width ?? 10,
      height: raw.height ?? 10,
      weight: raw.weight ?? 500,
    };
    this.orderService.createShipment(this.order._id, shipment).subscribe({
      next: () => {
        this.changed.set(true);
        this.toast.success('Shipment created');
        this.creatingShipment.set(false);
      },
      error: () => {
        this.toast.error('Failed to create shipment');
        this.creatingShipment.set(false);
      },
    });
  }
}
