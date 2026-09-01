import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, CreateClientDto, UpdateClientDto } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
    private readonly apiUrl = 'http://localhost:5065/api/Clients';

    constructor(private http: HttpClient) { }

    getAll(): Observable<Client[]> {
        return this.http.get<Client[]>(this.apiUrl, { withCredentials: true });
    }

    getById(id: number): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }

    create(dto: CreateClientDto): Observable<Client> {
        return this.http.post<Client>(this.apiUrl, dto, { withCredentials: true });
    }

    update(id: number, dto: UpdateClientDto): Observable<Client> {
        return this.http.put<Client>(`${this.apiUrl}/${id}`, dto, { withCredentials: true });
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}