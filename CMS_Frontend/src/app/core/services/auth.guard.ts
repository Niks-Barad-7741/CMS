import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    // Optionally, check if user has Admin role here
    // const role = authService.getUserRole();
    // if (role === 'Admin') return true;
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
