import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-6 mt-14">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Left Column (Sidebar) -->
        <div class="w-full md:w-[250px] flex-shrink-0 space-y-4">
          <!-- Profile Card -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden">
            <!-- Cover -->
            <div class="h-16 w-full bg-[#E0DFDC] relative">
              @if (currentUser()?.coverUrl) {
                <img [src]="currentUser()!.coverUrl" class="w-full h-full object-cover" alt="Cover" />
              } @else {
                <div class="w-full h-full" [style.background]="currentUser()?.coverColor || 'linear-gradient(135deg, #0A66C2, #004182)'"></div>
              }
            </div>
            <!-- Profile Info -->
            <div class="px-4 pb-4 pt-1 flex flex-col items-center text-center relative bg-white">
              <!-- Avatar -->
              <div class="w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center bg-[#0A66C2] -mt-8 mb-2 flex-shrink-0">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
                } @else {
                  <span class="text-white font-bold text-lg">{{ currentUser()?.avatarInitials }}</span>
                }
              </div>
              <h2 class="font-semibold text-gray-900 text-sm leading-snug">{{ currentUser()?.name }}</h2>
              <p class="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{{ currentUser()?.headline }}</p>
              <p class="text-[10px] text-gray-400 mt-1 font-medium">{{ currentUser()?.location }}</p>
              
              <!-- Experience dotted box -->
              <button routerLink="/profile/u1" class="w-full mt-3 border border-dashed border-gray-300 hover:border-gray-500 rounded py-2 text-xs font-semibold text-gray-600 transition-colors bg-transparent cursor-pointer">
                + Experience
              </button>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden flex flex-col">
            <button
              (click)="activeSubTab.set('overview')"
              class="flex items-center px-4 py-3 text-sm font-semibold text-left border-l-4 transition-colors cursor-pointer border-0 bg-transparent"
              [class.border-[#057642]]="activeSubTab() === 'overview'"
              [class.text-[#057642]]="activeSubTab() === 'overview'"
              [class.bg-green-50/30]="activeSubTab() === 'overview'"
              [class.border-transparent]="activeSubTab() !== 'overview'"
              [class.text-gray-600]="activeSubTab() !== 'overview'"
              [class.hover:bg-gray-50]="activeSubTab() !== 'overview'"
            >
              Overview
            </button>
            <button
              (click)="activeSubTab.set('content')"
              class="flex items-center px-4 py-3 text-sm font-semibold text-left border-l-4 transition-colors cursor-pointer border-0 bg-transparent"
              [class.border-[#057642]]="activeSubTab() === 'content'"
              [class.text-[#057642]]="activeSubTab() === 'content'"
              [class.bg-green-50/30]="activeSubTab() === 'content'"
              [class.border-transparent]="activeSubTab() !== 'content'"
              [class.text-gray-600]="activeSubTab() !== 'content'"
              [class.hover:bg-gray-50]="activeSubTab() !== 'content'"
            >
              Content analytics
            </button>
            <button
              (click)="activeSubTab.set('audience')"
              class="flex items-center px-4 py-3 text-sm font-semibold text-left border-l-4 transition-colors cursor-pointer border-0 bg-transparent"
              [class.border-[#057642]]="activeSubTab() === 'audience'"
              [class.text-[#057642]]="activeSubTab() === 'audience'"
              [class.bg-green-50/30]="activeSubTab() === 'audience'"
              [class.border-transparent]="activeSubTab() !== 'audience'"
              [class.text-gray-600]="activeSubTab() !== 'audience'"
              [class.hover:bg-gray-50]="activeSubTab() !== 'audience'"
            >
              Audience analytics
            </button>
          </div>
        </div>

        <!-- Center Column (Main Content) -->
        <div class="flex-1 min-w-0 space-y-4">
          
          <!-- SUB-TAB: OVERVIEW -->
          @if (activeSubTab() === 'overview') {
            <!-- Track performance -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-base font-semibold text-gray-900">Track performance</h2>
                <div class="flex items-center gap-2">
                  <select class="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white font-medium focus:outline-none">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>28 days</option>
                  </select>
                  <button class="border border-gray-300 text-gray-600 text-xs font-semibold rounded px-3 py-1 hover:bg-gray-50 flex items-center gap-1 bg-white cursor-pointer">
                    📥 Export
                  </button>
                </div>
              </div>

              <!-- Summary Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                  <p class="text-xs text-gray-500 font-semibold mb-1">Post impressions</p>
                  <p class="text-xl font-bold text-gray-900">{{ totalImpressions() }}</p>
                  <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior 7 days
                  </p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                  <p class="text-xs text-gray-500 font-semibold mb-1">Total followers</p>
                  <p class="text-xl font-bold text-gray-900">115</p>
                  <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior 7 days
                  </p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                  <p class="text-xs text-gray-500 font-semibold mb-1">Profile viewers</p>
                  <p class="text-xl font-bold text-gray-900">{{ currentUser()?.profileViews || 13 }}</p>
                  <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior 90 days
                  </p>
                </div>
                <div class="border border-gray-200 rounded-lg p-4 bg-gray-50/30">
                  <p class="text-xs text-gray-500 font-semibold mb-1">Search appearances</p>
                  <p class="text-xl font-bold text-gray-900">{{ searchAppearances() }}</p>
                  <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior period
                  </p>
                </div>
              </div>
            </div>

            <!-- Weekly progress -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 space-y-4">
              <h2 class="text-base font-semibold text-gray-900">Weekly progress</h2>
              
              <div class="border-b border-gray-100 pb-4 flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-sm text-gray-800">No posts yet</p>
                  <p class="text-xs text-gray-500 mt-1">Members who post once per week on average see up to 4x more profile views.</p>
                </div>
                <a routerLink="/" class="text-[#0A66C2] font-semibold text-xs hover:underline flex-shrink-0">Start a post</a>
              </div>

              <div class="pt-1 flex items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-sm text-gray-800">No comments yet</p>
                  <p class="text-xs text-gray-500 mt-1">Members who comment once per week on average see up to 3x more profile views.</p>
                </div>
                <a routerLink="/" class="text-[#0A66C2] font-semibold text-xs hover:underline flex-shrink-0">Comment on feed &rarr;</a>
              </div>
            </div>
          }

          <!-- SUB-TAB: CONTENT ANALYTICS -->
          @if (activeSubTab() === 'content') {
            <!-- Content performance -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-1">
                  <h2 class="text-base font-semibold text-gray-900">Content performance</h2>
                  <span class="text-gray-400 cursor-help" title="Performance of your updates">ℹ️</span>
                </div>
                <div class="flex items-center gap-2">
                  <select class="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white font-medium focus:outline-none">
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>28 days</option>
                  </select>
                  <button class="border border-gray-300 text-gray-600 text-xs font-semibold rounded px-3 py-1 hover:bg-gray-50 flex items-center gap-1 bg-white cursor-pointer">
                    📥 Export
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-3 mb-4">
                <select class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white font-medium focus:outline-none">
                  <option>Impressions</option>
                  <option>Engagements</option>
                </select>
                <select class="border border-gray-300 rounded px-2 py-0.5 text-xs bg-white font-medium focus:outline-none">
                  <option>Cumulative</option>
                  <option>Daily</option>
                </select>
              </div>

              <div class="mb-4">
                <p class="text-2xl font-bold text-gray-900">{{ totalImpressions() }} Impressions</p>
                <p class="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior 7 days
                </p>
              </div>

              <!-- Chart SVG -->
              <div class="border border-gray-150 rounded-lg p-4 bg-gray-50/20">
                <svg viewBox="0 0 500 150" class="w-full h-40 text-gray-200">
                  <!-- Grid Lines -->
                  <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" stroke-width="1" />
                  
                  <!-- Y Axis Labels -->
                  <text x="15" y="25" class="text-[9px] fill-gray-400 font-sans">10</text>
                  <text x="15" y="65" class="text-[9px] fill-gray-400 font-sans">5</text>
                  <text x="15" y="105" class="text-[9px] fill-gray-400 font-sans">0</text>

                  <!-- Trend Path -->
                  <path [attr.d]="chartPath()" fill="none" stroke="#057642" stroke-width="2" />
                  
                  <!-- Trend Points -->
                  @if (totalImpressions() === 0) {
                    <circle cx="40" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="150" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="260" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="370" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="480" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  } @else {
                    <circle cx="40" cy="120" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="150" cy="100" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="260" cy="70" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                    <circle cx="480" cy="40" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  }
                  
                  <!-- X Axis Labels -->
                  <text x="40" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">May 31</text>
                  <text x="150" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">Jun 2</text>
                  <text x="260" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">Jun 4</text>
                  <text x="480" y="135" text-anchor="end" class="text-[9px] fill-gray-400 font-sans">Jun 6</text>
                </svg>
                <p class="text-[10px] text-gray-400 text-center mt-2">Daily data is recorded in UTC</p>
              </div>
            </div>

            <!-- Discovery -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 space-y-4">
              <div class="flex items-center gap-1 border-b border-gray-100 pb-2">
                <h2 class="text-base font-semibold text-gray-900">Discovery</h2>
                <span class="text-gray-400 cursor-help" title="How people find you">ℹ️</span>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ totalImpressions() }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Impressions</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-gray-900">{{ totalImpressions() > 0 ? 1 : 0 }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Members reached</p>
                </div>
              </div>

              <!-- Tip Banner -->
              @if (showTipBanner()) {
                <div class="bg-[#FDF6E2] rounded-lg border border-[#F5E6C4] p-4 relative flex gap-3 animate-in fade-in duration-200">
                  <span class="text-xl">💡</span>
                  <div class="flex-1 pr-6 bg-transparent">
                    <p class="text-xs text-gray-800 leading-normal font-medium">Members who post once a week can get up to 4x more profile views. Keep the momentum going by creating another post.</p>
                    <button routerLink="/" class="mt-2.5 bg-transparent border border-gray-700 hover:bg-black/5 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full transition-colors cursor-pointer">
                      Start a post
                    </button>
                  </div>
                  <button (click)="showTipBanner.set(false)" class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors cursor-pointer border-0 bg-transparent animate-none" title="Dismiss">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              }
            </div>

            <!-- Engagement -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 space-y-4">
              <div class="flex items-center gap-1 border-b border-gray-100 pb-2">
                <h2 class="text-base font-semibold text-gray-900">Engagement</h2>
                <span class="text-gray-400 cursor-help" title="Interactions with your updates">ℹ️</span>
              </div>

              <div>
                <p class="text-2xl font-bold text-gray-900">{{ totalEngagement() }}</p>
                <p class="text-xs text-gray-500 mt-0.5">Social engagements</p>
              </div>

              <div class="divide-y divide-gray-100 text-sm">
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-gray-600">Reactions</span>
                  <span class="font-bold text-gray-900">{{ totalLikes() }}</span>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-gray-600">Comments</span>
                  <span class="font-bold text-gray-900">{{ totalComments() }}</span>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-gray-600">Reposts</span>
                  <span class="font-bold text-gray-900">{{ totalReposts() }}</span>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-gray-600">Saves</span>
                  <span class="font-bold text-gray-900">0</span>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <span class="text-gray-600">Sends on LinkedIn</span>
                  <span class="font-bold text-gray-900">0</span>
                </div>
              </div>
            </div>
          }

          <!-- SUB-TAB: AUDIENCE ANALYTICS -->
          @if (activeSubTab() === 'audience') {
            <!-- Follower growth -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-1">
                  <h2 class="text-base font-semibold text-gray-900">Follower growth</h2>
                  <span class="text-gray-400 cursor-help" title="Growth of your followers list">ℹ️</span>
                </div>
                <select class="border border-gray-300 rounded px-2.5 py-1 text-xs bg-white font-medium focus:outline-none">
                  <option>Cumulative</option>
                  <option>Daily</option>
                </select>
              </div>

              <div class="mb-4">
                <p class="text-2xl font-bold text-gray-900">115 <span class="text-sm font-normal text-gray-500">Total followers</span></p>
                <p class="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> 0% vs. prior 7 days
                </p>
              </div>

              <!-- Chart SVG -->
              <div class="border border-gray-150 rounded-lg p-4 bg-gray-50/20">
                <svg viewBox="0 0 500 150" class="w-full h-40 text-gray-200">
                  <!-- Grid Lines -->
                  <line x1="40" y1="20" x2="480" y2="20" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="currentColor" stroke-dasharray="3" stroke-width="0.5" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="currentColor" stroke-width="1" />
                  
                  <!-- Y Axis Labels -->
                  <text x="15" y="25" class="text-[9px] fill-gray-400 font-sans">120</text>
                  <text x="15" y="65" class="text-[9px] fill-gray-400 font-sans">115</text>
                  <text x="15" y="105" class="text-[9px] fill-gray-400 font-sans">110</text>

                  <!-- Trend Path -->
                  <path d="M 40 60 L 150 60 L 260 60 L 370 60 L 480 60" fill="none" stroke="#057642" stroke-width="2" />
                  
                  <!-- Trend Points -->
                  <circle cx="40" cy="60" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  <circle cx="150" cy="60" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  <circle cx="260" cy="60" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  <circle cx="370" cy="60" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  <circle cx="480" cy="60" r="3.5" class="fill-[#057642] stroke-white stroke-2" />
                  
                  <!-- X Axis Labels -->
                  <text x="40" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">May 31</text>
                  <text x="150" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">Jun 2</text>
                  <text x="260" y="135" text-anchor="middle" class="text-[9px] fill-gray-400 font-sans">Jun 4</text>
                  <text x="480" y="135" text-anchor="end" class="text-[9px] fill-gray-400 font-sans">Jun 6</text>
                </svg>
                <p class="text-[10px] text-gray-400 text-center mt-2">Daily data is recorded in UTC</p>
              </div>
            </div>

            <!-- Top demographics -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 space-y-4">
              <div class="flex items-center gap-1 border-b border-gray-100 pb-2">
                <h2 class="text-base font-semibold text-gray-900">Top demographics</h2>
                <span class="text-gray-400 cursor-help" title="Aggregated demographics of your followers">ℹ️</span>
              </div>

              <!-- Demographics category filters -->
              <div class="flex flex-wrap gap-1.5 pb-2">
                <button
                  (click)="selectedDemographic.set('title')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'title'"
                  [class.text-white]="selectedDemographic() === 'title'"
                  [class.border-[#057642]]="selectedDemographic() === 'title'"
                  [class.border-gray-300]="selectedDemographic() !== 'title'"
                  [class.text-gray-600]="selectedDemographic() !== 'title'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'title'"
                >
                  Job title
                </button>
                <button
                  (click)="selectedDemographic.set('location')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'location'"
                  [class.text-white]="selectedDemographic() === 'location'"
                  [class.border-[#057642]]="selectedDemographic() === 'location'"
                  [class.border-gray-300]="selectedDemographic() !== 'location'"
                  [class.text-gray-600]="selectedDemographic() !== 'location'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'location'"
                >
                  Location
                </button>
                <button
                  (click)="selectedDemographic.set('seniority')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'seniority'"
                  [class.text-white]="selectedDemographic() === 'seniority'"
                  [class.border-[#057642]]="selectedDemographic() === 'seniority'"
                  [class.border-gray-300]="selectedDemographic() !== 'seniority'"
                  [class.text-gray-600]="selectedDemographic() !== 'seniority'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'seniority'"
                >
                  Seniority
                </button>
                <button
                  (click)="selectedDemographic.set('company')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'company'"
                  [class.text-white]="selectedDemographic() === 'company'"
                  [class.border-[#057642]]="selectedDemographic() === 'company'"
                  [class.border-gray-300]="selectedDemographic() !== 'company'"
                  [class.text-gray-600]="selectedDemographic() !== 'company'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'company'"
                >
                  Company
                </button>
                <button
                  (click)="selectedDemographic.set('industry')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'industry'"
                  [class.text-white]="selectedDemographic() === 'industry'"
                  [class.border-[#057642]]="selectedDemographic() === 'industry'"
                  [class.border-gray-300]="selectedDemographic() !== 'industry'"
                  [class.text-gray-600]="selectedDemographic() !== 'industry'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'industry'"
                >
                  Industry
                </button>
                <button
                  (click)="selectedDemographic.set('size')"
                  class="px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors cursor-pointer"
                  [class.bg-[#057642]]="selectedDemographic() === 'size'"
                  [class.text-white]="selectedDemographic() === 'size'"
                  [class.border-[#057642]]="selectedDemographic() === 'size'"
                  [class.border-gray-300]="selectedDemographic() !== 'size'"
                  [class.text-gray-600]="selectedDemographic() !== 'size'"
                  [class.hover:bg-gray-50]="selectedDemographic() !== 'size'"
                >
                  Company size
                </button>
              </div>

              <!-- Bar Chart List -->
              <div class="space-y-4">
                @for (item of demographicsData(); track item.name) {
                  <div class="space-y-1">
                    <div class="flex justify-between text-xs font-medium">
                      <span class="text-gray-700">{{ item.name }}</span>
                      <span class="text-gray-900 font-semibold">{{ item.percentage }}%</span>
                    </div>
                    <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div class="bg-[#057642] h-full rounded-full transition-all duration-500" [style.width.%]="item.percentage"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

        </div>

        <!-- Right Column (Sidebar Ad / Info) -->
        <div class="hidden lg:block w-[280px] flex-shrink-0 space-y-4">
          <!-- Network / Job Search Ad Card -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden p-4 text-center space-y-3">
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Promoted</span>
              <span class="cursor-pointer">&bull;&bull;&bull;</span>
            </div>
            
            <div class="w-12 h-12 bg-blue-600 text-white rounded font-bold flex items-center justify-center mx-auto text-lg">
              in
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-900 text-sm">Your job search powered by your network</h4>
              <p class="text-xs text-gray-500 mt-1 leading-normal">Find opportunities at companies where you have mutual connections.</p>
            </div>
            
            <button class="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold py-1.5 rounded-full transition-colors cursor-pointer border-0">
              Explore jobs
            </button>
          </div>

          <!-- Aramco Ad Card -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden p-4 text-center space-y-3">
            <div class="flex items-center justify-between text-[11px] text-gray-400">
              <span>Promoted</span>
              <span class="cursor-pointer">&bull;&bull;&bull;</span>
            </div>
            
            <div class="w-12 h-12 bg-[#00897b] rounded overflow-hidden mx-auto">
              <!-- Logo symbol placeholder -->
              <div class="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                aramco
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-900 text-sm">Jonadh, get the latest on Aramco News, Jobs, and More!</h4>
              <p class="text-xs text-gray-500 mt-1 leading-normal">Stay informed on Aramco stories and tech developments.</p>
            </div>
            
            <button class="w-full border border-[#0A66C2] hover:bg-blue-50 text-[#0A66C2] text-xs font-semibold py-1.5 rounded-full transition-colors cursor-pointer bg-transparent">
              Follow
            </button>
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
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  private readonly stateService = inject(StateService);

  readonly currentUser = this.stateService.currentUser;
  readonly posts = this.stateService.posts;

  activeSubTab = signal('content');
  selectedDemographic = signal('title');
  showTipBanner = signal(true);

  myPosts = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.posts().filter((p) => p.authorId === user.id);
  });

  searchAppearances = computed(() => {
    const views = this.currentUser()?.profileViews || 13;
    return Math.floor(views * 0.4) || 5;
  });

  totalLikes = computed(() => {
    return this.myPosts().reduce((sum, p) => sum + p.likes.length, 0);
  });

  totalComments = computed(() => {
    return this.myPosts().reduce((sum, p) => sum + p.comments.length, 0);
  });

  totalReposts = computed(() => {
    return this.myPosts().reduce((sum, p) => sum + p.reposts, 0);
  });

  totalEngagement = computed(() => {
    return this.totalLikes() + this.totalComments() + this.totalReposts();
  });

  totalImpressions = computed(() => {
    return this.myPosts().reduce(
      (sum, p) => sum + p.likes.length * 12 + p.comments.length * 8 + p.reposts * 20,
      0
    );
  });

  chartPath = computed(() => {
    const total = this.totalImpressions();
    if (total === 0) {
      return 'M 40 120 L 150 120 L 260 120 L 370 120 L 480 120';
    }
    return 'M 40 120 Q 150 100, 260 70 T 480 40';
  });

  demographicsData = computed(() => {
    const category = this.selectedDemographic();
    switch (category) {
      case 'title':
        return [
          { name: 'Software Engineer', percentage: 42 },
          { name: 'Student / Intern', percentage: 28 },
          { name: 'Product Manager', percentage: 15 },
          { name: 'UX Designer', percentage: 10 },
          { name: 'Consultant', percentage: 5 }
        ];
      case 'location':
        return [
          { name: 'Thrissur, Kerala, India', percentage: 55 },
          { name: 'Kochi, Kerala, India', percentage: 25 },
          { name: 'Bengaluru, Karnataka, India', percentage: 12 },
          { name: 'Chennai, Tamil Nadu, India', percentage: 5 },
          { name: 'Mumbai, Maharashtra, India', percentage: 3 }
        ];
      case 'seniority':
        return [
          { name: 'Entry level', percentage: 50 },
          { name: 'Training / Student', percentage: 30 },
          { name: 'Senior', percentage: 12 },
          { name: 'Manager', percentage: 6 },
          { name: 'Director', percentage: 2 }
        ];
      case 'company':
        return [
          { name: 'Mar Baselios Institute of Technology', percentage: 35 },
          { name: 'NeST Group', percentage: 25 },
          { name: 'ConceptNXT Technologies', percentage: 20 },
          { name: 'Google', percentage: 12 },
          { name: 'Meta', percentage: 8 }
        ];
      case 'industry':
        return [
          { name: 'Information Technology & Services', percentage: 65 },
          { name: 'Computer Software', percentage: 20 },
          { name: 'Higher Education', percentage: 10 },
          { name: 'Design', percentage: 5 }
        ];
      case 'size':
        return [
          { name: '10,001+ employees', percentage: 40 },
          { name: '1-10 employees', percentage: 25 },
          { name: '11-50 employees', percentage: 18 },
          { name: '51-200 employees', percentage: 12 },
          { name: '501-1,000 employees', percentage: 5 }
        ];
      default:
        return [];
    }
  });

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }
}
