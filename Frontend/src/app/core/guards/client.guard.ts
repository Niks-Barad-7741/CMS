import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // Bypass guard on server to prevent SSR redirect loop
  }

  // Client guard allows BOTH Admin and Client, as Admin needs to be able to edit pages/media too.
  if (authService.isLoggedIn() && (authService.getRole() === 'Client' || authService.getRole() === 'Admin')) {
    return true;
  }
  
  return router.parseUrl('/login');
};
