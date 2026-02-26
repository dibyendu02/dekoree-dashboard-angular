import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BannerService } from '../../core/services/banner.service';
import { ToastService } from '../../core/services/toast.service';
import { Banner } from '../../core/models';
import { BannerFormComponent } from './banner-form.component';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule, MatMenuModule,
    MatDialogModule, MatSlideToggleModule,
    PageHeaderComponent, StatusBadgeComponent, SkeletonLoaderComponent, EmptyStateComponent,
  ],
  template: `
    <app-page-header title="Banners" subtitle="Manage promotional banners">
      <button mat-flat-button color="primary" (click)="openForm()">
        <span class="material-icons text-lg mr-1">add</span> Add Banner
      </button>
    </app-page-header>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="4" />
    } @else if (dataSource.data.length === 0) {
      <div class="card">
        <app-empty-state icon="image" title="No banners" message="Create banners to promote your products." actionText="Add Banner" (action)="openForm()" />
      </div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (banner of dataSource.data; track banner._id) {
          <div class="card overflow-hidden group">
            @if (banner.image) {
              <img [src]="banner.image" [alt]="banner.description" class="w-full h-40 object-cover" />
            } @else {
              <div class="w-full h-40 flex items-center justify-center" style="background: var(--color-surface-alt)">
                <span class="material-icons text-4xl" style="color: var(--color-text-muted)">image</span>
              </div>
            }
            <div class="p-4">
              <div class="flex items-center gap-2 mb-2">
                @if (banner.type) {
                  <app-status-badge [status]="banner.type" variant="primary" />
                }
                @if (banner.position) {
                  <app-status-badge [status]="banner.position" variant="info" />
                }
              </div>
              <p class="text-sm mb-3" style="color: var(--color-text-secondary)">
                {{ banner.description || 'No description' }}
              </p>
              <div class="flex items-center justify-between">
                <mat-slide-toggle
                  [checked]="banner.isActive"
                  (change)="toggleBanner(banner)"
                  color="primary"
                ></mat-slide-toggle>
                <div class="flex gap-1">
                  <button mat-icon-button (click)="openForm(banner)" class="!w-8 !h-8">
                    <span class="material-icons text-lg">edit</span>
                  </button>
                  <button mat-icon-button (click)="deleteBanner(banner)" class="!w-8 !h-8 !text-red-400">
                    <span class="material-icons text-lg">delete</span>
                  </button>
                </div>
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
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  dataSource = new MatTableDataSource<Banner>([]);

  ngOnInit(): void { this.loadBanners(); }

  openForm(banner?: Banner): void {
    const ref = this.dialog.open(BannerFormComponent, { width: '600px', maxHeight: '90vh', data: { banner } });
    ref.afterClosed().subscribe(result => { if (result) this.loadBanners(); });
  }

  toggleBanner(banner: Banner): void {
    this.bannerService.toggleBanner(banner._id).subscribe({
      next: () => { banner.isActive = !banner.isActive; this.toast.success(`Banner ${banner.isActive ? 'activated' : 'deactivated'}`); },
      error: () => this.toast.error('Failed to toggle banner'),
    });
  }

  deleteBanner(banner: Banner): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete Banner', message: 'Delete this banner?', confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.bannerService.deleteBanner(banner._id).subscribe({
        next: () => { this.toast.success('Banner deleted'); this.dataSource.data = this.dataSource.data.filter(b => b._id !== banner._id); },
        error: () => this.toast.error('Failed to delete banner'),
      });
    });
  }

  private loadBanners(): void {
    this.loading.set(true);
    this.bannerService.getBanners({ limit: 100 }).subscribe({
      next: (res) => {
        const banners = res.data ?? (res as unknown as Banner[]);
        this.dataSource.data = Array.isArray(banners) ? banners : [];
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load banners'); this.loading.set(false); },
    });
  }
}
