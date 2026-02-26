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
  template: `
    <div class="px-6 pt-6 pb-2">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">
        Order #{{ order.orderNumber ?? order._id.slice(-6) }}
      </h2>
    </div>

    <div class="px-6 py-2 overflow-y-auto" style="max-height: 70vh">
      <!-- Status & Basic Info -->
      <div class="flex items-center gap-3 mb-6">
        <app-status-badge [status]="order.status ?? 'pending'" />
        <span class="text-sm" style="color: var(--color-text-muted)">
          {{ order.createdAt | relativeTime }}
        </span>
      </div>

      <!-- Customer Info -->
      <div class="card p-4 mb-4">
        <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color: var(--color-text)">
          <span class="material-icons text-lg">person</span> Customer
        </h4>
        @if (isUserObject()) {
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span style="color: var(--color-text-muted)">Name:</span>
              <span class="ml-1 font-medium" style="color: var(--color-text)">
                {{ userObj.firstName }} {{ userObj.lastName }}
              </span>
            </div>
            <div>
              <span style="color: var(--color-text-muted)">Email:</span>
              <span class="ml-1" style="color: var(--color-text-secondary)">{{ userObj.email }}</span>
            </div>
            <div>
              <span style="color: var(--color-text-muted)">Phone:</span>
              <span class="ml-1" style="color: var(--color-text-secondary)">{{ userObj.phone ?? '-' }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Order Items -->
      <div class="card p-4 mb-4">
        <h4 class="text-sm font-semibold mb-3 flex items-center gap-2" style="color: var(--color-text)">
          <span class="material-icons text-lg">shopping_bag</span> Items
        </h4>
        @for (item of order.products ?? []; track $index) {
          <div class="flex items-center gap-3 py-2 border-b last:border-0" style="border-color: var(--color-border)">
            @if (item.image) {
              <img [src]="item.image" class="w-10 h-10 rounded-lg object-cover" />
            }
            <div class="flex-1">
              <p class="text-sm font-medium" style="color: var(--color-text)">{{ item.name ?? 'Product' }}</p>
              <p class="text-xs" style="color: var(--color-text-muted)">Qty: {{ item.quantity }}</p>
            </div>
            <span class="text-sm font-semibold" style="color: var(--color-text)">{{ item.price | currencyInr }}</span>
          </div>
        }
        <div class="flex justify-between items-center pt-3 mt-2 border-t" style="border-color: var(--color-border)">
          <span class="text-sm font-semibold" style="color: var(--color-text)">Total</span>
          <span class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{{ order.totalAmount | currencyInr }}</span>
        </div>
      </div>

      <!-- Payment & Shipping -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="card p-4">
          <h4 class="text-sm font-semibold mb-2" style="color: var(--color-text)">Payment</h4>
          <p class="text-sm" style="color: var(--color-text-secondary)">{{ order.paymentMethod ?? '-' }}</p>
          @if (order.paymentStatus) {
            <app-status-badge [status]="order.paymentStatus" class="mt-1" />
          }
        </div>
        <div class="card p-4">
          <h4 class="text-sm font-semibold mb-2" style="color: var(--color-text)">Shipping</h4>
          @if (order.shippingAddress) {
            <p class="text-xs" style="color: var(--color-text-secondary)">
              {{ order.shippingAddress.street }}, {{ order.shippingAddress.city }},
              {{ order.shippingAddress.state }} {{ order.shippingAddress.pincode }}
            </p>
          } @else {
            <p class="text-xs" style="color: var(--color-text-muted)">No address</p>
          }
        </div>
      </div>

      <!-- Update Status -->
      @if (!['delivered', 'cancelled', 'returned'].includes(order.status ?? '')) {
        <div class="card p-4 mb-4">
          <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text)">Update Status</h4>
          <div class="flex gap-3">
            <div class="form-field flex-1">
              <label>New Status</label>
              <select [(value)]="newStatus" (change)="newStatus = $any($event.target).value">
                @for (s of statuses; track s) {
                  <option [value]="s" [selected]="s === newStatus">{{ formatStatus(s) | titlecase }}</option>
                }
              </select>
            </div>
            <button
              class="btn btn-primary self-end h-[42px]"
              [disabled]="updating()"
              (click)="updateStatus()"
            >
              @if (updating()) {
                <span class="spinner w-4 h-4 border-white/30 border-t-white"></span>
              } @else {
                Update
              }
            </button>
          </div>
        </div>
      }

      <!-- Create Shipment -->
      @if (order.status === 'processing' || order.status === 'pending') {
        <div class="card p-4">
          <h4 class="text-sm font-semibold mb-3" style="color: var(--color-text)">Create Shipment</h4>
          <form [formGroup]="shipmentForm" class="grid grid-cols-2 gap-3">
            <div class="form-field">
              <label>Length (cm)</label>
              <input type="number" formControlName="length" />
            </div>
            <div class="form-field">
              <label>Width (cm)</label>
              <input type="number" formControlName="width" />
            </div>
            <div class="form-field">
              <label>Height (cm)</label>
              <input type="number" formControlName="height" />
            </div>
            <div class="form-field">
              <label>Weight (g)</label>
              <input type="number" formControlName="weight" />
            </div>
          </form>
          <button
            class="btn btn-primary mt-3"
            [disabled]="creatingShipment() || shipmentForm.invalid"
            (click)="createShipment()"
          >
            @if (creatingShipment()) {
              <span class="spinner w-4 h-4 border-white/30 border-t-white mr-1"></span>
            }
            Create Shipment
          </button>
        </div>
      }
    </div>

    <div class="flex justify-end px-6 pb-5 pt-3">
      <button class="btn btn-ghost" (click)="dialogRef.close(changed())">Close</button>
    </div>
  `,
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
