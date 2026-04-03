import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
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
