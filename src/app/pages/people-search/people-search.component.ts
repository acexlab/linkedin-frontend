import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { User } from '../../services/state.types';

@Component({
  selector: 'app-people-search',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col font-sans text-gray-800">
      
      <!-- NAV BAR (MODIFIED) -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-2 shadow-sm">
        <div class="max-w-[1128px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <!-- Logo & Inputs -->
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <span class="text-[#0A66C2] font-black text-2xl tracking-tight flex items-center cursor-pointer" routerLink="/login">
              Linked<span class="bg-[#0A66C2] text-white px-1 py-0.5 rounded ml-0.5 font-bold text-xl">in</span>
            </span>
            
            <!-- Mini Search Form -->
            <form (ngSubmit)="handleSearch()" class="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                [(ngModel)]="firstName"
                name="firstName"
                placeholder="First Name"
                class="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#0A66C2]"
              />
              <input
                type="text"
                [(ngModel)]="lastName"
                name="lastName"
                placeholder="Last Name"
                class="bg-white border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#0A66C2]"
              />
              <button
                type="submit"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-xs rounded px-3 py-1 transition-colors focus:outline-none cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          <!-- Nav Icons List (Hidden on Mobile) -->
          <nav class="hidden md:flex items-center gap-6 border-r border-gray-200 pr-6">
            <a
              routerLink="/top-content"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span class="text-xs">Top Content</span>
            </a>
            <a
              routerLink="/pub/dir"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span class="text-xs">People</span>
            </a>
            <a
              routerLink="/learning"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4 1.253"/></svg>
              <span class="text-xs">Learning</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span class="text-xs">Jobs</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
              <span class="text-xs">Games</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              <span class="text-xs">Get the app</span>
            </a>
          </nav>

          <!-- Auth Links -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signup'}"
              class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-semibold text-sm rounded-full px-4 py-1.5 transition-colors focus:outline-none cursor-pointer"
            >
              Join now
            </button>
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signin'}"
              class="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 font-semibold text-sm rounded-full px-4 py-1.5 transition-colors focus:outline-none cursor-pointer"
            >
              Sign in
            </button>
          </div>

        </div>
      </header>

      <!-- MAIN LAYOUT -->
      <main class="flex-grow max-w-[1128px] w-full mx-auto px-6 py-12 flex flex-col items-center">
        
        <!-- EMPTY STATE (NO SEARCH DONE) -->
        @if (!hasSearched()) {
          <div class="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-[600px] shadow-sm space-y-6">
            <div class="w-32 h-32 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto border border-gray-100">
              <!-- Inline Flat Vector SVG representing two people connecting -->
              <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-light text-gray-900 leading-tight">
              Try searching for your co-worker, classmate, professor, or friend.
            </h2>
            <p class="text-sm text-gray-500">
              Enter a name in the search boxes above to look up profiles in our directory.
            </p>
          </div>
        } @else {
          <!-- SEARCH RESULTS -->
          <div class="w-full max-w-[800px] space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">
              Search Results ({{ filteredUsers().length }})
            </h2>

            @if (filteredUsers().length === 0) {
              <div class="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500 text-sm">
                No profiles match your search criteria. Try a different name.
              </div>
            } @else {
              <div class="space-y-3">
                @for (user of filteredUsers(); track user.id) {
                  <div class="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between shadow-sm">
                    <div class="flex items-center gap-4">
                      <!-- Mock Avatar -->
                      <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" [style.backgroundColor]="user.avatarColor">
                        {{ user.avatarInitials }}
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900 hover:text-[#0A66C2] hover:underline cursor-pointer" routerLink="/login">
                          {{ user.name }}
                        </h3>
                        <p class="text-xs text-gray-600 mt-0.5">{{ user.headline }}</p>
                        <p class="text-[11px] text-gray-400 mt-0.5">{{ user.location }}</p>
                      </div>
                    </div>
                    
                    <button
                      routerLink="/login"
                      class="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 font-semibold text-xs rounded-full px-4 py-1.5 transition-colors focus:outline-none"
                    >
                      View Profile
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        }

      </main>

      <!-- MINIMAL FOOTER -->
      <footer class="bg-white border-t border-gray-200 py-6 text-center">
        <p class="text-xs text-gray-500">
          LinkedIn Directory &copy; {{ currentYear }} · About · User Agreement · Privacy Policy · Cookie Policy
        </p>
      </footer>

    </div>
  `
})
export class PeopleSearchComponent {
  private readonly stateService = inject(StateService);

  firstName = '';
  lastName = '';

  hasSearched = signal(false);
  currentYear = new Date().getFullYear();

  filteredUsers = computed(() => {
    if (!this.hasSearched()) return [];
    const firstLower = this.firstName.toLowerCase().trim();
    const lastLower = this.lastName.toLowerCase().trim();

    return this.stateService.users().filter(u => {
      const parts = u.name.toLowerCase().split(' ');
      const uFirst = parts[0] || '';
      const uLast = parts[parts.length - 1] || '';

      const matchFirst = !firstLower || uFirst.includes(firstLower);
      const matchLast = !lastLower || uLast.includes(lastLower);
      return matchFirst && matchLast;
    });
  });

  handleSearch() {
    if (this.firstName.trim() || this.lastName.trim()) {
      this.hasSearched.set(true);
    } else {
      this.hasSearched.set(false);
    }
  }
}
