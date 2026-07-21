import { Routes } from '@angular/router';

export const SITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./public-layout/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: ':pageSlug',
        loadComponent: () => import('./page-viewer/page-viewer').then(m => m.PageViewerComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];
