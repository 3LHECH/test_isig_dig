export enum OrderStatus {
    Draft = 0,
    Validated = 1,
    Cancelled = 2
}

export interface OrderLine {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface Order {
    id: number;
    orderNumber: string;
    orderDate: string;
    status: OrderStatus;
    totalHT: number;
    totalTTC: number;
    clientId: number;
    clientName: string;
    orderLines: OrderLine[];
}

export interface CreateOrderLineDto {
    productId: number;
    quantity: number;
}

export interface CreateOrderDto {
    clientId: number;
    orderLines: CreateOrderLineDto[];
    taxRatePercentage?: number;
}