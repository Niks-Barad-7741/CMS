import { Routes } from '@angular/router';
import { adminGuard } from './core/services/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { 
    path: 'admin', 
    canActivate: [adminGuard],
    // For now, load a placeholder component or the login component just to test the route
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
