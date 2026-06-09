import { Component, inject, computed, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MiniMessagingComponent } from './components/mini-messaging/mini-messaging.component';
import { StateService } from './services/state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, MiniMessagingComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly currentUser = this.stateService.currentUser;

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        // Onboarding check
        if (this.stateService.needsOnboarding()) {
          const url = this.router.url;
          if (!url.startsWith('/profile/') || !url.includes('setup=true')) {
            this.router.navigate(['/profile', user.id], { queryParams: { setup: 'true' } });
            return;
          }
        }

        const url = this.router.url;
        if (user.role === 'admin' && !url.startsWith('/admin')) {
          this.router.navigate(['/admin']);
        } else if (user.role === 'business' && !url.startsWith('/business')) {
          this.router.navigate(['/business']);
        } else if (user.role === 'candidate' && (url.startsWith('/admin') || url.startsWith('/business'))) {
          this.router.navigate(['/']);
        }
      }
    }, { allowSignalWrites: true });
  }
}
