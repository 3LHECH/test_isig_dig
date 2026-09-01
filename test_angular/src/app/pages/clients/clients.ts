import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client.service';
import { Client, CreateClientDto, UpdateClientDto } from '../../core/models/client.model';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css'
})
export class Clients implements OnInit {
  clients = signal<Client[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Toast state signal
  toast = signal<Toast | null>(null);

  selectedClient = signal<Client | null>(null);
  editingClientId = signal<number | null>(null);

  clientForm: FormGroup;

  filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.clients();

    return this.clients().filter(c =>
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });

  constructor(
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      address: ['', Validators.required],
      password: ['']
    });
  }

  ngOnInit(): void {
    this.loadClients();
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clients.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load clients');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  openViewModal(client: Client): void {
    this.selectedClient.set(client);
  }

  closeViewModal(): void {
    this.selectedClient.set(null);
  }

  switchEditFromView(client: Client): void {
    this.closeViewModal();
    this.openEditModal(client);
  }

  openAddModal(): void {
    this.editingClientId.set(null);
    this.clientForm.reset();
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(client: Client): void {
    this.editingClientId.set(client.id);
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      password: ''
    });
    this.clientForm.get('password')?.setValidators([Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingClientId.set(null);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.errorMessage.set('Please check all fields and fill required information correctly.');
      return;
    }

    this.isSubmitting.set(true);
    const currentId = this.editingClientId();

    if (currentId) {
      const updatePayload: UpdateClientDto = {
        firstName: this.clientForm.value.firstName,
        lastName: this.clientForm.value.lastName,
        email: this.clientForm.value.email,
        phone: this.clientForm.value.phone,
        address: this.clientForm.value.address,
        password: this.clientForm.value.password || undefined
      };

      this.clientService.update(currentId, updatePayload).subscribe({
        next: () => {
          this.loadClients();
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Client updated successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error updating client');
          this.isSubmitting.set(false);
        }
      });
    } else {
      const dto: CreateClientDto = this.clientForm.value;

      this.clientService.create(dto).subscribe({
        next: (newClient) => {
          this.clients.update(list => [...list, newClient]);
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Client created successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error creating client');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteClient(id: number): void {
    if (!confirm('Are you sure you want to delete this client?')) return;

    this.clientService.delete(id).subscribe({
      next: () => {
        this.clients.update(list => list.filter(c => c.id !== id));
        this.showToast('Client deleted successfully!');
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to delete client', 'error');
      }
    });
  }
}