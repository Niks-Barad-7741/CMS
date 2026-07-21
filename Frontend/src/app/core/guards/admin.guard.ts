import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // Bypass guard on server to prevent SSR redirect loop
  }

  if (authService.isLoggedIn() && authService.getRole() === 'Admin') {
    return true;
  }
  
  return router.parseUrl('/login');
};
