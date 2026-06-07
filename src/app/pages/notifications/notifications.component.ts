import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { Notification, User } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-4 mt-14 font-sans">
      <div class="grid grid-cols-1 lg:grid-cols-[250px_1fr_300px] gap-6 items-start">
        
        <!-- Left Column (Mini Profile Card) -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden shadow-sm text-center">
            <div class="h-14 bg-gradient-to-r from-blue-700 to-indigo-900"></div>
            <div class="px-4 pb-4">
              <!-- User avatar -->
              <div class="w-16 h-16 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white text-lg font-bold mx-auto -mt-8 shadow" [style.backgroundColor]="currentUser()?.avatarColor || '#0A66C2'">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover" />
                } @else {
                  {{ currentUser()?.avatarInitials }}
                }
              </div>
              <a [routerLink]="['/profile', currentUser()?.id]" class="hover:underline">
                <h3 class="font-bold text-gray-900 text-sm mt-3 hover:text-[#0A66C2] cursor-pointer">{{ currentUser()?.name }}</h3>
              </a>
              <p class="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2 font-medium">{{ currentUser()?.headline }}</p>
              <p class="text-[10px] text-gray-400 mt-1 font-medium">{{ currentUser()?.location }}</p>
              
              <button [routerLink]="['/profile', currentUser()?.id]" class="mt-4 w-full bg-transparent border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-semibold py-1.5 rounded-full transition-colors cursor-pointer">
                + Experience
              </button>
            </div>
          </div>

          <div class="bg-white rounded-lg border border-[#E0DFDC] p-4 shadow-sm">
            <h3 class="font-semibold text-gray-800 text-xs leading-none">Manage your notifications</h3>
            <a routerLink="/settings" class="text-xs text-[#0A66C2] font-semibold hover:underline block mt-3">View settings</a>
          </div>
        </div>

        <!-- Center Column (Main Notifications Feed) -->
        <div class="space-y-4">
          <!-- Windows App Prompt -->
          @if (showAppBanner()) {
            <div class="bg-[#FFEAD2]/20 border border-amber-200 rounded-lg p-4 relative flex gap-3 shadow-sm bg-amber-50/10">
              <div class="flex-1 pr-6">
                <h3 class="font-bold text-gray-900 text-sm">LinkedIn is better on the new Windows app</h3>
                <p class="text-xs text-gray-500 mt-1">Never miss a reaction or comment</p>
                <button class="mt-3 bg-transparent border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer">
                  Open the app
                </button>
              </div>
              <button (click)="showAppBanner.set(false)" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold border-0 bg-transparent text-base cursor-pointer">
                &times;
              </button>
            </div>
          }

          <!-- Filters bar -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] p-3 shadow-sm flex flex-wrap gap-2 sticky top-14 z-30">
            <button
              (click)="activeFilter.set('all')"
              class="text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer border-0"
              [class.bg-[#057642]]="activeFilter() === 'all'"
              [class.text-white]="activeFilter() === 'all'"
              [class.bg-gray-150]="activeFilter() !== 'all'"
              [class.text-gray-600]="activeFilter() !== 'all'"
              [class.hover:bg-gray-200]="activeFilter() !== 'all'"
            >
              All
            </button>
            <button
              (click)="activeFilter.set('jobs')"
              class="text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer border-0"
              [class.bg-[#057642]]="activeFilter() === 'jobs'"
              [class.text-white]="activeFilter() === 'jobs'"
              [class.bg-gray-150]="activeFilter() !== 'jobs'"
              [class.text-gray-600]="activeFilter() !== 'jobs'"
              [class.hover:bg-gray-200]="activeFilter() !== 'jobs'"
            >
              Jobs
            </button>
            <button
              (click)="activeFilter.set('posts')"
              class="text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer border-0"
              [class.bg-[#057642]]="activeFilter() === 'posts'"
              [class.text-white]="activeFilter() === 'posts'"
              [class.bg-gray-150]="activeFilter() !== 'posts'"
              [class.text-gray-600]="activeFilter() !== 'posts'"
              [class.hover:bg-gray-200]="activeFilter() !== 'posts'"
            >
              My posts
            </button>
            <button
              (click)="activeFilter.set('mentions')"
              class="text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer border-0"
              [class.bg-[#057642]]="activeFilter() === 'mentions'"
              [class.text-white]="activeFilter() === 'mentions'"
              [class.bg-gray-150]="activeFilter() !== 'mentions'"
              [class.text-gray-600]="activeFilter() !== 'mentions'"
              [class.hover:bg-gray-200]="activeFilter() !== 'mentions'"
            >
              Mentions
            </button>
          </div>

          <!-- List box -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm divide-y divide-gray-150 overflow-hidden">
            @if (filteredNotifications().length === 0) {
              <div class="p-8 text-center text-gray-500 text-xs italic">No notifications matching filter.</div>
            } @else {
              @for (notif of filteredNotifications(); track notif.id) {
                @let actor = getActor(notif.actorId);
                <div
                  (click)="markAsRead(notif.id)"
                  [class.bg-blue-50/20]="!notif.read"
                  class="p-4 flex gap-4 hover:bg-gray-50/50 cursor-pointer transition-colors relative"
                >
                  <!-- Left icon/avatar display with overlapping logo logic -->
                  <div class="relative flex-shrink-0">
                    @if (notif.companyLogos && notif.companyLogos.length >= 2) {
                      <div class="relative w-12 h-12">
                        <div class="w-8 h-8 rounded border-2 border-white bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shadow-sm z-0">
                          {{ notif.companyLogos[0] }}
                        </div>
                        <div class="w-8 h-8 rounded border-2 border-white bg-blue-900 text-white text-[9px] font-black flex items-center justify-center shadow-sm absolute -bottom-1 -right-1 z-10">
                          {{ notif.companyLogos[1] }}
                        </div>
                      </div>
                    } @else if (notif.companyLogos && notif.companyLogos.length === 1) {
                      <div class="w-12 h-12 rounded border border-gray-200 bg-gray-900 text-white text-xs font-black flex items-center justify-center">
                        {{ notif.companyLogos[0] }}
                      </div>
                    } @else {
                      <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold bg-[#0A66C2]" [style.backgroundColor]="actor?.avatarColor">
                        @if (actor?.avatarUrl) {
                          <img [src]="actor!.avatarUrl" class="w-full h-full object-cover" />
                        } @else {
                          {{ actor?.avatarInitials || '?' }}
                        }
                      </div>
                    }
                  </div>

                  <!-- Text content -->
                  <div class="flex-1 min-w-0 space-y-1">
                    <p class="text-xs text-gray-800 leading-normal">
                      @if (!notif.companyLogos) {
                        <span class="font-bold text-gray-900 hover:underline hover:text-[#0A66C2]" [routerLink]="['/profile', actor?.id || '']">
                          {{ actor?.name }}
                        </span>
                      }
                      {{ notif.message }}
                    </p>
                    
                    @if (notif.isJobOpportunity) {
                      <button routerLink="/jobs" class="inline-flex items-center gap-1 border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer bg-white">
                        View jobs
                      </button>
                    }

                    <div class="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1 font-medium">
                      <span>{{ formatTime(notif.createdAt) }}</span>
                    </div>
                  </div>

                  <!-- Right actions: blue unread dot + ellipsis menu -->
                  <div class="flex items-center gap-2 flex-shrink-0 self-center">
                    @if (!notif.read) {
                      <span class="w-2.5 h-2.5 bg-[#0A66C2] rounded-full self-center"></span>
                    }

                    <div class="relative">
                      <button
                        (click)="toggleMenu(notif.id, $event)"
                        class="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors border-0 bg-transparent cursor-pointer font-bold"
                        title="Notification options"
                      >
                        &bull;&bull;&bull;
                      </button>

                      <!-- Dropdown popover menu -->
                      @if (openMenuId() === notif.id) {
                        <div class="absolute right-0 top-8 bg-white border border-[#E0DFDC] rounded-lg shadow-lg z-40 w-44 py-1" (click)="$event.stopPropagation()">
                          <button
                            (click)="deleteNotification(notif.id, $event)"
                            class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer font-semibold"
                          >
                            Delete notification
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Right Column (Ad card) -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] p-4 text-center space-y-4 shadow-sm">
          <div class="flex items-center justify-between text-[10px] text-gray-400 font-medium">
            <span>Promoted</span>
            <span class="cursor-pointer font-bold">&bull;&bull;&bull;</span>
          </div>

          @if (activeAd(); as ad) {
            <div class="w-12 h-12 text-white rounded font-bold flex items-center justify-center mx-auto text-sm shadow font-sans animate-in fade-in" [style.backgroundColor]="ad.logoColor || '#0A66C2'">
              {{ ad.logoText }}
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-900 text-xs leading-snug">{{ ad.title }}</h4>
              <p class="text-[11px] text-gray-650 mt-1 leading-normal font-medium">{{ ad.companyName }}</p>
              <p class="text-[10px] text-gray-500 mt-1 leading-tight font-medium">{{ ad.description }}</p>
            </div>
            
            <a
              [href]="ad.ctaUrl"
              target="_blank"
              class="block w-full text-xs font-bold py-1.5 rounded-full transition-colors cursor-pointer border border-[#0A66C2] text-white bg-[#0A66C2] hover:bg-[#004182] text-center"
            >
              {{ ad.ctaText || 'Learn More' }}
            </a>
          } @else {
            <h4 class="font-semibold text-gray-900 text-xs leading-snug">Your job search powered by your network</h4>
            
            <div class="flex items-center justify-center -space-x-2.5 overflow-hidden py-2">
              <div class="w-8 h-8 rounded-full border border-white bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">SC</div>
              <div class="w-8 h-8 rounded-full border border-white bg-green-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">MW</div>
              <div class="w-8 h-8 rounded-full border border-white bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">PP</div>
            </div>

            <p class="text-[10px] text-gray-500 leading-normal font-medium">Discover who can refer you to top tech companies in your area.</p>

            <button routerLink="/jobs" class="w-full text-xs font-bold py-1.5 rounded-full transition-colors cursor-pointer border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 bg-white">
              Explore jobs
            </button>
          }
        </div>

      </div>
    </div>
  `
})
export class NotificationsComponent {
  private readonly stateService = inject(StateService);

  readonly notifications = this.stateService.notifications;
  readonly users = this.stateService.users;
  readonly currentUser = this.stateService.currentUser;
  readonly activeAd = computed(() => {
    const approved = this.stateService.ads().filter(a => a.status === 'approved');
    return approved.length > 0 ? approved[0] : null;
  });

  // View state signals
  activeFilter = signal<'all' | 'jobs' | 'posts' | 'mentions'>('all');
  showAppBanner = signal(true);
  deletedNotifications = signal<string[]>([]);
  openMenuId = signal<string | null>(null);

  hasUnread = computed(() => this.notifications().some((n) => !n.read));

  filteredNotifications = computed(() => {
    const list = this.notifications().filter((n) => !this.deletedNotifications().includes(n.id));
    const filter = this.activeFilter();
    
    if (filter === 'all') {
      return list;
    } else if (filter === 'jobs') {
      return list.filter((n) => n.type === 'job');
    } else if (filter === 'posts') {
      return list.filter((n) => n.type === 'like' || n.type === 'comment');
    } else if (filter === 'mentions') {
      // Show mentions (mocked as notifications containing Meta or mentioning u1 / Jonadh)
      return list.filter((n) => n.message.toLowerCase().includes('meta') || n.message.toLowerCase().includes('jonadh'));
    }
    return list;
  });

  getActor(actorId: string): User | undefined {
    return this.users().find((u) => u.id === actorId);
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  markAsRead(id: string) {
    this.stateService.markNotificationRead(id);
  }

  markAllAsRead() {
    this.stateService.markAllNotificationsRead();
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    this.openMenuId.update((current) => current === id ? null : id);
  }

  deleteNotification(id: string, event: Event) {
    event.stopPropagation();
    this.deletedNotifications.update((list) => [...list, id]);
    this.openMenuId.set(null);
  }
}
