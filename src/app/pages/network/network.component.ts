import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { User, Connection } from '../../services/state.types';

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-4 mt-14">
      <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        <!-- Left Sidebar (Manage My Network) -->
        <div class="space-y-4">
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden">
            <div class="px-4 py-3 border-b border-gray-100 bg-white">
              <h2 class="font-semibold text-gray-900 text-sm">Manage my network</h2>
            </div>
            
            <div class="px-2 py-2 flex flex-col">
              <button
                (click)="activeView.set('grow')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border-0 bg-transparent text-left"
                [class.text-[#0A66C2]]="activeView() === 'grow'"
                [class.bg-blue-50/50]="activeView() === 'grow'"
                [class.text-gray-600]="activeView() !== 'grow'"
                [class.hover:bg-gray-50]="activeView() !== 'grow'"
              >
                <span class="flex items-center gap-2">🌐 Grow</span>
              </button>

              <button
                (click)="activeView.set('connections')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border-0 bg-transparent text-left"
                [class.text-[#0A66C2]]="activeView() === 'connections'"
                [class.bg-blue-50/50]="activeView() === 'connections'"
                [class.text-gray-600]="activeView() !== 'connections'"
                [class.hover:bg-gray-50]="activeView() !== 'connections'"
              >
                <span class="flex items-center gap-2">👥 Connections</span>
                <span class="text-xs text-gray-500 font-semibold">{{ connected().length }}</span>
              </button>

              <button
                (click)="activeView.set('following')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border-0 bg-transparent text-left"
                [class.text-[#0A66C2]]="activeView() === 'following'"
                [class.bg-blue-50/50]="activeView() === 'following'"
                [class.text-gray-600]="activeView() !== 'following'"
                [class.hover:bg-gray-50]="activeView() !== 'following'"
              >
                <span class="flex items-center gap-2">👤 Following & followers</span>
                <span class="text-xs text-gray-500 font-semibold">{{ followedCount() }}</span>
              </button>

              <button
                (click)="activeView.set('groups')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border-0 bg-transparent text-left"
                [class.text-[#0A66C2]]="activeView() === 'groups'"
                [class.bg-blue-50/50]="activeView() === 'groups'"
                [class.text-gray-600]="activeView() !== 'groups'"
                [class.hover:bg-gray-50]="activeView() !== 'groups'"
              >
                <span class="flex items-center gap-2">🏢 Groups</span>
                <span class="text-xs text-gray-500 font-semibold">{{ 3 + myGroups().length }}</span>
              </button>

              <button
                (click)="activeView.set('events')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold transition-colors cursor-pointer border-0 bg-transparent text-left"
                [class.text-[#0A66C2]]="activeView() === 'events'"
                [class.bg-blue-50/50]="activeView() === 'events'"
                [class.text-gray-600]="activeView() !== 'events'"
                [class.hover:bg-gray-50]="activeView() !== 'events'"
              >
                <span class="flex items-center gap-2">📅 Events</span>
                <span class="text-xs text-gray-500 font-semibold">{{ myEvents().length }}</span>
              </button>

              <button
                (click)="activeView.set('grow')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 transition-colors cursor-pointer border-0 bg-transparent text-left hover:bg-gray-50"
              >
                <span class="flex items-center gap-2">📄 Pages</span>
                <span class="text-xs text-gray-500 font-semibold">12</span>
              </button>

              <button
                (click)="activeView.set('grow')"
                class="flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-600 transition-colors cursor-pointer border-0 bg-transparent text-left hover:bg-gray-50"
              >
                <span class="flex items-center gap-2">📰 Newsletters</span>
                <span class="text-xs text-gray-500 font-semibold">5</span>
              </button>
            </div>
          </div>

          <!-- SBI Promoted Follow Ad Card -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden p-4 text-center space-y-3">
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Promoted</span>
              <span class="cursor-pointer font-bold">&bull;&bull;&bull;</span>
            </div>
            
            @if (activeAd(); as ad) {
              <div class="w-12 h-12 text-white rounded font-bold flex items-center justify-center mx-auto text-sm shadow font-sans" [style.backgroundColor]="ad.logoColor || '#0A66C2'">
                {{ ad.logoText }}
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 text-xs">{{ ad.title }}</h4>
                <p class="text-[11px] text-gray-650 mt-1 leading-normal font-medium">{{ ad.companyName }}</p>
                <p class="text-[10px] text-gray-500 mt-1 leading-tight font-medium">{{ ad.description }}</p>
              </div>
              
              <a
                [href]="ad.ctaUrl"
                target="_blank"
                class="block w-full text-xs font-semibold py-1.5 rounded-full transition-colors cursor-pointer border text-center bg-[#0A66C2] text-white border-[#0A66C2] hover:bg-[#004182]"
              >
                {{ ad.ctaText || 'Learn More' }}
              </a>
            } @else {
              <div class="w-12 h-12 bg-blue-700 text-white rounded font-bold flex items-center justify-center mx-auto text-sm shadow">
                SBI
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 text-xs">State Bank of India</h4>
                <p class="text-[11px] text-gray-500 mt-1 leading-normal font-medium">Jonadh, Master your money with State Bank of India</p>
                <p class="text-[10px] text-gray-400 mt-1 leading-tight font-medium">Your financial knowledge hub is here!</p>
              </div>
              
              <div class="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium">
                <span>👤 Aaron & 16 other connections follow</span>
              </div>
              
              <button
                (click)="toggleSbiFollow()"
                class="w-full text-xs font-semibold py-1.5 rounded-full transition-colors cursor-pointer border"
                [class.bg-[#0A66C2]]="!sbiFollowed()"
                [class.text-white]="!sbiFollowed()"
                [class.border-[#0A66C2]]="!sbiFollowed()"
                [class.bg-white]="sbiFollowed()"
                [class.text-gray-700]="sbiFollowed()"
                [class.border-gray-300]="sbiFollowed()"
              >
                {{ sbiFollowed() ? '✓ Following' : 'Follow' }}
              </button>
            }
          </div>

          <!-- Footer Links -->
          <div class="px-2 text-center space-y-2">
            <div class="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[11px] text-gray-500 font-medium">
              <a href="#" class="hover:text-[#0A66C2] hover:underline">About</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Accessibility</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Help Center</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Privacy & Terms</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Ad Choices</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Advertising</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Business Services</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">Get the LinkedIn app</a>
              <a href="#" class="hover:text-[#0A66C2] hover:underline">More</a>
            </div>
            <div class="flex items-center justify-center gap-1 text-[11px] text-gray-500 font-semibold mt-2">
              <span class="text-[#0A66C2] font-bold text-xs">Linked</span>
              <span class="bg-[#0A66C2] text-white font-bold text-[10px] px-1 py-0.2 rounded-sm">in</span>
              <span>LinkedIn Corporation © 2026</span>
            </div>
          </div>
        </div>

        <!-- Center Panel (Main Content Views) -->
        <div class="space-y-4">
          
          <!-- VIEW 1: GROW / MAIN SUITE -->
          @if (activeView() === 'grow') {
            <!-- Sub tabs -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-1 flex">
              <button
                (click)="growSubTab.set('grow')"
                class="flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 border-0 bg-transparent font-sans"
                [class.border-[#057642]]="growSubTab() === 'grow'"
                [class.text-[#057642]]="growSubTab() === 'grow'"
                [class.border-transparent]="growSubTab() !== 'grow'"
                [class.text-gray-500]="growSubTab() !== 'grow'"
              >
                Grow
              </button>
              <button
                (click)="growSubTab.set('catchup')"
                class="flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer border-b-2 border-0 bg-transparent font-sans"
                [class.border-[#057642]]="growSubTab() === 'catchup'"
                [class.text-[#057642]]="growSubTab() === 'catchup'"
                [class.border-transparent]="growSubTab() !== 'catchup'"
                [class.text-gray-500]="growSubTab() !== 'catchup'"
              >
                Catch up
              </button>
            </div>

            @if (growSubTab() === 'grow') {
              <!-- Invitations panel -->
              @if (pendingReceived().length > 0) {
                <div class="bg-white rounded-lg border border-[#E0DFDC]">
                  <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-900 text-sm">
                      Invitations ({{ pendingReceived().length }})
                    </h2>
                    <button (click)="activeView.set('connections')" class="text-[#0A66C2] text-sm font-semibold hover:underline bg-transparent border-0 cursor-pointer">
                      Show all
                    </button>
                  </div>
                  <div class="divide-y divide-gray-100 px-4">
                    @for (conn of pendingReceived(); track conn.id) {
                      @let sender = getSender(conn);
                      <div class="flex items-center gap-3 py-3" [attr.data-testid]="'card-invitation-' + conn.id">
                        <div class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0" [style.backgroundColor]="sender?.avatarColor || '#0A66C2'">
                          @if (sender?.avatarUrl) {
                            <img [src]="sender!.avatarUrl" class="w-full h-full object-cover" alt="{{ sender?.name }}" />
                          } @else {
                            {{ sender?.avatarInitials || '?' }}
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <a [routerLink]="['/profile', sender?.id || '']">
                            <p class="font-semibold text-sm text-gray-900 hover:underline cursor-pointer leading-tight">{{ sender?.name }}</p>
                          </a>
                          <p class="text-xs text-gray-500 truncate leading-relaxed mt-0.5">{{ sender?.headline }}</p>
                          <p class="text-[10px] text-gray-400 leading-tight mt-0.5 font-medium flex items-center gap-1">
                            👥 {{ getMutualConnectionsDesc(sender?.id) }}
                          </p>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                          <button
                            (click)="ignoreConnection(conn.id)"
                            [attr.data-testid]="'button-ignore-' + conn.id"
                            class="text-gray-500 hover:bg-gray-100 text-xs font-semibold rounded-full px-4 py-1.5 transition-colors border-0 bg-transparent cursor-pointer"
                          >
                            Ignore
                          </button>
                          <button
                            (click)="acceptConnection(conn.id)"
                            [attr.data-testid]="'button-accept-' + conn.id"
                            class="border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors bg-white cursor-pointer"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Games Carousel Section -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-xs font-semibold text-gray-900 flex items-center gap-1">
                    Wind down with a puzzle 😊
                  </h3>
                  <div class="flex items-center gap-1.5">
                    <button (click)="prevGame()" class="p-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 disabled:opacity-30 cursor-pointer animate-none bg-white" [disabled]="gameIndex() === 0">
                      &larr;
                    </button>
                    <button (click)="nextGame()" class="p-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 disabled:opacity-30 cursor-pointer animate-none bg-white" [disabled]="gameIndex() >= games.length - 2">
                      &rarr;
                    </button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 overflow-hidden">
                  @for (game of visibleGames(); track game.title) {
                    <div class="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2 hover:bg-gray-50 transition-colors bg-white">
                      <div class="flex items-center gap-2 min-w-0">
                        <div class="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                          {{ game.icon }}
                        </div>
                        <div class="min-w-0">
                          <h4 class="text-[11px] font-bold text-gray-900 leading-tight truncate">{{ game.title }}</h4>
                          <p class="text-[9px] text-gray-500 mt-0.5 truncate">{{ game.desc }}</p>
                        </div>
                      </div>
                      <button
                        (click)="openGame(game.title)"
                        class="border text-[10px] font-semibold rounded-full px-3 py-1 transition-colors bg-white cursor-pointer"
                        [class.text-[#057642]]="isGameSolved(game.title)"
                        [class.border-[#057642]]="isGameSolved(game.title)"
                        [class.text-[#0A66C2]]="!isGameSolved(game.title)"
                        [class.border-[#0A66C2]]="!isGameSolved(game.title)"
                        [class.hover:bg-blue-50]="!isGameSolved(game.title)"
                        [class.hover:bg-green-50]="isGameSolved(game.title)"
                      >
                        {{ isGameSolved(game.title) ? '✓ Solved' : 'Solve' }}
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- Premium: Profile Viewers Carousel -->
              @if (profileViews().length > 0) {
                <div class="bg-white rounded-lg border border-[#E0DFDC] p-4">
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-1.5">
                      <span class="text-[9px] font-bold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded uppercase">Premium</span>
                      <h3 class="text-xs font-semibold text-gray-900">People who viewed your profile</h3>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <button (click)="prevViewer()" class="p-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 disabled:opacity-30 cursor-pointer animate-none bg-white" [disabled]="viewerIndex() === 0">
                        &larr;
                      </button>
                      <button (click)="nextViewer()" class="p-1 border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 disabled:opacity-30 cursor-pointer animate-none bg-white" [disabled]="viewerIndex() >= profileViews().length - 2">
                        &rarr;
                      </button>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    @for (view of visibleViewers(); track view.viewerId + view.viewedAt) {
                      <div class="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50/50 flex items-start gap-3">
                        <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold bg-[#0A66C2] flex-shrink-0" [style.backgroundColor]="view.viewerAvatarColor">
                          @if (view.viewerAvatarUrl) {
                            <img [src]="view.viewerAvatarUrl" class="w-full h-full object-cover" alt="Avatar" />
                          } @else {
                            {{ view.viewerAvatarInitials }}
                          }
                        </div>
                        <div class="flex-1 min-w-0">
                          <a [routerLink]="['/profile', view.viewerId]">
                            <h4 class="text-xs font-bold text-gray-900 hover:underline cursor-pointer truncate leading-tight">{{ view.viewerName }}</h4>
                          </a>
                          <p class="text-[10px] text-gray-500 truncate leading-relaxed">{{ view.viewerHeadline }}</p>
                          <button [routerLink]="['/profile', view.viewerId]" class="mt-2 text-[#0A66C2] text-[10px] font-semibold hover:underline flex items-center gap-0.5 border-0 bg-transparent p-0 cursor-pointer">
                            View profile &rarr;
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Suggestions Grid -->
              <div class="bg-white rounded-lg border border-[#E0DFDC]">
                <div class="px-4 py-3 border-b border-gray-100">
                  <h2 class="font-semibold text-gray-900 text-sm">People you may know</h2>
                  <p class="text-[11px] text-gray-400 mt-0.5">Based on your profile and network</p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
                  @for (user of suggestions(); track user.id) {
                    @let status = getConnectionStatus(user.id);
                    <div class="p-4 flex flex-col items-center text-center relative bg-white" [attr.data-testid]="'card-suggestion-' + user.id">
                      <button
                        (click)="dismissSuggestion(user.id)"
                        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none border-0 bg-transparent cursor-pointer"
                        title="Dismiss"
                      >
                        &times;
                      </button>
                      <div
                        class="h-16 w-full -mx-4 -mt-4 mb-1 rounded-t-none"
                        [style.background]="user.coverColor"
                        style="height: 40px; width: calc(100% + 32px); margin-left: -16px; margin-top: -16px;"
                      ></div>
                      <div
                        class="w-14 h-14 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-white font-bold text-base -mt-7 shadow-sm"
                        [style.backgroundColor]="user.avatarColor"
                      >
                        @if (user.avatarUrl) {
                          <img [src]="user.avatarUrl" class="w-full h-full object-cover" alt="{{ user.name }}" />
                        } @else {
                          {{ user.avatarInitials }}
                        }
                      </div>
                      <a [routerLink]="['/profile', user.id]">
                        <p class="font-semibold text-xs text-gray-900 mt-2 hover:underline cursor-pointer leading-tight truncate max-w-[120px]">{{ user.name }}</p>
                      </a>
                      <p class="text-[10px] text-gray-500 mt-0.5 leading-tight line-clamp-2 h-7 overflow-hidden">{{ user.headline }}</p>
                      
                      <p class="text-[9px] text-[#0A66C2] font-semibold mt-1.5 flex items-center gap-0.5 justify-center leading-none">
                        👥 {{ getMutualConnectionsDesc(user.id) }}
                      </p>
                      
                      @if (status === 'pending_sent') {
                        <button
                          disabled
                          class="mt-3 border border-gray-300 text-gray-400 text-[11px] font-semibold rounded-full px-4 py-1 cursor-default bg-transparent"
                        >
                          Pending
                        </button>
                      } @else {
                        <button
                          (click)="sendConnectionRequest(user.id)"
                          [attr.data-testid]="'button-connect-' + user.id"
                          class="mt-3 border border-[#0A66C2] text-[#0A66C2] text-[11px] font-semibold rounded-full px-4 py-1 hover:bg-blue-50 transition-colors flex items-center gap-1 bg-white cursor-pointer"
                        >
                          Connect
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <!-- Catch up tab -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-8 text-center space-y-2">
                <span class="text-3xl">☕</span>
                <h3 class="font-bold text-gray-800 text-sm">You're all caught up!</h3>
                <p class="text-xs text-gray-500">Check back later for connection alerts, birthdays, and work anniversaries.</p>
              </div>
            }
          }

          <!-- VIEW 2: CONNECTIONS LIST -->
          @if (activeView() === 'connections') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-4">
              <div class="border-b border-gray-100 pb-3">
                <h2 class="text-lg font-semibold text-gray-900">{{ connected().length }} connections</h2>
              </div>

              <!-- Search and Sort controls -->
              <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div class="relative w-full sm:max-w-xs">
                  <input
                    [(ngModel)]="searchQuery"
                    placeholder="Search by name"
                    class="w-full border border-gray-300 rounded px-3 py-1.5 pl-8 text-xs focus:border-[#0A66C2] focus:outline-none"
                  />
                  <!-- Search Icon -->
                  <svg class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span>Sort by:</span>
                  <select class="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none">
                    <option>Recently added</option>
                    <option>First name</option>
                    <option>Last name</option>
                  </select>
                </div>
              </div>

              <!-- Connections Row List -->
              @if (filteredConnected().length === 0) {
                <p class="text-xs text-gray-400 italic py-4 text-center">No connections match your search.</p>
              } @else {
                <div class="divide-y divide-gray-100">
                  @for (user of filteredConnected(); track user.id) {
                    <div class="py-4 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div class="flex items-center gap-3">
                        <a [routerLink]="['/profile', user.id]">
                          <div
                            class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-sm cursor-pointer flex-shrink-0"
                            [style.backgroundColor]="user.avatarColor"
                          >
                            @if (user.avatarUrl) {
                              <img [src]="user.avatarUrl" class="w-full h-full object-cover" alt="{{ user.name }}" />
                            } @else {
                              {{ user.avatarInitials }}
                            }
                          </div>
                        </a>
                        <div>
                          <a [routerLink]="['/profile', user.id]" class="hover:underline">
                            <p class="font-semibold text-sm text-gray-900 leading-tight">{{ user.name }}</p>
                          </a>
                          <p class="text-xs text-gray-500 mt-0.5 truncate max-w-[350px]">{{ user.headline }}</p>
                          <p class="text-[10px] text-gray-400 mt-0.5 font-medium">Connected on May 6, 2026</p>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-2">
                        <button
                          (click)="messageUser(user.id)"
                          class="border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors bg-white cursor-pointer"
                        >
                          Message
                        </button>
                        <!-- Remove context trigger -->
                        <button
                          (click)="removeConnection(user.id)"
                          class="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors border-0 bg-transparent cursor-pointer"
                          title="Remove connection"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          }

          <!-- VIEW 3: FOLLOWING & FOLLOWERS -->
          @if (activeView() === 'following') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-4">
              <div class="border-b border-gray-100 pb-3">
                <h2 class="text-lg font-semibold text-gray-900">Jonadh's Network</h2>
              </div>

              <!-- Sub-tabs -->
              <div class="flex border-b border-gray-150">
                <button
                  (click)="activeFollowTab.set('following')"
                  class="px-5 py-2 text-sm font-semibold border-b-2 border-0 bg-transparent cursor-pointer"
                  [class.border-[#057642]]="activeFollowTab() === 'following'"
                  [class.text-[#057642]]="activeFollowTab() === 'following'"
                  [class.border-transparent]="activeFollowTab() !== 'following'"
                  [class.text-gray-500]="activeFollowTab() !== 'following'"
                >
                  Following
                </button>
                <button
                  (click)="activeFollowTab.set('followers')"
                  class="px-5 py-2 text-sm font-semibold border-b-2 border-0 bg-transparent cursor-pointer"
                  [class.border-[#057642]]="activeFollowTab() === 'followers'"
                  [class.text-[#057642]]="activeFollowTab() === 'followers'"
                  [class.border-transparent]="activeFollowTab() !== 'followers'"
                  [class.text-gray-500]="activeFollowTab() !== 'followers'"
                >
                  Followers
                </button>
              </div>

              @if (activeFollowTab() === 'following') {
                <p class="text-xs text-gray-500">You are following {{ followedCount() }} people out of your network</p>
                <div class="divide-y divide-gray-100">
                  @for (person of followedPeople(); track person.id) {
                    <div class="py-4 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.backgroundColor]="person.avatarColor">
                          {{ person.avatarInitials }}
                        </div>
                        <div>
                          <p class="font-semibold text-sm text-gray-900 leading-tight">{{ person.name }}</p>
                          <p class="text-xs text-gray-500 mt-0.5 truncate max-w-[380px]">{{ person.headline }}</p>
                        </div>
                      </div>
                      
                      <button
                        (click)="toggleFollowPerson(person.id)"
                        class="text-xs font-semibold rounded-full px-4 py-1.5 transition-colors border cursor-pointer"
                        [class.bg-white]="person.isFollowing"
                        [class.text-gray-700]="person.isFollowing"
                        [class.border-gray-300]="person.isFollowing"
                        [class.bg-[#0A66C2]]="!person.isFollowing"
                        [class.text-white]="!person.isFollowing"
                        [class.border-[#0A66C2]]="!person.isFollowing"
                      >
                        {{ person.isFollowing ? 'Following' : 'Follow' }}
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <div class="text-center py-8 text-gray-400">
                  <span class="text-2xl">👥</span>
                  <p class="text-xs mt-2 font-medium">No followers to show yet.</p>
                </div>
              }
            </div>
          }

          <!-- VIEW 4: GROUPS -->
          @if (activeView() === 'groups') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-4">
              <div class="flex items-center justify-between border-b border-gray-100 pb-3">
                <div class="flex border-b border-gray-150 flex-1">
                  <button
                    (click)="activeGroupTab.set('groups')"
                    class="px-5 py-2 text-sm font-semibold border-b-2 border-0 bg-transparent cursor-pointer"
                    [class.border-[#057642]]="activeGroupTab() === 'groups'"
                    [class.text-[#057642]]="activeGroupTab() === 'groups'"
                    [class.border-transparent]="activeGroupTab() !== 'groups'"
                    [class.text-gray-500]="activeGroupTab() !== 'groups'"
                  >
                    Your groups
                  </button>
                  <button
                    (click)="activeGroupTab.set('requested')"
                    class="px-5 py-2 text-sm font-semibold border-b-2 border-0 bg-transparent cursor-pointer"
                    [class.border-[#057642]]="activeGroupTab() === 'requested'"
                    [class.text-[#057642]]="activeGroupTab() === 'requested'"
                    [class.border-transparent]="activeGroupTab() !== 'requested'"
                    [class.text-gray-500]="activeGroupTab() !== 'requested'"
                  >
                    Requested
                  </button>
                </div>
                <button (click)="showCreateGroupModal.set(true)" class="border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors bg-white cursor-pointer flex-shrink-0">
                  Create group
                </button>
              </div>

              @if (activeGroupTab() === 'groups') {
                <!-- My created groups list -->
                @if (myGroups().length > 0) {
                  <div class="space-y-3 pb-3 border-b border-gray-100">
                    <p class="text-xs font-semibold text-gray-500">Groups you manage ({{ myGroups().length }})</p>
                    @for (grp of myGroups(); track grp.name) {
                      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center justify-between">
                        <div>
                          <p class="text-sm font-semibold text-gray-900 leading-tight">🏢 {{ grp.name }}</p>
                          <p class="text-xs text-gray-500 mt-1">{{ grp.desc || 'No description provided.' }}</p>
                        </div>
                        <span class="text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">Owner</span>
                      </div>
                    }
                  </div>
                }

                <div class="text-center py-6 space-y-4">
                  <div class="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-3xl">
                    🏢
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-800 text-base">Discover groups</h3>
                    <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">Find other trusted communities that share and support your goals.</p>
                  </div>
                  <button (click)="activeView.set('grow')" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold px-6 py-2 rounded-full transition-colors cursor-pointer border-0">
                    Discover
                  </button>
                </div>

                <!-- Groups you might like -->
                <div class="space-y-3 pt-4 border-t border-gray-150">
                  <h3 class="text-xs font-semibold text-gray-700">Groups you might be interested in</h3>
                  <div class="space-y-3">
                    @for (group of suggestedGroups(); track group.id) {
                      <div class="border border-gray-200 rounded-lg p-4 bg-white flex items-center justify-between gap-3">
                        <div class="flex items-start gap-3">
                          <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-lg flex-shrink-0">
                            🏢
                          </div>
                          <div>
                            <p class="font-semibold text-xs text-gray-900 leading-snug">{{ group.name }}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5 leading-none">{{ group.members }}</p>
                          </div>
                        </div>
                        <button
                          (click)="toggleGroupJoin(group.id)"
                          class="border text-xs font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer bg-white"
                          [class.text-gray-500]="group.isJoined"
                          [class.border-gray-300]="group.isJoined"
                          [class.text-[#0A66C2]]="!group.isJoined"
                          [class.border-[#0A66C2]]="!group.isJoined"
                          [class.hover:bg-blue-50]="!group.isJoined"
                        >
                          {{ group.isJoined ? 'Requested' : 'Join' }}
                        </button>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <!-- Requested tab -->
                <div class="divide-y divide-gray-100">
                  @let requested = getRequestedGroups();
                  @if (requested.length === 0) {
                    <p class="text-xs text-gray-400 italic py-4 text-center">No requested groups.</p>
                  } @else {
                    @for (rg of requested; track rg.id) {
                      <div class="py-3 flex items-center justify-between">
                        <p class="text-xs font-semibold text-gray-800">{{ rg.name }}</p>
                        <button (click)="toggleGroupJoin(rg.id)" class="text-xs font-semibold text-red-500 hover:underline border-0 bg-transparent cursor-pointer">Withdraw</button>
                      </div>
                    }
                  }
                </div>
              }
            </div>
          }

          <!-- VIEW 5: EVENTS -->
          @if (activeView() === 'events') {
            <div class="space-y-4">
              <!-- Event Header card -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 flex items-center justify-between bg-white">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900 leading-tight">Events</h2>
                  <p class="text-xs text-gray-500 mt-1">Organize or find local and online professional meetups.</p>
                </div>
                <button (click)="showCreateEventModal.set(true)" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full px-5 py-2 transition-colors cursor-pointer border-0 flex-shrink-0">
                  Create an event
                </button>
              </div>

              <!-- Created / Attending Events -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-3">
                <h3 class="text-xs font-semibold text-gray-700 border-b border-gray-100 pb-2">Your events ({{ myEvents().length }})</h3>
                @if (myEvents().length === 0) {
                  <p class="text-xs text-gray-400 italic py-2">No upcoming events on your schedule.</p>
                } @else {
                  <div class="space-y-3">
                    @for (ev of myEvents(); track ev.name) {
                      <div class="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-start justify-between">
                        <div>
                          <p class="text-sm font-semibold text-gray-900">📅 {{ ev.name }}</p>
                          <p class="text-xs text-[#0A66C2] font-semibold mt-1">{{ ev.date || 'TBD' }}</p>
                          <p class="text-xs text-gray-500 mt-1 leading-normal">{{ ev.desc || 'No description provided.' }}</p>
                        </div>
                        <span class="text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">Going</span>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Exclusive for Premium Events -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-3">
                <h3 class="text-xs font-semibold text-gray-700 border-b border-gray-100 pb-2">Exclusive for Premium</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (ev of exclusiveEvents; track ev.title) {
                    <div class="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow">
                      <div class="h-24 bg-gray-100 flex items-center justify-center relative">
                        <span class="text-3xl">🎓</span>
                      </div>
                      <div class="p-3 space-y-1.5">
                        <p class="text-[10px] text-yellow-700 font-semibold uppercase">Premium Event</p>
                        <h4 class="text-xs font-bold text-gray-900 leading-snug line-clamp-2 h-8 overflow-hidden">{{ ev.title }}</h4>
                        <p class="text-[9px] text-[#0A66C2] font-medium leading-none">{{ ev.time }}</p>
                        <p class="text-[9px] text-gray-400 font-semibold mt-1">{{ ev.attendees }}</p>
                      </div>
                    </div>
                  }
                </div>
                <div class="pt-2 text-center">
                  <a href="#" class="text-xs font-semibold text-[#0A66C2] hover:underline flex items-center justify-center gap-1">
                    🔓 Unlock 50+ Premium events
                  </a>
                </div>
              </div>

              <!-- Recommended Events -->
              <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 space-y-3">
                <h3 class="text-xs font-semibold text-gray-700 border-b border-gray-100 pb-2">Recommended for you</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  @for (ev of recommendedEvents; track ev.title) {
                    <div class="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition-shadow flex flex-col justify-between">
                      <div>
                        <div class="h-24 bg-gray-150 flex items-center justify-center relative">
                          <span class="text-3xl">📅</span>
                        </div>
                        <div class="p-3 space-y-1.5">
                          <h4 class="text-xs font-bold text-gray-900 leading-snug line-clamp-2 h-8 overflow-hidden">{{ ev.title }}</h4>
                          <p class="text-[9px] text-gray-500 font-semibold">{{ ev.company }}</p>
                          <p class="text-[9px] text-gray-400 mt-1 font-medium">{{ ev.time }}</p>
                        </div>
                      </div>
                      <div class="p-3 pt-0">
                        <button class="w-full border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 text-[10px] font-semibold py-1 rounded-full transition-colors bg-white cursor-pointer">
                          View details
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- MOCK CREATE GROUP MODAL OVERLAY -->
    @if (showCreateGroupModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-xl w-full max-w-[450px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-semibold text-gray-900 text-lg">Create a group</h2>
            <button (click)="showCreateGroupModal.set(false)" class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent cursor-pointer">
              <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="text-xs text-gray-600 block mb-1">Group name*</label>
              <input
                [(ngModel)]="newGroupName"
                placeholder="e.g. Angular developers Kochi"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-gray-600 block mb-1">Description</label>
              <textarea
                [(ngModel)]="newGroupDesc"
                rows="3"
                placeholder="What is this group about?"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button (click)="showCreateGroupModal.set(false)" class="border border-gray-400 text-gray-600 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">Cancel</button>
            <button (click)="createGroup()" [disabled]="!newGroupName.trim()" class="bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-xs font-semibold rounded-full px-5 py-2 border-0 cursor-pointer">Create</button>
          </div>
        </div>
      </div>
    }

    <!-- MOCK CREATE EVENT MODAL OVERLAY -->
    @if (showCreateEventModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-xl w-full max-w-[450px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 class="font-semibold text-gray-900 text-lg">Create an event</h2>
            <button (click)="showCreateEventModal.set(false)" class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent cursor-pointer">
              <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="px-6 py-4 space-y-4">
            <div>
              <label class="text-xs text-gray-600 block mb-1">Event name*</label>
              <input
                [(ngModel)]="newEventName"
                placeholder="e.g. Tech Meetup 2026"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
              />
            </div>
            <div>
              <label class="text-xs text-gray-600 block mb-1">Date & Time</label>
              <input
                [(ngModel)]="newEventDate"
                type="datetime-local"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
              />
            </div>
            <div>
              <label class="text-xs text-gray-600 block mb-1">Description</label>
              <textarea
                [(ngModel)]="newEventDesc"
                rows="3"
                placeholder="Describe your meetup"
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"
              ></textarea>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button (click)="showCreateEventModal.set(false)" class="border border-gray-400 text-gray-600 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">Cancel</button>
            <button (click)="createEvent()" [disabled]="!newEventName.trim()" class="bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-xs font-semibold rounded-full px-5 py-2 border-0 cursor-pointer">Create</button>
          </div>
        </div>
      </div>
    }

    <!-- INTERACTIVE GAME MODAL -->
    @if (showGameModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" (click)="closeGameModal()">
        <div class="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-[460px] p-6 relative overflow-hidden" (click)="$event.stopPropagation()">
          <button (click)="closeGameModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-colors focus:outline-none">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div class="text-center pb-4 border-b border-gray-100 font-sans">
            <h2 class="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <span>{{ currentGame() }}</span>
            </h2>
            <p class="text-xs text-gray-500 mt-1">Wind down with a quick challenge</p>
          </div>

          <!-- SUDOKU GAME GRID -->
          @if (currentGame().includes('Sudoku')) {
            <div class="py-6 flex flex-col items-center">
              <p class="text-xs text-gray-600 mb-4 text-center font-sans">Fill the grid so every row, column, and 2x2 box contains numbers 1-4. Click a cell to change its value.</p>
              <div class="grid grid-cols-4 gap-2 w-64 h-64 bg-gray-100 p-2 rounded-lg border border-gray-300">
                @for (row of [0, 1, 2, 3]; track row) {
                  @for (col of [0, 1, 2, 3]; track col) {
                    @let val = sudokuGrid()[row][col];
                    @let isOriginal = isOriginalSudokuCell(row, col);
                    <button
                      (click)="cycleSudokuCell(row, col)"
                      [disabled]="isOriginal"
                      class="w-full h-full text-lg font-bold rounded flex items-center justify-center transition-all cursor-pointer select-none border border-gray-300 font-sans"
                      [class.bg-white]="!isOriginal && val === 0"
                      [class.bg-[#E8F0FE]]="isOriginal"
                      [class.text-gray-800]="isOriginal"
                      [class.bg-blue-50]="!isOriginal && val > 0"
                      [class.text-[#0A66C2]]="!isOriginal && val > 0"
                      [class.hover:bg-blue-100]="!isOriginal"
                      [class.border-blue-300]="isOriginal"
                    >
                      {{ val > 0 ? val : '' }}
                    </button>
                  }
                }
              </div>

              @if (gameStatus() === 'won') {
                <div class="mt-6 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span class="text-3xl">🎉</span>
                  <p class="text-sm font-bold text-green-700 font-sans">Congratulations! Game Solved!</p>
                  <p class="text-xs text-gray-500 font-sans">You completed Mini Sudoku #299 successfully!</p>
                </div>
              }
            </div>
          }

          <!-- PATCHES GAME GRID -->
          @if (currentGame().includes('Patches')) {
            <div class="py-6 flex flex-col items-center">
              <p class="text-xs text-gray-600 mb-4 text-center font-sans">Group the words into 2 categories of 4 related items. Click 4 words and they will be verified.</p>
              
              <div class="grid grid-cols-2 gap-2.5 w-full max-w-[380px]">
                @for (w of patchesWords(); track w.text) {
                  <button
                    (click)="selectPatchesWord(w)"
                    [disabled]="w.grouped"
                    class="py-3 px-2 text-xs font-semibold rounded border text-center transition-all cursor-pointer font-sans"
                    [class.bg-gray-100]="!w.selected && !w.grouped"
                    [class.text-gray-800]="!w.selected && !w.grouped"
                    [class.border-gray-300]="!w.selected && !w.grouped"
                    [class.bg-blue-600]="w.selected && !w.grouped"
                    [class.text-white]="w.selected && !w.grouped"
                    [class.border-blue-700]="w.selected && !w.grouped"
                    [class.bg-green-100]="w.grouped"
                    [class.text-green-800]="w.grouped"
                    [class.border-green-300]="w.grouped"
                  >
                    {{ w.text }}
                  </button>
                }
              </div>

              @if (gameStatus() === 'won') {
                <div class="mt-6 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span class="text-3xl">🎉</span>
                  <p class="text-sm font-bold text-green-700 font-sans">Success! Categories Grouped!</p>
                  <p class="text-xs text-gray-650 font-sans mt-2">
                    💻 Tech: Angular, TypeScript, RxJS, Signal <br/>
                    🌲 Nature: Forest, River, Mountain, Valley
                  </p>
                </div>
              }
            </div>
          }

          <!-- ZIP GAME GRID -->
          @if (currentGame().includes('Zip')) {
            <div class="py-6 flex flex-col items-center font-sans">
              <p class="text-xs text-gray-600 mb-4 text-center">Click the numbers in sequential order from 1 to 8 as fast as you can to zip the path!</p>
              
              <div class="grid grid-cols-3 gap-3 w-64 h-64 bg-gray-50 p-2 rounded-lg border border-gray-200">
                @for (item of zipNumbers(); track item.num) {
                  <button
                    (click)="clickZipNumber(item)"
                    [disabled]="item.clicked"
                    class="w-full h-full text-base font-bold rounded-lg border border-gray-300 transition-all cursor-pointer font-sans"
                    [class.bg-white]="!item.clicked"
                    [class.text-gray-800]="!item.clicked"
                    [class.bg-green-600]="item.clicked"
                    [class.text-white]="item.clicked"
                    [class.border-green-700]="item.clicked"
                    [class.hover:bg-gray-100]="!item.clicked"
                  >
                    {{ item.num }}
                  </button>
                }
              </div>

              @if (gameStatus() === 'won') {
                <div class="mt-6 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span class="text-3xl">⚡</span>
                  <p class="text-sm font-bold text-green-700 font-sans">Zip path completed!</p>
                  <p class="text-xs text-gray-500 font-sans">You successfully connected all points in order!</p>
                </div>
              } @else {
                <p class="text-xs text-gray-500 font-sans mt-4">Next number to find: <span class="font-bold text-[#0A66C2] text-sm">{{ nextZipNum() }}</span></p>
              }
            </div>
          }

          <div class="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <button (click)="closeGameModal()" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold px-5 py-2 rounded-full cursor-pointer border-0 font-sans">
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class NetworkComponent {
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  readonly users = this.stateService.users;
  readonly connections = this.stateService.connections;
  readonly activeAd = computed(() => {
    const approved = this.stateService.ads().filter(a => a.status === 'approved');
    return approved.length > 0 ? approved[0] : null;
  });

  // View state signals
  activeView = signal('grow'); // 'grow', 'connections', 'following', 'groups', 'events'
  growSubTab = signal('grow'); // 'grow' or 'catchup'
  activeFollowTab = signal('following'); // 'following' or 'followers'
  activeGroupTab = signal('groups'); // 'groups' or 'requested'

  // Search filter query
  searchQuery = '';

  // Solved games tracker
  solvedGames = signal<string[]>([]);

  // Games state signals
  showGameModal = signal<boolean>(false);
  currentGame = signal<string>('');
  gameStatus = signal<'playing' | 'won'>('playing');
  sudokuGrid = signal<number[][]>([[1, 0, 0, 4], [0, 4, 1, 0], [0, 1, 4, 0], [4, 0, 0, 1]]);
  patchesWords = signal<{ text: string; category: string; selected: boolean; grouped: boolean }[]>([]);
  zipNumbers = signal<{ num: number; clicked: boolean }[]>([]);
  nextZipNum = signal<number>(1);

  sudokuSolution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1]
  ];

  initialPatchesWords = [
    { text: 'Angular', category: 'Tech', selected: false, grouped: false },
    { text: 'TypeScript', category: 'Tech', selected: false, grouped: false },
    { text: 'RxJS', category: 'Tech', selected: false, grouped: false },
    { text: 'Signal', category: 'Tech', selected: false, grouped: false },
    { text: 'Forest', category: 'Nature', selected: false, grouped: false },
    { text: 'River', category: 'Nature', selected: false, grouped: false },
    { text: 'Mountain', category: 'Nature', selected: false, grouped: false },
    { text: 'Valley', category: 'Nature', selected: false, grouped: false }
  ];

  // Carousel slider indices
  gameIndex = signal(0);
  viewerIndex = signal(0);

  // SBI Ad follow state
  sbiFollowed = signal(false);

  // Striker follow state
  strikerFollowed = signal(false);

  // Creation modal display states
  showCreateGroupModal = signal(false);
  newGroupName = '';
  newGroupDesc = '';

  showCreateEventModal = signal(false);
  newEventName = '';
  newEventDate = '';
  newEventDesc = '';

  // Custom user lists
  myGroups = signal<{ name: string; desc: string }[]>([]);
  myEvents = signal<{ name: string; date: string; desc: string }[]>([]);

  games = [
    { title: 'Patches #81', desc: '1 connection played', icon: '🧩' },
    { title: 'Zip #446', desc: 'Saturday, Jun 6', icon: '🔢' },
    { title: 'Mini Sudoku #299', desc: 'Saturday, Jun 6', icon: '✏️' }
  ];

  exclusiveEvents = [
    { title: 'Find Your Market Rate (and Get Paid What You\'re Worth)', time: 'Mon, Jun 8, 2026, 9:30 PM', attendees: 'Unlock 50+ Premium events' },
    { title: 'The Introvert\'s Guide To Getting Booked', time: 'Tue, Jun 9, 2026, 9:30 PM', attendees: 'Unlock 50+ Premium events' },
    { title: 'Competing on Personalization', time: 'Wed, Jun 10, 2026, 8:30 PM', attendees: 'Unlock 50+ Premium events' }
  ];

  recommendedEvents = [
    { title: 'Fresher Grand IT Job Mela', time: 'Tue, Jun 9, 2026, 10:00 AM', company: 'QUASTECH' },
    { title: 'LexTalk World APAC 2026', time: 'Thu, Jun 11, 2026, 9:00 AM', company: 'LexTalk World' },
    { title: 'Adobe Customer Connect', time: 'Wed, Jun 10, 2026, 6:00 PM', company: 'Adobe' }
  ];

  followedPeople = signal([
    { id: 'f1', name: 'Ananthu K R', headline: 'Technical Specialist at Nokia', avatarInitials: 'AK', avatarColor: '#9b59b6', isFollowing: true },
    { id: 'f2', name: 'Kruti Shah', headline: 'Creating seamless employee journeys | People Ops | Senior HR Executive | Employee Lifecyl...', avatarInitials: 'KS', avatarColor: '#2ecc71', isFollowing: true },
    { id: 'f3', name: 'Pranjali Nikkhil Sonar', headline: 'Human Resources Manager at Involve Digital Technologies Private Limited | Currently Hiring...', avatarInitials: 'PS', avatarColor: '#e74c3c', isFollowing: true },
    { id: 'f4', name: 'Aimen Khan', headline: 'Product Manager @ Meta', avatarInitials: 'AK', avatarColor: '#1abc9c', isFollowing: true }
  ]);

  suggestedGroups = signal([
    { id: 'g1', name: 'Educational Leadership: System & School Improvement to Increase ALL Students\' Growth & Achievement', members: '311,025 members', isJoined: false },
    { id: 'g2', name: 'Data Scientist, Software Engineer, Python Developer, Programmer, Analyst, Gen AI, Machine Learning', members: '105,970 members', isJoined: false },
    { id: 'g3', name: 'CYBER SECURITY FORUM INITIATIVE - CSFI', members: '683,213 members', isJoined: false },
    { id: 'g4', name: 'The AI Marketer Connection', members: '51,700 members', isJoined: false }
  ]);

  // Pending Received Connections
  pendingReceived = computed(() =>
    this.connections().filter((c) => c.toId === this.currentUser()?.id && c.status === "pending")
  );

  // Suggestions list
  suggestions = computed(() => {
    return this.stateService.recommendedConnections().slice(0, 12);
  });

  // Connected users computed list
  connected = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.connections()
      .filter((c) => c.status === "accepted" && (c.fromId === user.id || c.toId === user.id))
      .map((c) => {
        const otherId = c.fromId === user.id ? c.toId : c.fromId;
        return this.users().find((u) => u.id === otherId);
      })
      .filter(Boolean) as User[];
  });

  // Filtered connections list based on Search
  filteredConnected = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const list = this.connected();
    if (!query) return list;
    return list.filter(u => u.name.toLowerCase().includes(query) || u.headline.toLowerCase().includes(query));
  });

  // Profile Viewers list
  profileViews = this.stateService.profileViewsList;

  // Games carousel visible subset
  visibleGames = computed(() => {
    const idx = this.gameIndex();
    return this.games.slice(idx, idx + 2);
  });

  // Viewers carousel visible subset
  visibleViewers = computed(() => {
    const idx = this.viewerIndex();
    return this.profileViews().slice(idx, idx + 2);
  });

  followedCount = computed(() => {
    return this.followedPeople().filter(p => p.isFollowing).length;
  });

  getRequestedGroups() {
    return this.suggestedGroups().filter(g => g.isJoined);
  }

  getSender(conn: Connection): User | undefined {
    return this.users().find((u) => u.id === conn.fromId);
  }

  getConnectionStatus(userId: string) {
    return this.stateService.getConnectionStatus(userId);
  }

  // Mutual connections mock count
  getMutualConnectionsDesc(userId?: string): string {
    if (!userId) return 'No mutual connections';
    // Generate a deterministic count based on userId string length
    const count = (userId.charCodeAt(0) * 3 + userId.length * 7) % 60 + 2;
    // Match the mock names from screens
    if (userId === 'u13') {
      return 'Bose Joseph and 19 other mutual connections';
    } else if (userId === 'u14') {
      return 'Thanseha Nargees and 9 other mutual connections';
    } else if (userId === 'u15') {
      return 'Bose Joseph and 66 other mutual connections';
    }
    return `${count} mutual connections`;
  }

  // Sidebar toggles
  toggleSbiFollow() {
    this.sbiFollowed.update(v => !v);
  }

  toggleStrikerFollow() {
    this.strikerFollowed.update(v => !v);
  }

  // Carousel slides handlers
  prevGame() {
    if (this.gameIndex() > 0) {
      this.gameIndex.set(this.gameIndex() - 1);
    }
  }

  nextGame() {
    if (this.gameIndex() < this.games.length - 2) {
      this.gameIndex.set(this.gameIndex() + 1);
    }
  }

  solveGame(title: string) {
    if (this.isGameSolved(title)) {
      this.solvedGames.update(list => list.filter(t => t !== title));
    } else {
      this.solvedGames.update(list => [...list, title]);
    }
  }

  isGameSolved(title: string) {
    return this.solvedGames().includes(title);
  }

  prevViewer() {
    if (this.viewerIndex() > 0) {
      this.viewerIndex.set(this.viewerIndex() - 1);
    }
  }

  nextViewer() {
    if (this.viewerIndex() < this.profileViews().length - 2) {
      this.viewerIndex.set(this.viewerIndex() + 1);
    }
  }

  dismissSuggestion(userId: string) {
    this.stateService.dismissSuggestion(userId);
  }

  ignoreConnection(connectionId: string) {
    this.stateService.ignoreConnection(connectionId);
  }

  acceptConnection(connectionId: string) {
    this.stateService.acceptConnection(connectionId);
  }

  sendConnectionRequest(userId: string) {
    this.stateService.sendConnectionRequest(userId);
  }

  removeConnection(userId: string) {
    this.stateService.removeConnection(userId);
  }

  messageUser(userId: string) {
    this.stateService.sendMessage(null, userId, "Hi, nice to connect!");
    this.router.navigate(['/messaging']);
  }

  toggleFollowPerson(id: string) {
    this.followedPeople.update(list =>
      list.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p)
    );
  }

  toggleGroupJoin(id: string) {
    this.suggestedGroups.update(list =>
      list.map(g => g.id === id ? { ...g, isJoined: !g.isJoined } : g)
    );
  }

  createGroup() {
    const name = this.newGroupName.trim();
    if (!name) return;
    this.myGroups.update(list => [...list, { name, desc: this.newGroupDesc.trim() }]);
    this.newGroupName = '';
    this.newGroupDesc = '';
    this.showCreateGroupModal.set(false);
  }

  createEvent() {
    const name = this.newEventName.trim();
    if (!name) return;
    let formattedDate = '';
    if (this.newEventDate) {
      const dt = new Date(this.newEventDate);
      formattedDate = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    this.myEvents.update(list => [...list, { name, date: formattedDate, desc: this.newEventDesc.trim() }]);
    this.newEventName = '';
    this.newEventDate = '';
    this.newEventDesc = '';
    this.showCreateEventModal.set(false);
  }

  // Games methods
  isOriginalSudokuCell(row: number, col: number): boolean {
    const originalMask = [
      [true, false, false, true],
      [false, true, true, false],
      [false, true, true, false],
      [true, false, false, true]
    ];
    return originalMask[row][col];
  }

  cycleSudokuCell(row: number, col: number) {
    if (this.isOriginalSudokuCell(row, col) || this.gameStatus() === 'won') return;
    const currentGrid = this.sudokuGrid().map(r => [...r]);
    const current = currentGrid[row][col];
    let nextVal = 0;
    if (current === 0) nextVal = 1;
    else if (current === 1) nextVal = 2;
    else if (current === 2) nextVal = 3;
    else if (current === 3) nextVal = 4;
    else if (current === 4) nextVal = 0;
    currentGrid[row][col] = nextVal;
    this.sudokuGrid.set(currentGrid);
    this.checkSudokuWin();
  }

  checkSudokuWin() {
    const grid = this.sudokuGrid();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] !== this.sudokuSolution[r][c]) {
          return;
        }
      }
    }
    this.gameStatus.set('won');
    this.solvedGames.update(list => list.includes(this.currentGame()) ? list : [...list, this.currentGame()]);
  }

  selectPatchesWord(word: any) {
    if (word.grouped || this.gameStatus() === 'won') return;
    
    const words = this.patchesWords().map(w => w.text === word.text ? { ...w, selected: !w.selected } : w);
    this.patchesWords.set(words);

    const selectedWords = words.filter(w => w.selected);
    if (selectedWords.length === 4) {
      const allInSameCategory = selectedWords.every(w => w.category === selectedWords[0].category);
      if (allInSameCategory) {
        setTimeout(() => {
          const groupedWords = this.patchesWords().map(w => {
            if (w.selected) {
              return { ...w, selected: false, grouped: true };
            }
            return w;
          });
          this.patchesWords.set(groupedWords);
          
          if (groupedWords.every(w => w.grouped)) {
            this.gameStatus.set('won');
            this.solvedGames.update(list => list.includes(this.currentGame()) ? list : [...list, this.currentGame()]);
          }
        }, 300);
      } else {
        setTimeout(() => {
          const resetWords = this.patchesWords().map(w => {
            if (w.selected) {
              return { ...w, selected: false };
            }
            return w;
          });
          this.patchesWords.set(resetWords);
        }, 500);
      }
    }
  }

  clickZipNumber(item: any) {
    if (item.clicked || this.gameStatus() === 'won') return;
    if (item.num === this.nextZipNum()) {
      const updated = this.zipNumbers().map(z => z.num === item.num ? { ...z, clicked: true } : z);
      this.zipNumbers.set(updated);
      this.nextZipNum.set(this.nextZipNum() + 1);
      if (this.nextZipNum() > 8) {
        this.gameStatus.set('won');
        this.solvedGames.update(list => list.includes(this.currentGame()) ? list : [...list, this.currentGame()]);
      }
    }
  }

  openGame(gameName: string): void {
    this.currentGame.set(gameName);
    this.gameStatus.set('playing');
    if (gameName.includes('Sudoku')) {
      this.sudokuGrid.set([
        [1, 0, 0, 4],
        [0, 4, 1, 0],
        [0, 1, 4, 0],
        [4, 0, 0, 1]
      ]);
    } else if (gameName.includes('Patches')) {
      const words = this.initialPatchesWords.map(w => ({ ...w, selected: false, grouped: false }));
      this.patchesWords.set(this.shuffleArray(words));
    } else if (gameName.includes('Zip')) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({ num: n, clicked: false }));
      this.zipNumbers.set(this.shuffleArray(nums));
      this.nextZipNum.set(1);
    }
    this.showGameModal.set(true);
  }

  closeGameModal(): void {
    this.showGameModal.set(false);
  }

  shuffleArray(array: any[]): any[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
