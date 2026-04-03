import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ImageUploadComponent } from '../../shared/components/image-upload/image-upload.component';
import { ProductAttributesService } from '../../core/services/product-attributes.service';
import { ChatContextService } from '../../core/services/chat-context.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../shared/services/dialog.service';

interface Attribute {
  _id: string;
  name: string;
  image?: string;
  hexCode?: string;
}

type TabType = 'categories' | 'colors' | 'types';

@Component({
  selector: 'app-product-attributes',
  standalone: true,
  imports: [
    FormsModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ImageUploadComponent,
  ],
  templateUrl: './product-attributes.component.html',
})
export class ProductAttributesComponent implements OnInit, OnDestroy {
  private readonly attrService = inject(ProductAttributesService);
  private readonly chatContext = inject(ChatContextService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly activeTab = signal<TabType>('categories');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly items = signal<Attribute[]>([]);

  newName = '';
  newHexCode = '#000000';
  private imageFile: File | null = null;

  ngOnInit(): void {
    this.syncChatContext();
    this.loadItems();
    // Re-load when tab changes
    const originalSet = this.activeTab.set.bind(this.activeTab);
    this.activeTab.set = (value: TabType) => {
      originalSet(value);
      this.syncChatContext();
      this.loadItems();
    };
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
  }

  getTabLabel(): string {
    const labels: Record<TabType, string> = {
      categories: 'Category',
      colors: 'Color',
      types: 'Product Type',
    };
    return labels[this.activeTab()];
  }

  onImageChange(files: File[]): void {
    this.imageFile = files[0] ?? null;
  }

  private syncChatContext(): void {
    this.chatContext.set({
      page: 'product-attributes',
      breadcrumbs: ['Product Attributes'],
      metadata: {
        description: 'Product taxonomy: colours, types, plant types, categories',
        features: ['colours', 'product types', 'plant types', 'categories'],
        activeTab: this.activeTab(),
      },
    });
  }

  addAttribute(): void {
    if (!this.newName.trim()) return;
    this.saving.set(true);

    const tab = this.activeTab();
    let obs$;

    if (tab === 'categories') {
      const formData = new FormData();
      formData.append('name', this.newName.trim());
      if (this.imageFile) formData.append('image', this.imageFile);
      obs$ = this.attrService.createCategory(formData);
    } else if (tab === 'colors') {
      obs$ = this.attrService.createColor(this.newName.trim());
    } else {
      obs$ = this.attrService.createProductType(this.newName.trim());
    }

    obs$.subscribe({
      next: () => {
        this.toast.success(`${this.getTabLabel()} added`);
        this.newName = '';
        this.imageFile = null;
        this.loadItems();
        this.saving.set(false);
      },
      error: () => {
        this.toast.error(`Failed to add ${this.getTabLabel()}`);
        this.saving.set(false);
      },
    });
  }

  deleteAttribute(item: Attribute): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: `Delete ${this.getTabLabel()}`,
        message: `Delete "${item.name}"? This cannot be undone.`,
        confirmText: 'Delete',
        confirmColor: 'warn',
      } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      const tab = this.activeTab();
      let obs$;
      if (tab === 'categories') obs$ = this.attrService.deleteCategory(item._id);
      else if (tab === 'colors') obs$ = this.attrService.deleteColor(item._id);
      else obs$ = this.attrService.deleteProductType(item._id);

      obs$.subscribe({
        next: () => {
          this.toast.success(`${this.getTabLabel()} deleted`);
          this.items.update(list => list.filter(i => i._id !== item._id));
        },
        error: () => this.toast.error(`Failed to delete ${this.getTabLabel()}`),
      });
    });
  }

  private loadItems(): void {
    this.loading.set(true);
    const tab = this.activeTab();
    let obs$;
    if (tab === 'categories') obs$ = this.attrService.getCategories();
    else if (tab === 'colors') obs$ = this.attrService.getColors();
    else obs$ = this.attrService.getProductTypes();

    obs$.subscribe({
      next: (res: { data?: Attribute[] }) => {
        this.items.set(res.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load items');
        this.loading.set(false);
      },
    });
  }
}
