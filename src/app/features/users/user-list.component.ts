import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { UserService } from '../../core/services/user.service';
import { ChatContextService } from '../../core/services/chat-context.service';
import { ToastService } from '../../core/services/toast.service';
import { DialogService } from '../../shared/services/dialog.service';
import { User } from '../../core/models';
import { UserDetailComponent } from './user-detail.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    DatePipe,
    PageHeaderComponent,
    SearchInputComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    CurrencyInrPipe,
    RelativeTimePipe,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly chatContext = inject(ChatContextService);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(DialogService);

  readonly loading = signal(true);
  readonly allUsers = signal<User[]>([]);
  readonly filteredUsers = signal<User[]>([]);
  readonly searchTerm = signal('');
  readonly genderFilter = signal('');
  readonly sortField = signal('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly openMenuId = signal<string | null>(null);

  ngOnInit(): void {
    this.chatContext.set({
      page: 'users',
      breadcrumbs: ['Users'],
      metadata: {
        description: 'Customer accounts and user management',
        features: ['user list', 'account status', 'roles'],
      },
    });
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.chatContext.clear();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim().toLowerCase());
    this.applyFilters();
  }

  onGenderFilter(gender: string): void {
    this.genderFilter.set(gender);
    this.applyFilters();
  }

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.applyFilters();
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return 'unfold_more';
    return this.sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  paginatedUsers(): User[] {
    const start = this.currentPage() * this.pageSize();
    return this.filteredUsers().slice(start, start + this.pageSize());
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize()));
  }

  paginationLabel(): string {
    const total = this.filteredUsers().length;
    const start = this.currentPage() * this.pageSize() + 1;
    const end = Math.min(start + this.pageSize() - 1, total);
    return total ? `${start}–${end} of ${total}` : '0 of 0';
  }

  viewUser(user: User): void {
    this.dialog.open(UserDetailComponent, { width: '600px', maxHeight: '90vh', data: { user } });
  }

  makeAdmin(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Make Admin', message: `Grant admin privileges to ${user.firstName}?`, confirmText: 'Confirm', confirmColor: 'primary' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.makeAdmin(user._id).subscribe({
        next: () => { user.isAdmin = true; this.toast.success('Admin privileges granted'); },
        error: () => this.toast.error('Failed to update privileges'),
      });
    });
  }

  removeAdmin(user: User): void {
    this.userService.removeAdmin(user._id).subscribe({
      next: () => { user.isAdmin = false; this.toast.success('Admin privileges removed'); },
      error: () => this.toast.error('Failed to update privileges'),
    });
  }

  deleteUser(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title: 'Delete User', message: `Delete user ${user.firstName ?? user.email}? This cannot be undone.`, confirmText: 'Delete', confirmColor: 'warn' } satisfies ConfirmDialogData,
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.userService.deleteUser(user._id).subscribe({
        next: () => {
          this.toast.success('User deleted');
          this.allUsers.update(users => users.filter(u => u._id !== user._id));
          this.applyFilters();
        },
        error: () => this.toast.error('Failed to delete user'),
      });
    });
  }

  private applyFilters(): void {
    let data = [...this.allUsers()];
    const search = this.searchTerm();
    const gender = this.genderFilter();

    if (search) {
      data = data.filter(u =>
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(search) ||
        (u.email ?? '').toLowerCase().includes(search) ||
        (u.phone ?? '').includes(search)
      );
    }
    if (gender) {
      data = data.filter(u => u.gender === gender);
    }

    const field = this.sortField();
    if (field) {
      const dir = this.sortDirection() === 'asc' ? 1 : -1;
      data.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[field] ?? '';
        const vb = (b as unknown as Record<string, unknown>)[field] ?? '';
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        return String(va).localeCompare(String(vb)) * dir;
      });
    }

    this.filteredUsers.set(data);
    if (this.currentPage() >= this.totalPages()) {
      this.currentPage.set(0);
    }
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers({ limit: 200 }).subscribe({
      next: (res) => {
        const users = res.data ?? (res as unknown as User[]);
        this.allUsers.set(Array.isArray(users) ? users : []);
        this.applyFilters();
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load users'); this.loading.set(false); },
    });
  }
}
