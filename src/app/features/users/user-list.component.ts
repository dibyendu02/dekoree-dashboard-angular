import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models';
import { UserDetailComponent } from './user-detail.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
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
      <div class="p-4 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <app-search-input placeholder="Search users..." (searchChange)="onSearch($event)" />
        </div>
        <mat-form-field appearance="outline" class="!w-40">
          <mat-label>Gender</mat-label>
          <mat-select (selectionChange)="onGenderFilter($event.value)">
            <mat-option value="">All</mat-option>
            <mat-option value="male">Male</mat-option>
            <mat-option value="female">Female</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>

    @if (loading()) {
      <app-skeleton-loader type="table" [count]="8" />
    } @else if (dataSource.data.length === 0) {
      <div class="card">
        <app-empty-state icon="people" title="No users found" message="Users will appear here when they register." />
      </div>
    } @else {
      <div class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let user">
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
            </ng-container>

            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let user">
                <span class="text-sm" style="color: var(--color-text-secondary)">{{ user.phone ?? '-' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="gender">
              <th mat-header-cell *matHeaderCellDef>Gender</th>
              <td mat-cell *matCellDef="let user">
                <span class="text-sm capitalize" style="color: var(--color-text-secondary)">{{ user.gender ?? '-' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="totalSpent">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Total Spent</th>
              <td mat-cell *matCellDef="let user">
                <span class="text-sm font-medium" style="color: var(--color-text)">{{ user.totalSpent | currencyInr }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
              <td mat-cell *matCellDef="let user">
                <span class="text-sm" style="color: var(--color-text-muted)">{{ user.createdAt | relativeTime }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let user">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <span class="material-icons">more_vert</span>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="viewUser(user)">
                    <span class="material-icons mr-2">visibility</span> View
                  </button>
                  @if (!user.isAdmin) {
                    <button mat-menu-item (click)="makeAdmin(user)">
                      <span class="material-icons mr-2">admin_panel_settings</span> Make Admin
                    </button>
                  } @else {
                    <button mat-menu-item (click)="removeAdmin(user)">
                      <span class="material-icons mr-2">person</span> Remove Admin
                    </button>
                  }
                  <hr style="border-color: var(--color-border)" />
                  <button mat-menu-item (click)="deleteUser(user)" class="!text-red-500">
                    <span class="material-icons mr-2">delete</span> Delete
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns" class="cursor-pointer"></tr>
          </table>
        </div>
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="20" showFirstLastButtons></mat-paginator>
      </div>
    }
  `,
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(true);
  readonly displayedColumns = ['name', 'phone', 'gender', 'totalSpent', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) { if (p) this.dataSource.paginator = p; }
  @ViewChild(MatSort) set sort(s: MatSort) { if (s) this.dataSource.sort = s; }

  ngOnInit(): void { this.loadUsers(); }

  onSearch(term: string): void {
    this.dataSource.filter = term.trim().toLowerCase();
  }

  onGenderFilter(gender: string): void {
    if (!gender) { this.dataSource.filter = ''; return; }
    this.dataSource.filterPredicate = (data) => data.gender === gender;
    this.dataSource.filter = gender;
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
        next: () => { this.toast.success('User deleted'); this.dataSource.data = this.dataSource.data.filter(u => u._id !== user._id); },
        error: () => this.toast.error('Failed to delete user'),
      });
    });
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers({ limit: 200 }).subscribe({
      next: (res) => {
        const users = res.data ?? (res as unknown as User[]);
        this.dataSource.data = Array.isArray(users) ? users : [];
        this.loading.set(false);
      },
      error: () => { this.toast.error('Failed to load users'); this.loading.set(false); },
    });
  }
}
