import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { authGuard, guestGuard } from './auth.guard';
import { StateService } from '../services/state.service';
import { Router } from '@angular/router';

describe('AuthGuards', () => {
  let mockStateService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockStateService = {
      currentUser: signal<any>(null)
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: StateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  describe('authGuard', () => {
    it('should return true if user is logged in', () => {
      mockStateService.currentUser.set({ id: 'u1', name: 'Alex' });
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should navigate to login and return false if user is not logged in', () => {
      mockStateService.currentUser.set(null);
      const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('guestGuard', () => {
    it('should return true if user is not logged in', () => {
      mockStateService.currentUser.set(null);
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should navigate to home and return false if user is logged in', () => {
      mockStateService.currentUser.set({ id: 'u1', name: 'Alex' });
      const result = TestBed.runInInjectionContext(() => guestGuard({} as any, {} as any));
      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
