import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { UserService } from '../../core/services/user.service';
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
  template: `
    <app-page-header title="Users" subtitle="Manage customer accounts" />

    <div class="card mb-6">
      <div class="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div class="flex-1">
          <app-search-input placeholder="Search users..." (searchChange)="onSearch($event)" />
        </div>
        <select class="filter-select w-40" (change)="onGenderFilter($any($event.target).value)">
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (filteredUsers().length === 0 && allUsers().length === 0) {
      <div class="card">
        <app-empty-state icon="people" title="No users found" message="Users will appear here when they register." />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th class="sortable" (click)="toggleSort('firstName')"
                    [class.sort-active]="sortField() === 'firstName'">
                  Name
                  <span class="material-icons sort-icon">{{ getSortIcon('firstName') }}</span>
                </th>
                <th>Phone</th>
                <th>Gender</th>
                <th class="sortable" (click)="toggleSort('totalSpent')"
                    [class.sort-active]="sortField() === 'totalSpent'">
                  Total Spent
                  <span class="material-icons sort-icon">{{ getSortIcon('totalSpent') }}</span>
                </th>
                <th class="sortable" (click)="toggleSort('createdAt')"
                    [class.sort-active]="sortField() === 'createdAt'">
                  Joined
                  <span class="material-icons sort-icon">{{ getSortIcon('createdAt') }}</span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (user of paginatedUsers(); track user._id) {
                <tr>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                  bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                        {{ (user.firstName ?? 'U').charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <p class="text-sm font-medium" style="color: var(--color-text)">
                          {{ user.firstName ?? '' }} {{ user.lastName ?? '' }}
                        </p>
                        <p class="text-xs" style="color: var(--color-text-muted)">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-secondary)">{{ user.phone ?? '-' }}</span>
                  </td>
                  <td>
                    <span class="text-sm capitalize" style="color: var(--color-text-secondary)">{{ user.gender ?? '-' }}</span>
                  </td>
                  <td>
                    <span class="text-sm font-medium" style="color: var(--color-text)">{{ user.totalSpent | currencyInr }}</span>
                  </td>
                  <td>
                    <span class="text-sm" style="color: var(--color-text-muted)">{{ user.createdAt | relativeTime }}</span>
                  </td>
                  <td>
                    <div class="relative">
                      <button class="btn-icon" (click)="toggleMenu(user._id)">
                        <span class="material-icons">more_vert</span>
                      </button>
                      @if (openMenuId() === user._id) {
                        <div class="dropdown-menu">
                          <button (click)="viewUser(user); closeMenu()">
                            <span class="material-icons text-lg">visibility</span> View
                          </button>
                          @if (!user.isAdmin) {
                            <button (click)="makeAdmin(user); closeMenu()">
                              <span class="material-icons text-lg">admin_panel_settings</span> Make Admin
                            </button>
                          } @else {
                            <button (click)="removeAdmin(user); closeMenu()">
                              <span class="material-icons text-lg">person</span> Remove Admin
                            </button>
                          }
                          <hr />
                          <button class="text-red-500" (click)="deleteUser(user); closeMenu()">
                            <span class="material-icons text-lg">delete</span> Delete
                          </button>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="text-center py-8 text-sm" style="color: var(--color-text-muted)">
                    No matching users
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <div class="flex items-center gap-3">
            <span>Rows per page:</span>
            <select [value]="pageSize()" (change)="pageSize.set(+$any($event.target).value); currentPage.set(0)">
              <option [value]="10">10</option>
              <option [value]="25">25</option>
              <option [value]="50">50</option>
            </select>
            <span>{{ paginationLabel() }}</span>
          </div>
          <div class="pagination-controls">
            <button [disabled]="currentPage() === 0" (click)="currentPage.set(0)">
              <span class="material-icons text-sm">first_page</span>
            </button>
            <button [disabled]="currentPage() === 0" (click)="currentPage.update(p => p - 1)">
              <span class="material-icons text-sm">chevron_left</span>
            </button>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="currentPage.update(p => p + 1)">
              <span class="material-icons text-sm">chevron_right</span>
            </button>
            <button [disabled]="currentPage() >= totalPages() - 1" (click)="currentPage.set(totalPages() - 1)">
              <span class="material-icons text-sm">last_page</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UserListComponent implements OnInit {
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

  ngOnInit(): void { this.loadUsers(); }

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
