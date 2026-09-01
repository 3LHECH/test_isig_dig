import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product, CreateProductDto } from '../../core/models/product.model';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products = signal<Product[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Toast state
  toast = signal<Toast | null>(null);

  // Tracks product currently being viewed (null = View modal closed)
  selectedProduct = signal<Product | null>(null);

  // Tracks the ID of the product currently being edited (null = Add Mode)
  editingProductId = signal<number | null>(null);

  productForm: FormGroup;

  filteredProducts = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.products();

    return this.products().filter(p =>
      p.reference.toLowerCase().includes(query) ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  });

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      reference: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      unitPriceHT: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  openViewModal(product: Product): void {
    this.selectedProduct.set(product);
  }

  closeViewModal(): void {
    this.selectedProduct.set(null);
  }

  switchEditFromView(product: Product): void {
    this.closeViewModal();
    this.openEditModal(product);
  }

  openAddModal(): void {
    this.editingProductId.set(null);
    this.productForm.reset({ unitPriceHT: 0, stockQuantity: 0 });
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      reference: product.reference,
      name: product.name,
      description: product.description,
      unitPriceHT: product.unitPriceHT,
      stockQuantity: product.stockQuantity
    });
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProductId.set(null);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.productForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.errorMessage.set('Please fill out all required fields properly.');
      return;
    }

    this.isSubmitting.set(true);
    const dto: CreateProductDto = this.productForm.value;
    const currentId = this.editingProductId();

    if (currentId) {
      this.productService.update(currentId, dto).subscribe({
        next: () => {
          this.products.update(list =>
            list.map(p => (p.id === currentId ? { ...p, ...dto } : p))
          );
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Product updated successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error updating product');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.productService.create(dto).subscribe({
        next: (newProduct) => {
          this.products.update(list => [...list, newProduct]);
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Product added successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error creating product');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== id));
        this.showToast('Product deleted successfully!');
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to delete product', 'error');
      }
    });
  }
}