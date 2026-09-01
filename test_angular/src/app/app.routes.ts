import { Routes } from '@angular/router';

import { Home } from './pages/home/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Clients } from './pages/clients/clients';
import { Products } from './pages/products/products';
import { Orders } from './pages/orders/orders';

import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { OrderDetails } from './pages/order-details/order-details';

export const routes: Routes = [
    {
        path: '',
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: 'login',
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: 'register',
        component: Register,
        canActivate: [guestGuard]
    },
    {
        path: 'clients',
        component: Clients,
        canActivate: [authGuard]
    },
    {
        path: 'products',
        component: Products,
        canActivate: [authGuard]
    },
    {
        path: 'orders',
        component: Orders,
        canActivate: [authGuard]
    },
    { path: 'orders/:id', component: OrderDetails, canActivate: [authGuard] },
    { path: '**', redirectTo: '' }
];