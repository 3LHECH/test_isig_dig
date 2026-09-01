import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderDto } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly apiUrl = 'http://localhost:5065/api/Orders';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl, { withCredentials: true });
    }

    getById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(dto: CreateOrderDto): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, dto, { withCredentials: true });
    }

    update(id: number, dto: CreateOrderDto): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
    }

    validate(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/validate`, {}, { withCredentials: true });
    }

    cancel(id: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {}, { withCredentials: true });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}