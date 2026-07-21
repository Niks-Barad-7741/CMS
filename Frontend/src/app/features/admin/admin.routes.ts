import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { clientGuard } from '../../core/guards/client.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/layouts/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [clientGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../pages/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      // Admin only routes
      {
        path: 'organizations',
        canActivate: [adminGuard],
        loadComponent: () => import('./organizations/organizations').then(m => m.OrganizationsComponent)
      },
      {
        path: 'users',
        canActivate: [adminGuard],
        loadComponent: () => import('./users/users').then(m => m.UsersComponent)
      },
      {
        path: 'menus',
        canActivate: [adminGuard],
        loadComponent: () => import('./menus/menus').then(m => m.MenusComponent)
      },
      // Client/Admin routes
      {
        path: 'pages',
        loadComponent: () => import('./pages/pages').then(m => m.PagesComponent)
      },
      {
        path: 'media',
        loadComponent: () => import('./media/media').then(m => m.MediaComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
