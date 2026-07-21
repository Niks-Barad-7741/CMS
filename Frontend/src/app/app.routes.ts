import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { clientGuard } from './core/guards/client.guard';

function isTenantSite(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const reservedSlugs = ['admin', 'www', 'api', 'app'];
  
  if (parts.length <= 1 || (parts.length === 2 && parts[1] === 'localhost' && reservedSlugs.includes(parts[0]))) {
    return false;
  }
  
  const slug = parts[0];
  return !(reservedSlugs.includes(slug.toLowerCase()) || slug === 'localhost');
}

export const routes: Routes = isTenantSite() 
  ? [
      // Public Site Routes
      { path: '', loadChildren: () => import('./features/site/site.routes').then(m => m.SITE_ROUTES) }
    ] 
  : [
      // Admin / Auth Routes
      { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
      { path: 'admin', loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
        canActivate: [clientGuard] 
      },
      { 
        path: 'home', 
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent),
        canActivate: [clientGuard]
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'home' }
    ];
