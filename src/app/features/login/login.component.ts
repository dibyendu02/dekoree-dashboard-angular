import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
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
            <div class="form-field mb-5">
              <label for="identifier">Email or Phone</label>
              <input
                id="identifier"
                formControlName="identifier"
                placeholder="admin&#64;dekoree.com"
              />
              @if (form.get('identifier')?.hasError('required') && form.get('identifier')?.touched) {
                <span class="form-error">Email or phone is required</span>
              }
            </div>

            <div class="form-field mb-6">
              <label for="password">Password</label>
              <div class="relative">
                <input
                  id="password"
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2"
                  style="color: var(--color-text-muted)"
                  (click)="showPassword.update(v => !v)"
                >
                  <span class="material-icons text-xl">
                    {{ showPassword() ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <span class="form-error">Password is required</span>
              }
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full h-12 text-base rounded-lg"
              [disabled]="auth.loading()"
            >
              @if (auth.loading()) {
                <span class="spinner w-5 h-5 border-white/30 border-t-white mr-2"></span>
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
