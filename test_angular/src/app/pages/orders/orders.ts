import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { ClientService } from '../../core/services/client.service';
import { ProductService } from '../../core/services/product.service';
import { Order, OrderStatus, CreateOrderDto } from '../../core/models/order.model';
import { Client } from '../../core/models/client.model';
import { Product } from '../../core/models/product.model';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders = signal<Order[]>([]);
  clients = signal<Client[]>([]);
  products = signal<Product[]>([]);

  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Toast notification state
  toast = signal<Toast | null>(null);

  editingOrderId = signal<number | null>(null);

  orderForm: FormGroup;
  taxRatePercentage = 19.0;

  OrderStatus = OrderStatus;

  statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.Draft]: 'Draft',
    [OrderStatus.Validated]: 'Validated',
    [OrderStatus.Cancelled]: 'Cancelled'
  };

  filteredOrders = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.orders();

    return this.orders().filter(o => {
      const statusText = this.statusLabels[o.status] || '';
      return (
        o.orderNumber.toLowerCase().includes(query) ||
        (o.clientName && o.clientName.toLowerCase().includes(query)) ||
        statusText.toLowerCase().includes(query)
      );
    });
  });

  constructor(
    private orderService: OrderService,
    private clientService: ClientService,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      clientId: ['', Validators.required],
      orderLines: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get orderLines(): FormArray {
    return this.orderForm.get('orderLines') as FormArray;
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toast.set({ message, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 4000);
  }

  loadData(): void {
    this.isLoading.set(true);
    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load orders');
        this.isLoading.set(false);
      }
    });

    this.clientService.getAll().subscribe(data => this.clients.set(data));
    this.productService.getAll().subscribe(data => this.products.set(data));
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  // --- Navigation & Workflow Actions ---

  viewDetails(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  validateOrder(id: number): void {
    if (!confirm('Validate this order? Stock will be updated and order locked.')) return;

    this.orderService.validate(id).subscribe({
      next: () => {
        this.productService.getAll().subscribe(data => this.products.set(data));
        this.orders.update(list =>
          list.map(o => o.id === id ? { ...o, status: OrderStatus.Validated } : o)
        );
        this.showToast('Sales order validated successfully!');
      },
      error: (err) => this.showToast(err.error?.message || 'Failed to validate order', 'error')
    });
  }

  cancelOrder(id: number): void {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.orderService.cancel(id).subscribe({
      next: () => {
        this.orders.update(list =>
          list.map(o => o.id === id ? { ...o, status: OrderStatus.Cancelled } : o)
        );
        this.showToast('Sales order cancelled.', 'error');
      },
      error: (err) => this.showToast(err.error?.message || 'Failed to cancel order', 'error')
    });
  }

  deleteOrder(id: number): void {
    if (!confirm('Permanently delete this order record?')) return;

    this.orderService.delete(id).subscribe({
      next: () => {
        this.orders.update(list => list.filter(o => o.id !== id));
        this.showToast('Sales order deleted.');
      },
      error: (err) => this.showToast(err.error?.message || 'Failed to delete order', 'error')
    });
  }

  // --- Form & Line Item Stock Helpers ---

  createLineFormGroup(productId: number | string = '', quantity: number = 1, unitPriceHT: number = 0): FormGroup {
    return this.fb.group({
      productId: [productId, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPriceHT: [{ value: unitPriceHT, disabled: true }]
    });
  }

  addOrderLine(): void {
    this.orderLines.push(this.createLineFormGroup());
  }

  removeOrderLine(index: number): void {
    this.orderLines.removeAt(index);
  }

  onProductSelect(index: number): void {
    const lineGroup = this.orderLines.at(index) as FormGroup;
    const selectedProductId = Number(lineGroup.get('productId')?.value);
    const product = this.products().find(p => p.id === selectedProductId);

    if (product) {
      lineGroup.patchValue({ unitPriceHT: product.unitPriceHT });
    }
  }

  getAvailableStock(index: number): number | null {
    const lineGroup = this.orderLines.at(index);
    const productId = Number(lineGroup?.get('productId')?.value);
    if (!productId) return null;
    const product = this.products().find(p => p.id === productId);
    return product ? product.stockQuantity : null;
  }

  isStockExceeded(index: number): boolean {
    const lineGroup = this.orderLines.at(index);
    const qty = Number(lineGroup?.get('quantity')?.value) || 0;
    const availableStock = this.getAvailableStock(index);

    if (availableStock === null) return false;
    return qty > availableStock;
  }

  // Validation helpers for template display
  isFieldInvalid(controlName: string): boolean {
    const control = this.orderForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isLineFieldInvalid(index: number, controlName: string): boolean {
    const lineGroup = this.orderLines.at(index) as FormGroup;
    const control = lineGroup.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  calculateLineTotal(index: number): number {
    const lineGroup = this.orderLines.at(index);
    const qty = Number(lineGroup?.get('quantity')?.value) || 0;
    const unitPrice = Number(lineGroup?.get('unitPriceHT')?.value) || 0;
    return qty * unitPrice;
  }

  calculateSubtotal(): number {
    return this.orderLines.controls.reduce((sum, _, index) => {
      return sum + this.calculateLineTotal(index);
    }, 0);
  }

  calculateVAT(): number {
    return this.calculateSubtotal() * (this.taxRatePercentage / 100);
  }

  calculateTotalTTC(): number {
    return this.calculateSubtotal() + this.calculateVAT();
  }

  hasAnyStockError(): boolean {
    return this.orderLines.controls.some((_, index) => this.isStockExceeded(index));
  }

  openCreateModal(): void {
    this.editingOrderId.set(null);
    this.orderForm.reset();
    this.orderLines.clear();
    this.addOrderLine();
    this.errorMessage.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(order: Order): void {
    this.editingOrderId.set(order.id);
    this.errorMessage.set(null);
    this.orderLines.clear();

    if (order.orderLines && order.orderLines.length > 0) {
      order.orderLines.forEach(line => {
        this.orderLines.push(this.createLineFormGroup(line.productId, line.quantity, line.unitPrice));
      });
    } else {
      this.addOrderLine();
    }

    this.orderForm.patchValue({
      clientId: order.clientId
    });

    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingOrderId.set(null);
  }

  onSubmit(): void {
    if (this.orderForm.invalid || this.orderLines.length === 0) {
      this.orderForm.markAllAsTouched();
      this.errorMessage.set('Please fill out all required fields marked in red.');
      return;
    }

    if (this.hasAnyStockError()) {
      this.errorMessage.set('One or more order lines exceed available product stock.');
      return;
    }

    this.isSubmitting.set(true);
    const rawValues = this.orderForm.getRawValue();

    const dto: CreateOrderDto = {
      clientId: Number(rawValues.clientId),
      taxRatePercentage: this.taxRatePercentage,
      orderLines: rawValues.orderLines.map((line: any) => ({
        productId: Number(line.productId),
        quantity: Number(line.quantity)
      }))
    };

    const currentId = this.editingOrderId();

    if (currentId) {
      this.orderService.update(currentId, dto).subscribe({
        next: (updatedOrder) => {
          this.orders.update(list =>
            list.map(o => o.id === currentId ? (updatedOrder || { ...o, ...dto }) : o)
          );
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Sales order updated successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error updating order');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.orderService.create(dto).subscribe({
        next: (newOrder) => {
          this.orders.update(list => [newOrder, ...list]);
          this.isSubmitting.set(false);
          this.closeModal();
          this.showToast('Sales order created successfully!');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Error creating order');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}