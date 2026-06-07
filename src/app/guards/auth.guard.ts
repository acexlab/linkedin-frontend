import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StateService } from '../services/state.service';

export const authGuard: CanActivateFn = () => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (stateService.currentUser()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const stateService = inject(StateService);
  const router = inject(Router);

  if (!stateService.currentUser()) {
    return true;
  }
  router.navigate(['/']);
  return false;
};
