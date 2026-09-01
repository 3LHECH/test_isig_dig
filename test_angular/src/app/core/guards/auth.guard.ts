import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return toObservable(authService.isAuthLoaded).pipe(
        filter(loaded => loaded),
        take(1),
        map(() => {
            console.log("111111111111111111111")
            console.log(authService.isAuthLoaded())
            console.log("authenticated   " + authService.isAuthenticated())
            if (authService.isAuthenticated()) {
                return true;
            }


            return router.createUrlTree(['/login']);
        })
    );
};