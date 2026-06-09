import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-xs">
      <div class="max-w-[1128px] mx-auto px-4 flex items-center h-[52px] gap-2">
        @if (currentUser()?.role === 'admin' || currentUser()?.role === 'business') {
          <div class="flex items-center gap-2">
            <div class="flex-shrink-0 w-9 h-9 bg-[#0A66C2] rounded flex items-center justify-center mr-1">
              <span class="text-white font-bold text-xl leading-none" style="font-family: Georgia, serif">in</span>
            </div>
            <span class="text-slate-800 font-extrabold text-sm sm:text-base tracking-tight select-none">
              {{ currentUser()?.role === 'admin' ? 'Admin Portal' : 'Business Center' }}
            </span>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase scale-90 bg-[#EEF3F8] text-[#0A66C2] border border-blue-100">
              {{ currentUser()?.role === 'admin' ? 'Console' : 'Employer Hub' }}
            </span>
          </div>

          <div class="flex-1"></div>

          <div class="flex items-center gap-4">
            <!-- Profile dropdown -->
            <div class="relative">
              <button (click)="toggleDropdown()" data-testid="button-me-dropdown" class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none cursor-pointer">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="Me" />
                } @else {
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" [style.backgroundColor]="currentUser()?.avatarColor || '#0A66C2'">
                    {{ currentUser()?.avatarInitials || 'U' }}
                  </div>
                }
                <span class="text-xs font-semibold text-gray-700 hidden sm:inline">{{ currentUser()?.name }}</span>
                <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (showDropdown()) {
                <div class="absolute right-0 top-11 bg-white border border-border rounded-card shadow-md z-50 w-56 py-1" (click)="$event.stopPropagation()">
                  <div class="px-4 py-3 border-b border-gray-100">
                    <p class="font-semibold text-sm text-gray-900 truncate">{{ currentUser()?.name }}</p>
                    <p class="text-xs text-gray-500 truncate mt-0.5">{{ currentUser()?.email }}</p>
                  </div>
                  <button (click)="handleSignOut()" data-testid="button-sign-out" class="w-full text-left px-4 py-2 text-sm text-red-650 hover:bg-red-50 focus:outline-none flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold">
                    <span>Sign Out</span>
                  </button>
                </div>
              }
            </div>
          </div>
        } @else {
          <a routerLink="/" data-testid="link-home-logo">
            <div class="flex-shrink-0 w-9 h-9 bg-[#0A66C2] rounded flex items-center justify-center mr-1 cursor-pointer">
              <span class="text-white font-bold text-xl leading-none" style="font-family: Georgia, serif">in</span>
            </div>
          </a>

          <form (ngSubmit)="handleSearch()" class="relative flex-shrink-0 w-[220px] hidden sm:block">
            <!-- Search Icon -->
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              [(ngModel)]="searchQuery"
              name="searchQuery"
              placeholder="Search"
              data-testid="input-search"
              class="w-full pl-9 pr-3 py-1.5 rounded bg-[#EEF3F8] border border-transparent focus:border-[#0A66C2] focus:outline-none text-sm text-gray-800 placeholder-gray-500"
            />
          </form>

          <div class="flex-1"></div>

          <div class="flex items-center">
            <!-- Home -->
            <a routerLink="/" routerLinkActive="active-tab" [routerLinkActiveOptions]="{exact: true}" data-testid="link-nav-home" class="nav-item">
              <div class="relative">
                <svg class="w-6 h-6 nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <span class="nav-label">Home</span>
            </a>

            <!-- My Network -->
            <a routerLink="/my-network" routerLinkActive="active-tab" data-testid="link-nav-my-network" class="nav-item">
              <div class="relative">
                <svg class="w-6 h-6 nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span class="nav-label">My Network</span>
            </a>

            <!-- Jobs -->
            <a routerLink="/jobs" routerLinkActive="active-tab" data-testid="link-nav-jobs" class="nav-item">
              <div class="relative">
                <svg class="w-6 h-6 nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span class="nav-label">Jobs</span>
            </a>

            <!-- Messaging -->
            <a routerLink="/messaging" routerLinkActive="active-tab" data-testid="link-nav-messaging" class="nav-item">
              <div class="relative">
                <svg class="w-6 h-6 nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                @if (unreadMessages() > 0) {
                  <span class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#CC1016] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {{ unreadMessages() > 99 ? '99+' : unreadMessages() }}
                  </span>
                }
              </div>
              <span class="nav-label">Messaging</span>
            </a>

            <!-- Notifications -->
            <a routerLink="/notifications" routerLinkActive="active-tab" data-testid="link-nav-notifications" class="nav-item">
              <div class="relative">
                <svg class="w-6 h-6 nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                @if (unreadNotifs() > 0) {
                  <span class="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#CC1016] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {{ unreadNotifs() > 99 ? '99+' : unreadNotifs() }}
                  </span>
                }
              </div>
              <span class="nav-label">Notifications</span>
            </a>

            <!-- Me Dropdown -->
            <div class="relative">
              <button (click)="toggleDropdown()" data-testid="button-me-dropdown" class="flex flex-col items-center justify-center w-16 h-14 cursor-pointer group border-b-2 border-transparent hover:border-gray-300 transition-colors focus:outline-none">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-6 h-6 rounded-full object-cover flex-shrink-0" alt="Me" />
                } @else {
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" [style.backgroundColor]="currentUser()?.avatarColor || '#0A66C2'">
                    {{ currentUser()?.avatarInitials || 'U' }}
                  </div>
                }
                <span class="text-[11px] mt-0.5 text-gray-500 group-hover:text-black flex items-center gap-0.5">
                  Me
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <!-- Dropdown Menu Box -->
              @if (showDropdown()) {
                <div class="absolute right-0 top-14 bg-white border border-border rounded-card shadow-md z-50 w-60 py-1" (click)="$event.stopPropagation()">
                  <div class="px-3 py-3">
                    <div class="flex items-center gap-2 mb-3">
                      @if (currentUser()?.avatarUrl) {
                        <img [src]="currentUser()!.avatarUrl" class="w-12 h-12 rounded-full object-cover flex-shrink-0" alt="Me" />
                      } @else {
                        <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" [style.backgroundColor]="currentUser()?.avatarColor || '#0A66C2'">
                          {{ currentUser()?.avatarInitials }}
                        </div>
                      }
                      <div class="min-w-0">
                        <p class="font-semibold text-sm text-gray-900 truncate">{{ currentUser()?.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ currentUser()?.headline }}</p>
                        @if (currentUser()?.openToWork) {
                          <span class="text-[10px] text-green-700 font-semibold">#OpenToWork</span>
                        }
                      </div>
                    </div>
                    <a [routerLink]="['/profile', currentUser()?.id]" (click)="closeDropdown()">
                      <button data-testid="link-view-profile" class="w-full border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full py-1.5 hover:bg-blue-50 transition-colors">
                        View Profile
                      </button>
                    </a>
                  </div>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  <a routerLink="/saved" (click)="closeDropdown()" class="dropdown-link flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Saved items
                  </a>
                  <a routerLink="/analytics" (click)="closeDropdown()" class="dropdown-link flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Analytics
                  </a>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  <a routerLink="/settings" (click)="closeDropdown()" class="dropdown-link flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Settings & Privacy
                  </a>
                  
                  <div class="border-t border-gray-100 my-1"></div>
                  <button (click)="handleSignOut()" data-testid="button-sign-out" class="w-full text-left px-4 py-2 text-sm text-red-650 hover:bg-red-50 focus:outline-none flex items-center gap-2 border-0 bg-transparent cursor-pointer font-semibold font-sans">
                    Sign Out
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </nav>
  `,
  styles: [`
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 5.25rem;
      height: 52px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      color: #666666;
    }
    .nav-item:hover {
      border-bottom-color: #a0a0a0;
      color: #000000;
    }
    .nav-item.active-tab {
      border-bottom-color: #000000;
      color: #000000;
    }
    .nav-item.active-tab .nav-icon {
      color: #000000;
    }
    .nav-label {
      font-size: 11px;
      margin-top: 2px;
    }
  `]
})
export class NavbarComponent {
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  readonly notifications = this.stateService.notifications;
  readonly conversations = this.stateService.conversations;

  readonly unreadNotifs = computed(() => this.notifications().filter((n) => !n.read).length);
  readonly unreadMessages = computed(() => this.conversations().reduce((acc, c) => acc + c.unreadCount, 0));

  searchQuery = '';
  showDropdown = signal(false);

  toggleDropdown() {
    this.showDropdown.update((v) => !v);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  handleSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = '';
    }
  }

  handleSignOut() {
    this.closeDropdown();
    this.stateService.logout();
    this.router.navigate(['/login']);
  }
}
