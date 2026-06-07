import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-lg border border-[#E0DFDC] p-8 max-w-md w-full text-center space-y-4 shadow-sm">
        <div class="w-16 h-16 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Page not found</h1>
        <p class="text-sm text-gray-500">We couldn't find the page you were looking for. It might have been moved or deleted.</p>
        <a routerLink="/" class="inline-block bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm rounded-full px-6 py-2 transition-colors">
          Go to Feed
        </a>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
