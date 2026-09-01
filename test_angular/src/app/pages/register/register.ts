import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClientService } from '../../core/services/client.service';
import { CreateClientDto } from '../../core/models/client.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
    address: ['']
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.registerForm.getRawValue();

    const dto: CreateClientDto = {
      firstName: formValues.firstName!,
      lastName: formValues.lastName!,
      email: formValues.email!,
      password: formValues.password!,
      phone: formValues.phone ?? '',
      address: formValues.address ?? ''
    };

    this.clientService.create(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);

        // EF Core Model Validation Errors
        if (err?.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          const firstError = err.error.errors[firstKey]?.[0];
          this.errorMessage.set(firstError || 'Validation error occurred.');
          return;
        }

        // Direct String Error Response
        if (typeof err?.error === 'string') {
          this.errorMessage.set(err.error);
          return;
        }

        // Standard Error Object with Message
        if (err?.error?.message) {
          this.errorMessage.set(err.error.message);
          return;
        }

        this.errorMessage.set('Failed to create client account.');
      }
    });
  }
}