import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BannerService } from '../../core/services/banner.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../shared/services/dialog.service';
import { Banner } from '../../core/models';
import { BannerFormComponent } from './banner-form.component';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
  ],
  template: `
    <app-page-header title="Banners" subtitle="Manage promotional banners">
      <button class="btn btn-primary" (click)="openForm()">
        <span class="material-icons text-lg">add</span> Add Banner
      </button>
    </app-page-header>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="4" />
    } @else if (banners().length === 0) {
      <div class="card">
        <app-empty-state
          icon="image"
          title="No banners yet"
          message="Create your first banner to showcase promotions."
          actionText="Add Banner"
          (action)="openForm()"
        />
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (banner of banners(); track banner._id) {
          <div class="card overflow-hidden group">
            <!-- Image -->
            <div class="relative aspect-[16/9] bg-gray-100 dark:bg-gray-800">
              @if (banner.image) {
                <img
                  [src]="banner.image"
                  [alt]="banner.title"
                  class="w-full h-full object-cover"
                />
              } @else {
                <div class="w-full h-full flex items-center justify-center">
                  <span class="material-icons text-5xl text-gray-300">image</span>
                </div>
              }
              <!-- Overlay actions -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity
                          flex items-center justify-center gap-3">
                <button
                  class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  (click)="openForm(banner)"
                >
                  <span class="material-icons text-gray-700">edit</span>
                </button>
                <button
                  class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  (click)="deleteBanner(banner)"
                >
                  <span class="material-icons text-red-500">delete</span>
                </button>
              </div>
            </div>

            <!-- Details -->
            <div class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-semibold truncate" style="color: var(--color-text)">
                  {{ banner.title }}
                </h3>
                <label class="toggle-switch" (click)="$event.stopPropagation()">
                  <input type="checkbox"
                    [checked]="banner.isActive"
                    (change)="toggleActive(banner)"
                  />
                  <span class="toggle-track"></span>
                </label>
              </div>
              <div class="flex items-center gap-2">
                <app-status-badge [status]="banner.isActive ? 'active' : 'inactive'" />
                @if (banner.position) {
                  <span class="chip bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {{ banner.position }}
                  </span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class BannerListComponent implements OnInit {
  private readonly bannerService = inject(BannerService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly banners = signal<Banner[]>([]);

  ngOnInit(): void {
    this.loadBanners();
  }

  openForm(banner?: Banner): void {
    const ref = this.dialog.open(BannerFormComponent, {
      width: '550px',
      data: banner ? { banner } : null,
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.loadBanners();
    });
  }

  toggleActive(banner: Banner): void {
    const newActive = !banner.isActive;
    const fd = new FormData();
    fd.append('isActive', String(newActive));
    this.bannerService.updateBanner(banner._id, fd).subscribe({
      next: () => {
        banner.isActive = newActive;
        this.toast.success(`Banner ${newActive ? 'activated' : 'deactivated'}`);
      },
      error: () => this.toast.error('Failed to update banner'),
    });
  }

  deleteBanner(banner: Banner): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Banner',
        message: `Delete "${banner.title}"? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.bannerService.deleteBanner(banner._id).subscribe({
        next: () => {
          this.toast.success('Banner deleted');
          this.banners.update(list => list.filter(b => b._id !== banner._id));
        },
        error: () => this.toast.error('Failed to delete banner'),
      });
    });
  }

  private loadBanners(): void {
    this.loading.set(true);
    this.bannerService.getBanners().subscribe({
      next: (res) => {
        const list = res.data ?? (res as unknown as Banner[]);
        this.banners.set(Array.isArray(list) ? list : []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load banners');
        this.loading.set(false);
      },
    });
  }
}
