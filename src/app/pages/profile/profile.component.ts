import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { User, Experience, Education } from '../../services/state.types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-[860px] mx-auto px-4 py-4 mt-14 space-y-3">
      <!-- Profile Header banner Card -->
      <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden">
        <!-- Cover banner style background with Change Cover Button -->
        <div class="relative group h-36 w-full bg-[#E0DFDC]">
          @if (profileUser()?.coverUrl) {
            <img [src]="profileUser()!.coverUrl" class="w-full h-full object-cover" alt="Cover Banner" />
          } @else {
            <div class="w-full h-full" [style.background]="profileUser()?.coverColor || 'linear-gradient(135deg, #0A66C2, #004182)'"></div>
          }
          @if (isOwnProfile()) {
            <input type="file" #profileCoverInput (change)="onUploadCover($event)" class="hidden" accept="image/*" />
            <button (click)="profileCoverInput.click()" class="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold cursor-pointer" title="Change Cover Banner">
              📷 Change Cover
            </button>
          }
        </div>
        
        <div class="px-5 pb-4">
          <div class="flex items-end justify-between -mt-12 mb-3">
            <!-- Large Avatar with Camera Edit Overlay -->
            <div class="relative group w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-sm flex items-center justify-center bg-[#0A66C2] flex-shrink-0">
              @if (profileUser()?.avatarUrl) {
                <img [src]="profileUser()!.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
              } @else {
                <span class="text-white font-bold text-3xl">{{ profileUser()?.avatarInitials }}</span>
              }
              @if (profileUser()?.openToWork || profileUser()?.isHiring) {
                <svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full pointer-events-none select-none z-10">
                  <defs>
                    <!-- Paths when ONLY one badge is active -->
                    <!-- #OPENTOWORK (Bottom-Left) -->
                    <path id="arcOpenOnly" d="M 12,28 A 44,44 0 0,0 78,84" />
                    <path id="textArcOpenOnly" d="M 14.5,29.5 A 40,40 0 0,0 74.5,80.5" />
                    
                    <!-- #HIRING (Bottom-Right) -->
                    <path id="arcHiringOnly" d="M 22,84 A 44,44 0 0,0 88,28" />
                    <path id="textArcHiringOnly" d="M 24.5,80.5 A 40,40 0 0,0 84.5,29.5" />
                    
                    <!-- Paths when BOTH badges are active -->
                    <!-- #OPENTOWORK (Left-Half) -->
                    <path id="arcOpenBoth" d="M 24.8,14 A 44,44 0 0,0 24.8,86" />
                    <path id="textArcOpenBoth" d="M 27,17.2 A 40,40 0 0,0 27,82.8" />
                    
                    <!-- #HIRING (Right-Half) -->
                    <path id="arcHiringBoth" d="M 75.2,86 A 44,44 0 0,0 75.2,14" />
                    <path id="textArcHiringBoth" d="M 73,82.8 A 40,40 0 0,0 73,17.2" />
                  </defs>

                  @if (profileUser()?.openToWork && profileUser()?.isHiring) {
                    <!-- #OPENTOWORK (Left) -->
                    <use href="#arcOpenBoth" fill="none" stroke="#057642" stroke-width="12" />
                    <text fill="white" font-size="5.2" font-weight="900" letter-spacing="0.6" font-family="system-ui, sans-serif">
                      <textPath href="#textArcOpenBoth" startOffset="50%" text-anchor="middle">#OPENTOWORK</textPath>
                    </text>

                    <!-- #HIRING (Right) -->
                    <use href="#arcHiringBoth" fill="none" stroke="#7A15F7" stroke-width="12" />
                    <text fill="white" font-size="5.2" font-weight="900" letter-spacing="0.6" font-family="system-ui, sans-serif">
                      <textPath href="#textArcHiringBoth" startOffset="50%" text-anchor="middle">#HIRING</textPath>
                    </text>
                  }
                  @else if (profileUser()?.openToWork) {
                    <use href="#arcOpenOnly" fill="none" stroke="#057642" stroke-width="12" />
                    <text fill="white" font-size="5.2" font-weight="900" letter-spacing="0.6" font-family="system-ui, sans-serif">
                      <textPath href="#textArcOpenOnly" startOffset="50%" text-anchor="middle">#OPENTOWORK</textPath>
                    </text>
                  }
                  @else if (profileUser()?.isHiring) {
                    <use href="#arcHiringOnly" fill="none" stroke="#7A15F7" stroke-width="12" />
                    <text fill="white" font-size="5.2" font-weight="900" letter-spacing="0.6" font-family="system-ui, sans-serif">
                      <textPath href="#textArcHiringOnly" startOffset="50%" text-anchor="middle">#HIRING</textPath>
                    </text>
                  }
                </svg>
              }
              @if (isOwnProfile()) {
                <input type="file" #profileAvatarInput (change)="onUploadAvatar($event)" class="hidden" accept="image/*" />
                <button (click)="profileAvatarInput.click()" class="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold cursor-pointer">
                  Update
                </button>
              }
            </div>

            <!-- Intro / Follow Action CTA Buttons -->
            @if (isOwnProfile()) {
              <button
                (click)="openEditModal()"
                data-testid="button-edit-profile"
                class="flex items-center gap-1.5 border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors"
              >
                <!-- Pencil icon SVG -->
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                Edit profile
              </button>
            } @else {
              <div class="flex items-center gap-2">
                @if (connectionStatus() === 'connected') {
                  <button class="bg-[#0A66C2] text-white text-sm font-semibold rounded-full px-5 py-2 flex items-center gap-2 hover:bg-[#004182]">
                    <!-- Check icon SVG -->
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Connected
                  </button>
                } @else if (connectionStatus() === 'pending_sent') {
                  <button disabled class="border border-gray-300 text-gray-500 text-sm font-semibold rounded-full px-5 py-2">
                    Pending
                  </button>
                } @else {
                  <button
                    (click)="handleConnect()"
                    data-testid="button-connect-profile"
                    class="bg-[#0A66C2] text-white text-sm font-semibold rounded-full px-5 py-2 hover:bg-[#004182] flex items-center gap-2"
                  >
                    <!-- UserPlus icon SVG -->
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                    Connect
                  </button>
                }
                <button (click)="messageUser()" class="border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full px-5 py-2 hover:bg-blue-50 flex items-center gap-2">
                  <!-- MessageSquare icon SVG -->
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Message
                </button>
              </div>
            }
          </div>

          <div class="flex flex-col md:flex-row justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-2xl font-semibold text-gray-900 leading-tight">{{ profileUser()?.name }}</h1>
                @if (profileUser()?.pronouns) {
                  <span class="text-gray-500 text-sm font-normal">({{ profileUser()?.pronouns }})</span>
                }
              </div>
              <p class="text-base text-gray-700 mt-1 leading-normal">{{ profileUser()?.headline }}</p>
              @if (profileUser()?.industry) {
                <p class="text-xs text-gray-500 mt-1 font-medium">{{ profileUser()?.industry }}</p>
              }
              
              <div class="flex items-center gap-3 mt-2 text-sm text-gray-500 flex-wrap">
                @if (profileUser()?.location) {
                  <span class="flex items-center gap-1">
                    <!-- MapPin icon SVG -->
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ profileUser()?.location }}
                  </span>
                }
                <a routerLink="/my-network" class="text-[#0A66C2] font-semibold cursor-pointer hover:underline flex items-center gap-1">
                  <!-- Users icon SVG -->
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ profileUser()?.connections }} connections
                </a>
                <span class="text-gray-400">&bull;</span>
                <button (click)="openViewContactInfoModal()" class="text-[#0A66C2] font-semibold cursor-pointer hover:underline flex items-center gap-1 bg-transparent border-0 p-0">
                  Contact info
                </button>
              </div>
            </div>

            <!-- Education school inline row -->
            @if (profileUser()?.showSchoolInIntro !== false && getSchoolToShow(); as school) {
              <div class="flex items-center gap-2 text-xs font-semibold text-gray-800 hover:text-[#0A66C2] hover:underline cursor-pointer flex-shrink-0 mt-1 md:mt-0" [routerLink]="[]" fragment="education-section">
                <div class="w-8 h-8 bg-gray-50 rounded border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0 text-sm font-bold">
                  🎓
                </div>
                <span class="max-w-[180px] leading-tight">{{ school.school }}</span>
              </div>
            }
          </div>

          <!-- Open To Work / CTA additions -->
          @if (isOwnProfile()) {
            <div class="mt-3 flex items-center gap-2 flex-wrap">
              <button (click)="toggleOpenToWork()" class="border border-[#0A66C2] text-[#0A66C2] text-sm font-semibold rounded-full px-4 py-1.5 hover:bg-blue-50 transition-colors">
                {{ profileUser()?.openToWork ? 'Disable #OpenToWork' : 'Enable #OpenToWork' }}
              </button>
              <button (click)="toggleIsHiring()" class="border border-[#7A15F7] text-[#7A15F7] text-sm font-semibold rounded-full px-4 py-1.5 hover:bg-purple-50 transition-colors">
                {{ profileUser()?.isHiring ? 'Disable #Hiring' : 'Enable #Hiring' }}
              </button>
              <button class="border border-gray-400 text-gray-700 text-sm font-semibold rounded-full px-4 py-1.5 hover:bg-gray-100 transition-colors">
                Add profile section
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Analytics Section (Only for own profile) -->
      @if (isOwnProfile()) {
        <div class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
          <div class="flex items-center gap-1.5 mb-1">
            <h2 class="font-semibold text-gray-900 text-base">Analytics</h2>
            <span class="text-xs text-gray-500 flex items-center gap-1">
              <!-- Eye icon SVG -->
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Private to you
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 py-2">
            <!-- Profile Views Column -->
            <a routerLink="/analytics" class="group block cursor-pointer hover:bg-gray-50/50 p-2 rounded transition-colors">
              <div class="flex items-center gap-2">
                <!-- UserGroup icon SVG -->
                <svg class="w-5 h-5 text-gray-500 group-hover:text-[#0A66C2] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                <span class="text-sm font-semibold text-gray-800 group-hover:text-[#0A66C2] group-hover:underline transition-colors">{{ (profileUser()?.profileViews || 13) }} profile views</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 pl-7 leading-normal">Discover who's viewed your profile.</p>
            </a>

            <!-- Post Impressions Column -->
            <a routerLink="/analytics" class="group block cursor-pointer hover:bg-gray-50/50 p-2 rounded transition-colors">
              <div class="flex items-center gap-2">
                <!-- BarChart icon SVG -->
                <svg class="w-5 h-5 text-gray-500 group-hover:text-[#0A66C2] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/></svg>
                <span class="text-sm font-semibold text-gray-800 group-hover:text-[#0A66C2] group-hover:underline transition-colors">{{ totalImpressions() }} post impressions</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 pl-7 leading-normal">Start a post to increase engagement.</p>
              <p class="text-[10px] text-gray-400 pl-7 mt-0.5">Past 7 days</p>
            </a>

            <!-- Search Appearances Column -->
            <a routerLink="/analytics" class="group block cursor-pointer hover:bg-gray-50/50 p-2 rounded transition-colors">
              <div class="flex items-center gap-2">
                <!-- Search icon SVG -->
                <svg class="w-5 h-5 text-gray-500 group-hover:text-[#0A66C2] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <span class="text-sm font-semibold text-gray-800 group-hover:text-[#0A66C2] group-hover:underline transition-colors">{{ searchAppearances() }} search appearances</span>
              </div>
              <p class="text-xs text-gray-500 mt-1 pl-7 leading-normal">See how often you appear in search results.</p>
            </a>
          </div>

          <!-- Show all -> Link -->
          <div class="border-t border-gray-100 pt-3 mt-2 flex justify-center">
            <a routerLink="/analytics" class="text-sm font-semibold text-gray-600 hover:text-[#0A66C2] hover:bg-gray-50 px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer">
              Show all analytics &rarr;
            </a>
          </div>
        </div>
      }

      <!-- About Section -->
      @if (profileUser()?.about) {
        <div class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
          <h2 class="font-semibold text-gray-900 text-lg mb-3">About</h2>
          <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ profileUser()?.about }}</p>
        </div>
      }

      <!-- Experience Section -->
      <div class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-900 text-lg">Experience</h2>
          @if (isOwnProfile()) {
            <button (click)="openAddExp()" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <!-- Plus icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          }
        </div>

        @if (!profileUser()?.experience?.length) {
          <p class="text-sm text-gray-400">No experience added yet</p>
        } @else {
          <div class="space-y-4">
            @for (exp of profileUser()?.experience; track exp.id) {
              <div class="flex items-start gap-3" [attr.data-testid]="'card-experience-' + exp.id">
                <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <!-- Briefcase icon -->
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm text-gray-900">{{ exp.title }}</p>
                  <p class="text-sm text-gray-700">{{ exp.company }}</p>
                  <p class="text-xs text-gray-500">
                    {{ exp.startDate }} &ndash; {{ exp.endDate || 'Present' }}
                  </p>
                  @if (exp.description) {
                    <p class="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-wrap">{{ exp.description }}</p>
                  }
                </div>
                @if (isOwnProfile()) {
                  <button
                    (click)="removeExperience(exp.id)"
                    class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 flex-shrink-0"
                    title="Remove"
                  >
                    <!-- Trash icon -->
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Education Section -->
      <div id="education-section" class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-900 text-lg">Education</h2>
          @if (isOwnProfile()) {
            <button (click)="openAddEducationModal()" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          }
        </div>
        @if (!profileUser()?.education?.length) {
          <p class="text-sm text-gray-400">No education added yet</p>
        } @else {
          <div class="space-y-4">
            @for (edu of profileUser()?.education; track edu.id) {
              <div class="flex items-start justify-between gap-3" [attr.data-testid]="'card-education-' + edu.id">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-400 font-bold">
                    🎓
                  </div>
                  <div>
                    <p class="font-semibold text-sm text-gray-900">{{ edu.school }}</p>
                    <p class="text-sm text-gray-700">{{ edu.degree }}, {{ edu.field }}</p>
                    <p class="text-xs text-gray-500">{{ edu.startYear }} &ndash; {{ edu.endYear }}</p>
                  </div>
                </div>
                @if (isOwnProfile()) {
                  <button
                    (click)="removeEducation(edu.id)"
                    class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 flex-shrink-0"
                    title="Remove"
                  >
                    <!-- Trash icon -->
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>

      <!-- Skills badges -->
      <div class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-900 text-lg">Skills</h2>
          @if (isOwnProfile()) {
            <button (click)="openEditSkillsModal()" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600" title="Edit Skills">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
          }
        </div>
        
        @if (!profileUser()?.skills?.length) {
          <p class="text-sm text-gray-400">No skills added yet</p>
        } @else {
          <div class="flex flex-wrap gap-2">
            @for (skill of profileUser()?.skills; track skill) {
              <span
                [attr.data-testid]="'badge-skill-' + skill"
                class="border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold rounded-full px-3 py-1 hover:bg-blue-50 cursor-default animate-in fade-in duration-200"
              >
                {{ skill }}
              </span>
            }
          </div>
        }
      </div>

      <!-- Activity lists -->
      @if (userPosts().length > 0) {
        <div class="bg-white rounded-lg border border-[#E0DFDC] px-5 py-4">
          <h2 class="font-semibold text-gray-900 text-lg mb-3">Activity</h2>
          <div class="space-y-3">
            @for (post of userPosts().slice(0, 3); track post.id) {
              <div class="border border-gray-200 rounded-lg p-3 text-sm text-gray-700" [attr.data-testid]="'card-activity-' + post.id">
                <p class="line-clamp-2">{{ post.content }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ post.likes.length }} likes &bull; {{ post.comments.length }} comments</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- EDIT INTRO MODAL OVERLAY -->
      @if (showEditModal() && profileUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[700px] shadow-xl overflow-hidden max-h-[90vh] flex flex-col" data-testid="modal-edit-profile">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 class="font-semibold text-gray-900 text-lg">Edit intro</h2>
              <button (click)="closeEditModal()" class="p-1 hover:bg-gray-100 rounded-full">
                <!-- X Close SVG icon -->
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Content Area (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <!-- Basic Info Section -->
              <div class="space-y-4">
                <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-1">Basic info</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="text-xs text-gray-600 block mb-1">First name*</label>
                    <input
                      [(ngModel)]="editFirstName"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 block mb-1">Last name*</label>
                    <input
                      [(ngModel)]="editLastName"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label class="text-xs text-gray-600 block mb-1">Additional name</label>
                  <input
                    [(ngModel)]="editAdditionalName"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>

                <div class="bg-gray-50 p-2.5 rounded border border-gray-150">
                  <p class="text-xs font-semibold text-gray-800">Name pronunciation</p>
                  <p class="text-[11px] text-gray-500 mt-0.5">ℹ️ This can only be added using our mobile app</p>
                </div>

                <div>
                  <label class="text-xs text-gray-600 block mb-1">Pronouns</label>
                  <select
                    [(ngModel)]="editPronouns"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white"
                  >
                    <option value="">Please select</option>
                    <option value="He/Him">He/Him</option>
                    <option value="She/Her">She/Her</option>
                    <option value="They/Them">They/Them</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <p class="text-[10px] text-gray-400 mt-1">Let others know how to refer to you.</p>
                </div>

                <div>
                  <label class="text-xs text-gray-600 block mb-1">Headline*</label>
                  <textarea
                    [(ngModel)]="editHeadline"
                    rows="2"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"
                  ></textarea>
                </div>
              </div>

              <!-- Current Position Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h3 class="text-base font-semibold text-gray-900">Current position</h3>
                  <button (click)="openAddExp(); closeEditModal()" class="text-[#0A66C2] font-semibold text-xs hover:underline">
                    + Add new position
                  </button>
                </div>

                <div>
                  <label class="text-xs text-gray-600 block mb-1">Industry*</label>
                  <input
                    [(ngModel)]="editIndustry"
                    placeholder="e.g. Technology, Education, Finance"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                  <p class="text-[10px] text-gray-400 mt-1">Learn more about <a href="https://www.linkedin.com/help" target="_blank" class="text-[#0A66C2] hover:underline">industry options</a></p>
                </div>
              </div>

              <!-- Education Section -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h3 class="text-base font-semibold text-gray-900">Education</h3>
                  <button (click)="openAddEducationModal(); closeEditModal()" class="text-[#0A66C2] font-semibold text-xs hover:underline">
                    + Add new education
                  </button>
                </div>

                @if (profileUser()?.education?.length) {
                  <div>
                    <label class="text-xs text-gray-600 block mb-1">School*</label>
                    <select
                      [(ngModel)]="editSchoolId"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                    >
                      @for (edu of profileUser()?.education; track edu.id) {
                        <option [value]="edu.id">{{ edu.school }}</option>
                      }
                    </select>
                  </div>
                } @else {
                  <p class="text-xs text-gray-500 py-1">No education records found. Add one to show it in your intro.</p>
                }

                <div class="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="showSchoolCheckbox"
                    [(ngModel)]="editShowSchoolInIntro"
                    class="w-4 h-4 border border-gray-300 rounded accent-[#057642] cursor-pointer"
                  />
                  <label for="showSchoolCheckbox" class="text-xs text-gray-700 font-semibold cursor-pointer">
                    Show school in my intro
                  </label>
                </div>
              </div>

              <!-- Location Section -->
              <div class="space-y-4">
                <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-1">Location</h3>
                
                <div>
                  <label class="text-xs text-gray-600 block mb-1">Country/Region*</label>
                  <input
                    [(ngModel)]="editCountry"
                    placeholder="e.g. India, United States"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="text-xs text-gray-600 block mb-1">City</label>
                  <input
                    [(ngModel)]="editCity"
                    placeholder="e.g. Thrissur, Kerala"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
              </div>

              <!-- Contact Info Section -->
              <div class="space-y-2 border-t border-gray-100 pt-3">
                <h3 class="text-xs font-semibold text-gray-700">Contact info</h3>
                <p class="text-[11px] text-gray-500">Add or edit your profile URL, email, and more</p>
                <button (click)="openEditContactModal(); closeEditModal()" class="text-[#0A66C2] font-semibold text-xs hover:underline block pt-1">
                  Edit contact info
                </button>
              </div>
            </div>

            <!-- Footer (Save Button) -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
              <button
                (click)="saveProfile()"
                data-testid="button-save-profile"
                [disabled]="!editFirstName || !editLastName || !editHeadline"
                class="bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-sm font-semibold rounded-full px-6 py-2 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ADD EXPERIENCE MODAL OVERLAY -->
      @if (showAddExp()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[600px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900 text-lg">Add experience</h2>
              <button (click)="closeAddExp()" class="p-1 hover:bg-gray-100 rounded-full">
                <!-- X icon -->
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Title *</label>
                <input [(ngModel)]="expTitle" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Company *</label>
                <input [(ngModel)]="expCompany" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="e.g. Google" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Start date</label>
                <input type="month" [(ngModel)]="expStartDate" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Description</label>
                <textarea [(ngModel)]="expDescription" rows="3" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"></textarea>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button (click)="closeAddExp()" class="border border-gray-400 text-gray-600 text-sm font-semibold rounded-full px-5 py-2 hover:bg-gray-100">Cancel</button>
              <button (click)="saveExperience()" [disabled]="!expTitle || !expCompany" class="bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 text-white text-sm font-semibold rounded-full px-5 py-2">Save</button>
            </div>
          </div>
        </div>
      }

      <!-- ADD EDUCATION MODAL OVERLAY -->
      @if (showAddEdu()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[600px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900 text-lg">Add education</h2>
              <button (click)="closeAddEdu()" class="p-1 hover:bg-gray-100 rounded-full">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">School *</label>
                <input [(ngModel)]="eduSchool" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="e.g. Stanford University" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Degree *</label>
                <input [(ngModel)]="eduDegree" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="e.g. Bachelor's Degree" />
              </div>
              <div>
                <label class="text-sm font-semibold text-gray-700 block mb-1">Field of study *</label>
                <input [(ngModel)]="eduField" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="e.g. Computer Science" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-semibold text-gray-700 block mb-1">Start Year</label>
                  <input type="number" [(ngModel)]="eduStartYear" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="2022" />
                </div>
                <div>
                  <label class="text-sm font-semibold text-gray-700 block mb-1">End Year (or expected)</label>
                  <input type="number" [(ngModel)]="eduEndYear" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" placeholder="2026" />
                </div>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button (click)="closeAddEdu()" class="border border-gray-400 text-gray-600 text-sm font-semibold rounded-full px-5 py-2 hover:bg-gray-100">Cancel</button>
              <button (click)="saveEducation()" [disabled]="!eduSchool || !eduDegree || !eduField" class="bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 text-white text-sm font-semibold rounded-full px-5 py-2">Save</button>
            </div>
          </div>
        </div>
      }

      <!-- VIEW CONTACT INFO MODAL OVERLAY -->
      @if (showViewContactModal() && profileUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[500px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900 text-lg">Contact info</h2>
              <div class="flex items-center gap-2">
                @if (isOwnProfile()) {
                  <button (click)="openEditContactModal(); closeViewContactInfoModal()" class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600" title="Edit contact info">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                  </button>
                }
                <button (click)="closeViewContactInfoModal()" class="p-1 hover:bg-gray-100 rounded-full">
                  <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="px-6 py-5 space-y-4 text-sm bg-white">
              <!-- Profile Link -->
              <div>
                <p class="font-semibold text-gray-900 mb-0.5">Your Profile URL</p>
                <a [href]="'/profile/' + profileUser()?.id" class="text-[#0A66C2] hover:underline font-medium break-all flex items-center gap-1">
                  http://localhost:4200/profile/{{ profileUser()?.id }}
                  <svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <!-- Email -->
              <div>
                <p class="font-semibold text-gray-900 mb-0.5">Email</p>
                <a [href]="'mailto:' + profileUser()?.email" class="text-[#0A66C2] hover:underline font-medium flex items-center gap-1">
                  {{ profileUser()?.email }}
                  <svg class="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <!-- Phone -->
              @if (profileUser()?.phone) {
                <div>
                  <p class="font-semibold text-gray-900 mb-0.5">Phone number</p>
                  <p class="text-gray-700 font-medium">{{ profileUser()?.phone }} ({{ profileUser()?.phoneType || 'Mobile' }})</p>
                </div>
              }

              <!-- Address -->
              @if (profileUser()?.address) {
                <div>
                  <p class="font-semibold text-gray-900 mb-0.5">Address</p>
                  <p class="text-gray-700 font-medium whitespace-pre-wrap">{{ profileUser()?.address }}</p>
                </div>
              }

              <!-- Birthday -->
              @if (profileUser()?.birthdayMonth && profileUser()?.birthdayDay) {
                <div>
                  <p class="font-semibold text-gray-900 mb-0.5">Birthday</p>
                  <p class="text-gray-700 font-medium">{{ profileUser()?.birthdayMonth }} {{ profileUser()?.birthdayDay }} (Visible to: {{ profileUser()?.birthdayVisibility || 'Your network' }})</p>
                </div>
              }

              <!-- Websites -->
              @if (profileUser()?.websites?.length) {
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Websites</p>
                  <ul class="list-disc list-inside space-y-1">
                    @for (web of profileUser()?.websites; track web.url) {
                      <li>
                        <a [href]="web.url" target="_blank" class="text-[#0A66C2] hover:underline font-medium inline-flex items-center gap-1">
                          {{ web.url }} ({{ web.label }})
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                        </a>
                      </li>
                    }
                  </ul>
                </div>
              }

              <!-- Instant Messaging -->
              @if (profileUser()?.instantMessaging?.length) {
                <div>
                  <p class="font-semibold text-gray-900 mb-1">Instant messaging</p>
                  <ul class="list-disc list-inside space-y-1">
                    @for (im of profileUser()?.instantMessaging; track im.handle) {
                      <li class="text-gray-700 font-medium">
                        {{ im.handle }} ({{ im.platform }})
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- EDIT CONTACT INFO MODAL OVERLAY -->
      @if (showEditContactModal() && profileUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[650px] shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 class="font-semibold text-gray-900 text-lg">Edit contact info</h2>
              <button (click)="closeEditContactModal()" class="p-1 hover:bg-gray-100 rounded-full">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Content Area (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              <!-- Profile URL -->
              <div>
                <p class="text-xs text-gray-500 font-semibold mb-1">Profile URL</p>
                <a [href]="'/profile/' + profileUser()?.id" class="text-[#0A66C2] font-semibold text-sm hover:underline break-all inline-flex items-center gap-1">
                  http://localhost:4200/profile/{{ profileUser()?.id }}
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <!-- Email -->
              <div>
                <p class="text-xs text-gray-500 font-semibold mb-1">Email</p>
                <a [href]="'mailto:' + profileUser()?.email" class="text-[#0A66C2] font-semibold text-sm hover:underline inline-flex items-center gap-1">
                  {{ profileUser()?.email }}
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                </a>
              </div>

              <!-- Phone number -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs text-gray-600 block mb-1">Phone number</label>
                  <input
                    [(ngModel)]="editPhone"
                    type="tel"
                    placeholder="e.g. +1 555-0199"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
                <div>
                  <label class="text-xs text-gray-600 block mb-1">Phone type</label>
                  <select
                    [(ngModel)]="editPhoneType"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                  >
                    <option value="Mobile">Mobile</option>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                  </select>
                </div>
              </div>

              <!-- Address -->
              <div>
                <div class="flex justify-between items-baseline mb-1">
                  <label class="text-xs text-gray-600 font-semibold block">Address*</label>
                  <span class="text-[10px] text-gray-400">{{ editAddress.length }}/220</span>
                </div>
                <textarea
                  [(ngModel)]="editAddress"
                  rows="3"
                  maxLength="220"
                  placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View, CA"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"
                ></textarea>
              </div>

              <!-- Birthday -->
              <div>
                <label class="text-xs text-gray-600 block mb-1">Birthday</label>
                <div class="grid grid-cols-2 gap-4">
                  <select
                    [(ngModel)]="editBirthdayMonth"
                    class="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                  >
                    <option value="">Month</option>
                    @for (month of monthsArray; track month) {
                      <option [value]="month">{{ month }}</option>
                    }
                  </select>
                  <select
                    [(ngModel)]="editBirthdayDay"
                    class="border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                  >
                    <option value="">Day</option>
                    @for (day of daysArray; track day) {
                      <option [value]="day">{{ day }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Birthday Visibility -->
              <div>
                <label class="text-xs text-gray-600 block mb-1">Birthday visibility</label>
                <select
                  [(ngModel)]="editBirthdayVisibility"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                >
                  <option value="Only you">🔒 Only you</option>
                  <option value="Your connections">👥 Your connections</option>
                  <option value="Your network">🌐 Your network</option>
                  <option value="Public">🌍 Public</option>
                </select>
              </div>

              <!-- Websites Section -->
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h3 class="text-sm font-semibold text-gray-900">Website</h3>
                  <button (click)="addWebsiteField()" class="text-[#0A66C2] font-semibold text-xs hover:underline flex items-center gap-1">
                    + Add website
                  </button>
                </div>
                @if (editWebsites.length === 0) {
                  <p class="text-xs text-gray-500 italic">No websites added.</p>
                } @else {
                  <div class="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                    @for (web of editWebsites; track $index) {
                      <div class="flex items-center gap-2 animate-in fade-in duration-200">
                        <input
                          [(ngModel)]="web.url"
                          placeholder="https://mywebsite.com"
                          class="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#0A66C2] focus:outline-none"
                        />
                        <select
                          [(ngModel)]="web.label"
                          class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#0A66C2] focus:outline-none bg-white w-32 font-medium"
                        >
                          <option value="Personal">Personal</option>
                          <option value="Company">Company</option>
                          <option value="Blog">Blog</option>
                          <option value="RSS Feed">RSS Feed</option>
                          <option value="Portfolio">Portfolio</option>
                          <option value="Other">Other</option>
                        </select>
                        <button
                          (click)="removeWebsiteField($index)"
                          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Instant Messaging Section -->
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-gray-100 pb-1">
                  <h3 class="text-sm font-semibold text-gray-900">Instant messaging</h3>
                  <button (click)="addMessagingField()" class="text-[#0A66C2] font-semibold text-xs hover:underline flex items-center gap-1">
                    + Add messaging option
                  </button>
                </div>
                @if (editInstantMessaging.length === 0) {
                  <p class="text-xs text-gray-500 italic">No messaging accounts added.</p>
                } @else {
                  <div class="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                    @for (im of editInstantMessaging; track $index) {
                      <div class="flex items-center gap-2 animate-in fade-in duration-200">
                        <input
                          [(ngModel)]="im.handle"
                          placeholder="handle or username"
                          class="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#0A66C2] focus:outline-none"
                        />
                        <select
                          [(ngModel)]="im.platform"
                          class="border border-gray-300 rounded px-3 py-1.5 text-sm focus:border-[#0A66C2] focus:outline-none bg-white w-32 font-medium"
                        >
                          <option value="Skype">Skype</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Slack">Slack</option>
                          <option value="Discord">Discord</option>
                          <option value="WeChat">WeChat</option>
                          <option value="Telegram">Telegram</option>
                          <option value="Other">Other</option>
                        </select>
                        <button
                          (click)="removeMessagingField($index)"
                          class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-between bg-white items-center">
              <button
                (click)="goBackFromContactEdit()"
                class="border border-gray-400 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-full px-5 py-2 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                (click)="saveContactInfo()"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded-full px-6 py-2 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      }

      <!-- EDIT SKILLS MODAL OVERLAY -->
      @if (showEditSkillsModal() && profileUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[500px] shadow-xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h2 class="font-semibold text-gray-900 text-lg">Edit skills</h2>
              <button (click)="closeEditSkillsModal()" class="p-1 hover:bg-gray-100 rounded-full">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <!-- Add Skill Input -->
              <div>
                <label class="text-xs text-gray-600 block mb-1">Add a new skill</label>
                <div class="flex gap-2">
                  <input
                    [(ngModel)]="newSkillInput"
                    (keydown.enter)="addSkill()"
                    placeholder="e.g. Angular, UX Design, Python"
                    class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                  />
                  <button
                    (click)="addSkill()"
                    class="bg-[#0A66C2] hover:bg-[#004182] text-white px-4 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <!-- Suggested Skills -->
              <div>
                <span class="text-xs text-gray-500 block mb-2">Suggested based on your profile:</span>
                <div class="flex flex-wrap gap-1.5">
                  @for (suggested of suggestedSkills; track suggested) {
                    @if (!profileUser()?.skills?.includes(suggested)) {
                      <button
                        (click)="addSuggestedSkill(suggested)"
                        class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-full transition-colors font-medium border border-gray-200 cursor-pointer"
                      >
                        + {{ suggested }}
                      </button>
                    }
                  }
                </div>
              </div>

              <!-- Skills List -->
              <div class="space-y-2 pt-2 border-t border-gray-100">
                <span class="text-xs font-semibold text-gray-700 block mb-1">Your skills ({{ profileUser()?.skills?.length || 0 }})</span>
                @if (!profileUser()?.skills?.length) {
                  <p class="text-xs text-gray-400 italic">No skills added yet.</p>
                } @else {
                  <div class="max-h-[30vh] overflow-y-auto pr-1 space-y-2">
                    @for (skill of profileUser()?.skills; track skill) {
                      <div class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded border border-gray-150 animate-in fade-in duration-200">
                        <span class="text-sm font-medium text-gray-800">{{ skill }}</span>
                        <button
                          (click)="removeSkill(skill)"
                          class="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                          title="Remove skill"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end bg-white">
              <button
                (click)="closeEditSkillsModal()"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded-full px-6 py-2 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ONBOARDING MODAL OVERLAY -->
      @if (showOnboardingModal() && currentUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div class="bg-white rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-gray-150 bg-white">
              <div>
                <h2 class="font-bold text-gray-900 text-xl">Welcome to LinkedIn!</h2>
                <p class="text-xs text-gray-500 mt-0.5">Let's set up your profile so connections can find you.</p>
              </div>
              <div class="flex items-center gap-1.5 bg-[#F3F2EF] px-3 py-1 rounded-full text-xs font-semibold text-gray-700">
                Step {{ onboardingStep() }} of 3
              </div>
            </div>

            <!-- Content Area (Scrollable) -->
            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              
              <!-- STEP 1: BASIC INFO -->
              @if (onboardingStep() === 1) {
                <div class="space-y-4">
                  <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-1.5">Verify your details</h3>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">First name*</label>
                      <input
                        [(ngModel)]="onboardingFirstName"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. John"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">Last name*</label>
                      <input
                        [(ngModel)]="onboardingLastName"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-700 block mb-1">Headline*</label>
                    <input
                      [(ngModel)]="onboardingHeadline"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                      placeholder="e.g. Software Engineer Student, Project Manager"
                    />
                    <p class="text-[10px] text-gray-400 mt-1">Brief summary of your professional background.</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">City*</label>
                      <input
                        [(ngModel)]="onboardingLocationCity"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. Kochi"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">Country*</label>
                      <input
                        [(ngModel)]="onboardingLocationCountry"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. India"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-xs font-semibold text-gray-700 block mb-1">About / Bio</label>
                    <textarea
                      [(ngModel)]="onboardingBio"
                      rows="3"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none resize-none"
                      placeholder="Share a short summary about yourself, your skills, or what you are looking for..."
                    ></textarea>
                  </div>
                </div>
              }

              <!-- STEP 2: EDUCATION -->
              @if (onboardingStep() === 2) {
                <div class="space-y-4">
                  <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-1.5">Add education</h3>
                  <p class="text-xs text-gray-500">Adding a school or university helps recruiters find you.</p>

                  <div>
                    <label class="text-xs font-semibold text-gray-700 block mb-1">School / University*</label>
                    <input
                      [(ngModel)]="onboardingSchool"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                      placeholder="e.g. Indian Institute of Technology"
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">Degree*</label>
                      <input
                        [(ngModel)]="onboardingDegree"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. Bachelor's, Master's"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">Field of Study*</label>
                      <input
                        [(ngModel)]="onboardingField"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. Computer Science, Business"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">Start Year*</label>
                      <input
                        [(ngModel)]="onboardingStartYear"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. 2022"
                      />
                    </div>
                    <div>
                      <label class="text-xs font-semibold text-gray-700 block mb-1">End Year* (or expected)</label>
                      <input
                        [(ngModel)]="onboardingEndYear"
                        class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                        placeholder="e.g. 2026"
                      />
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 3: SKILLS -->
              @if (onboardingStep() === 3) {
                <div class="space-y-4">
                  <h3 class="text-base font-semibold text-gray-900 border-b border-gray-100 pb-1.5">Add professional skills</h3>
                  <p class="text-xs text-gray-500">List skills that reflect your professional expertise (separated by commas).</p>

                  <div>
                    <label class="text-xs font-semibold text-gray-700 block mb-1">Skills*</label>
                    <textarea
                      [(ngModel)]="onboardingSkillsText"
                      rows="4"
                      class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                      placeholder="e.g. Angular, TypeScript, C#, Project Management, SQL"
                    ></textarea>
                    <p class="text-[10px] text-gray-400 mt-1.5">Entering skills helps you qualify for jobs matching your profile.</p>
                  </div>
                </div>
              }

            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-gray-150 flex justify-between bg-white shrink-0">
              <button
                [disabled]="onboardingStep() === 1"
                (click)="onboardingStep.set(onboardingStep() - 1)"
                class="border border-gray-400 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent text-sm font-semibold rounded-full px-5 py-2 transition-colors cursor-pointer"
              >
                Back
              </button>
              
              @if (onboardingStep() < 3) {
                <button
                  [disabled]="onboardingStep() === 1 ? (!onboardingFirstName || !onboardingLastName || !onboardingHeadline || !onboardingLocationCity || !onboardingLocationCountry) : (!onboardingSchool || !onboardingDegree || !onboardingField || !onboardingStartYear || !onboardingEndYear)"
                  (click)="onboardingStep.set(onboardingStep() + 1)"
                  class="bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 text-white text-sm font-semibold rounded-full px-6 py-2 transition-colors cursor-pointer"
                >
                  Next
                </button>
              } @else {
                <button
                  [disabled]="!onboardingSkillsText"
                  (click)="saveOnboarding()"
                  class="bg-[#057642] hover:bg-[#03422a] disabled:bg-gray-300 text-white text-sm font-semibold rounded-full px-6 py-2 transition-colors cursor-pointer"
                >
                  Finish & Explore
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  readonly users = this.stateService.users;
  readonly posts = this.stateService.posts;

  userId = signal<string | null>(null);

  profileUser = computed(() => {
    const id = this.userId();
    return id ? this.users().find((u) => u.id === id) || null : this.currentUser();
  });

  isOwnProfile = computed(() => {
    const pUser = this.profileUser();
    return pUser ? pUser.id === this.currentUser()?.id : false;
  });

  userPosts = computed(() => {
    const pUser = this.profileUser();
    if (!pUser) return [];
    return this.posts().filter((p) => p.authorId === pUser.id);
  });

  totalImpressions = computed(() => {
    return this.userPosts().reduce(
      (sum, p) => sum + p.likes.length * 12 + p.comments.length * 8 + p.reposts * 20,
      0
    );
  });

  searchAppearances = computed(() => {
    const views = this.profileUser()?.profileViews || 13;
    return Math.floor(views * 0.4) || 5;
  });

  connectionStatus = computed(() => {
    const pUser = this.profileUser();
    return pUser ? this.stateService.getConnectionStatus(pUser.id) : 'none';
  });

  // Modal display states
  showEditModal = signal(false);
  showAddExp = signal(false);
  showAddEdu = signal(false);
  showViewContactModal = signal(false);
  showEditContactModal = signal(false);
  showEditSkillsModal = signal(false);
  showOnboardingModal = signal(false);
  onboardingStep = signal(1);

  // Onboarding bindings
  onboardingFirstName = '';
  onboardingLastName = '';
  onboardingHeadline = '';
  onboardingLocationCity = '';
  onboardingLocationCountry = '';
  onboardingBio = '';
  onboardingSchool = '';
  onboardingDegree = '';
  onboardingField = '';
  onboardingStartYear = '';
  onboardingEndYear = '';
  onboardingSkillsText = '';

  // Edit intro bindings
  editFirstName = '';
  editLastName = '';
  editAdditionalName = '';
  editPronouns = '';
  editHeadline = '';
  editIndustry = '';
  editSchoolId = '';
  editShowSchoolInIntro = true;
  editCountry = '';
  editCity = '';

  // Add experience bindings
  expTitle = '';
  expCompany = '';
  expStartDate = '';
  expDescription = '';

  // Add education bindings
  eduSchool = '';
  eduDegree = '';
  eduField = '';
  eduStartYear = '';
  eduEndYear = '';

  // Edit contact info bindings
  editPhone = '';
  editPhoneType = 'Mobile';
  editAddress = '';
  editBirthdayMonth = '';
  editBirthdayDay = '';
  editBirthdayVisibility = 'Your network';
  editWebsites: { url: string; label: string }[] = [];
  editInstantMessaging: { handle: string; platform: string }[] = [];

  // Edit skills bindings
  newSkillInput = '';

  daysArray = Array.from({ length: 31 }, (_, i) => String(i + 1));
  monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  suggestedSkills = [
    'Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Git',
    'RxJS', 'Node.js', 'Express', 'SQL', 'MongoDB', 'REST APIs',
    'UI/UX Design', 'Project Management', 'Agile'
  ];

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('userId');
      this.userId.set(id);
      setTimeout(() => {
        const loggedInUser = this.currentUser();
        if (id && loggedInUser && id !== loggedInUser.id) {
          this.stateService.recordProfileView(id);
        }
      });
    });

    this.route.queryParamMap.subscribe((params) => {
      const setup = params.get('setup');
      if (setup === 'true') {
        setTimeout(() => {
          this.openOnboardingModal();
        }, 300);
      }
    });
  }

  handleConnect() {
    const pUser = this.profileUser();
    if (pUser) {
      this.stateService.sendConnectionRequest(pUser.id);
    }
  }

  messageUser() {
    const pUser = this.profileUser();
    if (pUser) {
      this.router.navigate(['/messaging'], { queryParams: { userId: pUser.id } });
    }
  }

  toggleOpenToWork() {
    this.stateService.toggleOpenToWork();
  }

  toggleIsHiring() {
    this.stateService.toggleIsHiring();
  }

  // Get primary school to show in intro
  getSchoolToShow() {
    const user = this.profileUser();
    if (user && user.education && user.education.length > 0) {
      return user.education[0];
    }
    return null;
  }

  // Intro edit
  openEditModal() {
    const user = this.profileUser();
    if (user) {
      const nameParts = (user.name || '').trim().split(/\s+/);
      this.editFirstName = nameParts[0] || '';
      this.editLastName = nameParts.slice(1).join(' ') || '';
      this.editAdditionalName = '';
      this.editPronouns = user.pronouns || '';
      this.editHeadline = user.headline || '';
      this.editIndustry = user.industry || '';
      this.editShowSchoolInIntro = user.showSchoolInIntro !== false;

      const loc = user.location || '';
      const parts = loc.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        this.editCountry = parts[parts.length - 1];
        this.editCity = parts.slice(0, parts.length - 1).join(', ');
      } else {
        this.editCountry = loc;
        this.editCity = '';
      }

      if (user.education && user.education.length > 0) {
        this.editSchoolId = user.education[0].id;
      } else {
        this.editSchoolId = '';
      }

      this.showEditModal.set(true);
    }
  }

  closeEditModal() {
    this.showEditModal.set(false);
  }

  saveProfile() {
    const user = this.profileUser();
    if (!user) return;

    const firstName = this.editFirstName.trim();
    const lastName = this.editLastName.trim();
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName);

    let locationStr = '';
    const city = this.editCity.trim();
    const country = this.editCountry.trim();
    if (city && country) {
      locationStr = `${city}, ${country}`;
    } else {
      locationStr = city || country;
    }

    let updatedEducation = [...(user.education || [])];
    if (this.editSchoolId && updatedEducation.length > 0) {
      const idx = updatedEducation.findIndex((e) => e.id === this.editSchoolId);
      if (idx > -1) {
        const [selectedSchool] = updatedEducation.splice(idx, 1);
        updatedEducation = [selectedSchool, ...updatedEducation];
      }
    }

    this.stateService.updateProfile({
      name: fullName,
      headline: this.editHeadline,
      location: locationStr,
      industry: this.editIndustry,
      pronouns: this.editPronouns,
      showSchoolInIntro: this.editShowSchoolInIntro,
      education: updatedEducation
    });

    this.closeEditModal();
  }

  // Experience edit
  openAddExp() {
    this.expTitle = '';
    this.expCompany = '';
    this.expStartDate = '';
    this.expDescription = '';
    this.showAddExp.set(true);
  }

  closeAddExp() {
    this.showAddExp.set(false);
  }

  saveExperience() {
    if (!this.expTitle || !this.expCompany) return;
    const exp: Experience = {
      id: `exp${Date.now()}`,
      title: this.expTitle,
      company: this.expCompany,
      startDate: this.expStartDate || new Date().toISOString().slice(0, 7),
      endDate: null,
      description: this.expDescription
    };

    const current = this.profileUser()?.experience || [];
    this.stateService.updateProfile({ experience: [exp, ...current] });
    this.closeAddExp();
  }

  removeExperience(expId: string) {
    const current = this.profileUser()?.experience || [];
    this.stateService.updateProfile({ experience: current.filter((e) => e.id !== expId) });
  }

  // Education add/remove
  openAddEducationModal() {
    this.eduSchool = '';
    this.eduDegree = '';
    this.eduField = '';
    this.eduStartYear = '';
    this.eduEndYear = '';
    this.showAddEdu.set(true);
  }

  closeAddEdu() {
    this.showAddEdu.set(false);
  }

  saveEducation() {
    const user = this.profileUser();
    if (!user || !this.eduSchool || !this.eduDegree || !this.eduField) return;

    const newEdu: Education = {
      id: `edu${Date.now()}`,
      school: this.eduSchool,
      degree: this.eduDegree,
      field: this.eduField,
      startYear: this.eduStartYear ? String(this.eduStartYear) : new Date().getFullYear().toString(),
      endYear: this.eduEndYear ? String(this.eduEndYear) : (new Date().getFullYear() + 4).toString()
    };

    const current = user.education || [];
    this.stateService.updateProfile({ education: [newEdu, ...current] });
    this.closeAddEdu();
  }

  removeEducation(eduId: string) {
    const user = this.profileUser();
    if (!user) return;
    const current = user.education || [];
    this.stateService.updateProfile({ education: current.filter((e) => e.id !== eduId) });
  }

  // Skills edit
  openEditSkillsModal() {
    this.newSkillInput = '';
    this.showEditSkillsModal.set(true);
  }

  closeEditSkillsModal() {
    this.showEditSkillsModal.set(false);
  }

  addSkill() {
    const skill = this.newSkillInput.trim();
    if (!skill) return;
    const user = this.profileUser();
    if (!user) return;
    const current = user.skills || [];
    if (!current.includes(skill)) {
      this.stateService.updateProfile({ skills: [...current, skill] });
    }
    this.newSkillInput = '';
  }

  addSuggestedSkill(skill: string) {
    const user = this.profileUser();
    if (!user) return;
    const current = user.skills || [];
    if (!current.includes(skill)) {
      this.stateService.updateProfile({ skills: [...current, skill] });
    }
  }

  removeSkill(skill: string) {
    const user = this.profileUser();
    if (!user) return;
    const current = user.skills || [];
    this.stateService.updateProfile({ skills: current.filter(s => s !== skill) });
  }

  // Contact info view
  openViewContactInfoModal() {
    this.showViewContactModal.set(true);
  }

  closeViewContactInfoModal() {
    this.showViewContactModal.set(false);
  }

  // Contact info edit
  openEditContactModal() {
    const user = this.profileUser();
    if (user) {
      this.editPhone = user.phone || '';
      this.editPhoneType = user.phoneType || 'Mobile';
      this.editAddress = user.address || '';
      this.editBirthdayMonth = user.birthdayMonth || '';
      this.editBirthdayDay = user.birthdayDay || '';
      this.editBirthdayVisibility = user.birthdayVisibility || 'Your network';
      this.editWebsites = user.websites ? JSON.parse(JSON.stringify(user.websites)) : [];
      this.editInstantMessaging = user.instantMessaging ? JSON.parse(JSON.stringify(user.instantMessaging)) : [];
      this.showEditContactModal.set(true);
    }
  }

  closeEditContactModal() {
    this.showEditContactModal.set(false);
  }

  goBackFromContactEdit() {
    this.closeEditContactModal();
    this.openEditModal();
  }

  addWebsiteField() {
    this.editWebsites.push({ url: '', label: 'Personal' });
  }

  removeWebsiteField(index: number) {
    this.editWebsites.splice(index, 1);
  }

  addMessagingField() {
    this.editInstantMessaging.push({ handle: '', platform: 'Skype' });
  }

  removeMessagingField(index: number) {
    this.editInstantMessaging.splice(index, 1);
  }

  saveContactInfo() {
    const filteredWebsites = this.editWebsites.filter(w => w.url.trim());
    const filteredMessaging = this.editInstantMessaging.filter(m => m.handle.trim());

    this.stateService.updateProfile({
      phone: this.editPhone,
      phoneType: this.editPhoneType,
      address: this.editAddress,
      birthdayMonth: this.editBirthdayMonth,
      birthdayDay: this.editBirthdayDay,
      birthdayVisibility: this.editBirthdayVisibility,
      websites: filteredWebsites,
      instantMessaging: filteredMessaging
    });

    this.closeEditContactModal();
  }

  onUploadAvatar(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.stateService.updateProfile({ avatarUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  onUploadCover(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.stateService.updateProfile({ coverUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  openOnboardingModal() {
    const user = this.currentUser();
    if (user) {
      const nameParts = (user.name || '').trim().split(/\s+/);
      this.onboardingFirstName = nameParts[0] || '';
      this.onboardingLastName = nameParts.slice(1).join(' ') || '';
      this.onboardingHeadline = user.headline && user.headline !== 'Add headline' ? user.headline : '';
      this.onboardingBio = user.about || '';
      
      const loc = user.location && user.location !== 'Add location' ? user.location : '';
      const parts = loc.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        this.onboardingLocationCountry = parts[parts.length - 1];
        this.onboardingLocationCity = parts.slice(0, parts.length - 1).join(', ');
      } else {
        this.onboardingLocationCountry = loc;
        this.onboardingLocationCity = '';
      }

      this.onboardingSchool = '';
      this.onboardingDegree = '';
      this.onboardingField = '';
      this.onboardingStartYear = '';
      this.onboardingEndYear = '';
      this.onboardingSkillsText = '';
      this.onboardingStep.set(1);
      this.showOnboardingModal.set(true);
    }
  }

  async saveOnboarding() {
    const user = this.currentUser();
    if (!user) return;

    const firstName = this.onboardingFirstName.trim();
    const lastName = this.onboardingLastName.trim();
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName);
    
    let locationStr = '';
    const city = this.onboardingLocationCity.trim();
    const country = this.onboardingLocationCountry.trim();
    if (city && country) {
      locationStr = `${city}, ${country}`;
    } else {
      locationStr = city || country;
    }

    // 1. Save basic profile updates
    this.stateService.updateProfile({
      name: fullName,
      headline: this.onboardingHeadline.trim() || 'Professional on LinkedIn',
      location: locationStr || 'Add location',
      about: this.onboardingBio.trim()
    });

    // 2. Add education if specified
    if (this.onboardingSchool.trim() && this.onboardingDegree.trim()) {
      const newEdu: Education = {
        id: 'edu_' + Math.random().toString(36).substr(2, 9),
        school: this.onboardingSchool.trim(),
        degree: this.onboardingDegree.trim(),
        field: this.onboardingField.trim(),
        startYear: this.onboardingStartYear,
        endYear: this.onboardingEndYear
      };
      this.stateService.updateProfile({ education: [newEdu] });
    }

    // 3. Add skills if specified
    if (this.onboardingSkillsText.trim()) {
      const skillList = this.onboardingSkillsText.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (skillList.length > 0) {
        this.stateService.updateProfile({ skills: skillList });
      }
    }

    // 4. Mark as onboarded locally to prevent redirects
    localStorage.setItem(`linkedin_onboarded_${user.id}`, 'true');

    // 5. Close wizard and navigate home
    this.showOnboardingModal.set(false);
    this.router.navigate(['/']);
  }
}
