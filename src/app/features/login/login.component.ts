import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div
      class="min-h-screen flex items-center justify-center p-4"
      style="background: var(--color-surface-alt)"
    >
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div
            class="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4"
          >
            <span class="text-white font-bold text-2xl">D</span>
          </div>
          <h1 class="text-2xl font-bold" style="color: var(--color-text)">Welcome back</h1>
          <p class="text-sm mt-1" style="color: var(--color-text-secondary)">
            Sign in to your admin dashboard
          </p>
        </div>

        <!-- Form -->
        <div class="card p-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="w-full mb-2">
              <mat-label>Email or Phone</mat-label>
              <input matInput formControlName="identifier" placeholder="admin@dekoree.com" />
              @if (form.get('identifier')?.hasError('required') && form.get('identifier')?.touched) {
                <mat-error>Email or phone is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-full mb-4">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                placeholder="Enter your password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="showPassword.update(v => !v)"
              >
                <span class="material-icons text-xl" style="color: var(--color-text-muted)">
                  {{ showPassword() ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="w-full !h-12 !text-base !rounded-lg"
              [disabled]="auth.loading()"
            >
              @if (auth.loading()) {
                <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                Signing in...
              } @else {
                Sign in
              }
            </button>
          </form>
        </div>

        <p class="text-center text-xs mt-6" style="color: var(--color-text-muted)">
          Dekoree Admin Panel &middot; Secure Access
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const success = await this.auth.login(this.form.getRawValue());
    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
