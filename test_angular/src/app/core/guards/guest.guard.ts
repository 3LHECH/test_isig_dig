import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.isAuthLoaded).pipe(
        filter(loaded => loaded),
        take(1),
        map(() => {
            if (authService.isAuthenticated()) {
                return router.createUrlTree(['/']);
            }

            return true;
        })
    );
};