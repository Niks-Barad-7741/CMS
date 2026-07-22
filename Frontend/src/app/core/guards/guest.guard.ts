import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // Bypass guard on server
  }

  // If the user is logged in, redirect them to their respective dashboard
  if (authService.isLoggedIn()) {
    const role = authService.getRole();
    if (role === 'Admin') {
      return router.parseUrl('/admin');
    }
    return router.parseUrl('/dashboard');
  }
  
  return true;
};
