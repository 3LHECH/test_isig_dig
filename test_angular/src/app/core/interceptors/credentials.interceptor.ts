// src/app/core/interceptors/credentials.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    const authReq = req.clone({
        withCredentials: true
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const isStatusEndpoint = req.url.includes('/api/Auth/status');
            console.log("isstatusEndpoind" + isStatusEndpoint)
            if (error.status === 401 && !isStatusEndpoint) {
                authService.isAuthenticated.set(false);
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};