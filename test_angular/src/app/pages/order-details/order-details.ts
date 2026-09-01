import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css'
})
export class OrderDetails implements OnInit {
  order = signal<Order | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  isActionLoading = signal<boolean>(false);

  OrderStatus = OrderStatus;

  statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.Draft]: 'Draft',
    [OrderStatus.Validated]: 'Validated',
    [OrderStatus.Cancelled]: 'Cancelled'
  };

  // Tax calculation helper if not present directly on order model
  taxRatePercentage = 19.0;

  subtotalHT = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    if (currentOrder.totalHT !== undefined) return currentOrder.totalHT;
    return (currentOrder.orderLines || []).reduce((sum, line) => sum + (line.lineTotal || (line.quantity * line.unitPrice)), 0);
  });

  vatAmount = computed(() => {
    return this.subtotalHT() * (this.taxRatePercentage / 100);
  });

  totalTTC = computed(() => {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    if (currentOrder.totalTTC !== undefined) return currentOrder.totalTTC;
    return this.subtotalHT() + this.vatAmount();
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.fetchOrderDetails(Number(idParam));
    } else {
      this.errorMessage.set('Invalid Order ID');
      this.isLoading.set(false);
    }
  }

  fetchOrderDetails(id: number): void {
    this.isLoading.set(true);
    this.orderService.getById(id).subscribe({
      next: (data) => {
        this.order.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to fetch order details.');
        this.isLoading.set(false);
      }
    });
  }

  validateOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder || !confirm('Validate this order? Stock will be updated and order locked.')) return;

    this.isActionLoading.set(true);
    this.orderService.validate(currentOrder.id).subscribe({
      next: () => {
        this.order.update(o => o ? { ...o, status: OrderStatus.Validated } : null);
        this.isActionLoading.set(false);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to validate order');
        this.isActionLoading.set(false);
      }
    });
  }

  cancelOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder || !confirm('Are you sure you want to cancel this order?')) return;

    this.isActionLoading.set(true);
    this.orderService.cancel(currentOrder.id).subscribe({
      next: () => {
        this.order.update(o => o ? { ...o, status: OrderStatus.Cancelled } : null);
        this.isActionLoading.set(false);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to cancel order');
        this.isActionLoading.set(false);
      }
    });
  }

  deleteOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder || !confirm('Permanently delete this order record?')) return;

    this.isActionLoading.set(true);
    this.orderService.delete(currentOrder.id).subscribe({
      next: () => {
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to delete order');
        this.isActionLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.location.back();
  }
}