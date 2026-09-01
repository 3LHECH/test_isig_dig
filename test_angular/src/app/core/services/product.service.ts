import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, CreateProductDto } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly apiUrl = 'http://localhost:5065/api/Products';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl, { withCredentials: true });
    }

    getById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(dto: CreateProductDto): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, dto, { withCredentials: true });
    }

    update(id: number, dto: CreateProductDto): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}