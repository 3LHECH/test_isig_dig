import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { UserLogin, AuthResponse, UserRegisterDto } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly apiUrl = 'http://localhost:5065/api/Auth';

    // Current authentication state
    isAuthenticated = signal<boolean>(false);

    // Tracks whether the initial authentication check has completed
    isAuthLoaded = signal<boolean>(false);

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        // Check authentication when the application starts
        this.checkAuthStatus().subscribe();
    }

    checkAuthStatus(): Observable<boolean> {
        return this.http
            .get<boolean>(
                `${this.apiUrl}/status`,
                {
                    withCredentials: true
                }
            )
            .pipe(
                tap((isLoggedIn) => {
                    this.isAuthenticated.set(isLoggedIn);
                    this.isAuthLoaded.set(true);
                }),

                catchError((error) => {
                    console.error(
                        'Auth status check failed:',
                        error
                    );

                    this.isAuthenticated.set(false);
                    this.isAuthLoaded.set(true);

                    return of(false);
                })
            );
    }

    login(credentials: UserLogin): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
                withCredentials: true
            })
            .pipe(
                tap(() => {
                    this.isAuthenticated.set(true);
                    this.isAuthLoaded.set(true); // Ensure guard knows state is resolved
                })
            );
    }

    logout(): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(
                `${this.apiUrl}/logout`,
                {},
                {
                    withCredentials: true
                }
            )
            .pipe(
                tap(() => {
                    this.isAuthenticated.set(false);
                    this.router.navigate(['/login']);
                })
            );
    }


}