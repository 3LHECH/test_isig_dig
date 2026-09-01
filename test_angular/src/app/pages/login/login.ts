import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);

        // EF / ASP.NET Validation Errors Object
        if (err?.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          const firstError = err.error.errors[firstKey]?.[0];
          this.errorMessage.set(firstError || 'Invalid login attempt.');
          return;
        }

        // Direct String Response (e.g. Unauthorized "Invalid credentials")
        if (typeof err?.error === 'string') {
          this.errorMessage.set(err.error);
          return;
        }

        // Standard Error Object Response
        if (err?.error?.message) {
          this.errorMessage.set("a user with that email do exist");
          return;
        }

        // HTTP Status Fallback
        if (err?.status === 401) {
          this.errorMessage.set('Invalid email or password.');
          return;
        }

        this.errorMessage.set('An error occurred during sign in. Please try again.');
      }
    });
  }
}