import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenService } from '../services/token';

export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const token = tokenService.getToken();

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};