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
      {
        path: 'client-dashboard',
        canActivate: [adminGuard],
        loadComponent: () => import('./client-dashboard/client-dashboard.component').then(m => m.ClientDashboardComponent)
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
      {
        path: 'pages',
        loadComponent: () => import('./pages/pages').then(m => m.PagesComponent)
      },
      {
        path: 'pages/builder/:id',
        loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent)
      },
      {
        path: 'page-editor/:orgId/:pageId',
        loadComponent: () => import('./page-editor/page-editor.component').then(m => m.PageEditorComponent)
      },
      {
        path: 'static-builder/:orgId/:pageId',
        loadComponent: () => import('./static-builder/static-builder.component').then(m => m.StaticBuilderComponent)
      },
      {
        path: 'figma-builder/:orgId/:pageId',
        loadComponent: () => import('./figma-builder/figma-builder.component').then(m => m.FigmaBuilderComponent)
      },
      {
        path: 'site-builder/:orgId/:pageId',
        loadComponent: () => import('./site-builder/components/site-builder-shell/site-builder-shell.component').then(m => m.SiteBuilderShellComponent)
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
