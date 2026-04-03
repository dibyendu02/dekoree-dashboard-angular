import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { BannerService } from '../../core/services/banner.service';
import { ChatContextService } from '../../core/services/chat-context.service';
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
  templateUrl: './banner-list.component.html',
})
export class BannerListComponent implements OnInit, OnDestroy {
  private readonly chatContext = inject(ChatContextService);
  private readonly bannerService = inject(BannerService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly banners = signal<Banner[]>([]);

  ngOnInit(): void {
    this.chatContext.set({
      page: 'banners',
      breadcrumbs: ['Banners'],
      metadata: {
        description: 'Promotional banner management',
        features: ['banner list', 'active banners', 'image assets'],
      },
    });
    this.loadBanners();
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
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
