import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Job, Ad } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-4 mt-14 font-sans">
      <!-- Role Tab Selector (Only shown if Admin or Business) -->
      @if (currentUser()?.role === 'admin' || currentUser()?.role === 'business') {
        <div class="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg shadow-xs">
          @if (currentUser()?.role === 'business') {
            <button
              (click)="activeTab.set('employer')"
              class="px-6 py-3 text-sm font-semibold transition-colors border-b-2 focus:outline-none cursor-pointer"
              [class.border-[#0A66C2]]="activeTab() === 'employer'"
              [class.text-[#0A66C2]]="activeTab() === 'employer'"
              [class.border-transparent]="activeTab() !== 'employer'"
              [class.text-gray-500]="activeTab() !== 'employer'"
            >
              💼 Employer Dashboard
            </button>
          }
          @if (currentUser()?.role === 'admin') {
            <button
              (click)="activeTab.set('admin')"
              class="px-6 py-3 text-sm font-semibold transition-colors border-b-2 focus:outline-none cursor-pointer"
              [class.border-[#0A66C2]]="activeTab() === 'admin'"
              [class.text-[#0A66C2]]="activeTab() === 'admin'"
              [class.border-transparent]="activeTab() !== 'admin'"
              [class.text-gray-500]="activeTab() !== 'admin'"
            >
              🛡️ Admin Dashboard
            </button>
          }
          <button
            (click)="activeTab.set('candidate')"
            class="px-6 py-3 text-sm font-semibold transition-colors border-b-2 focus:outline-none cursor-pointer"
            [class.border-[#0A66C2]]="activeTab() === 'candidate'"
            [class.text-[#0A66C2]]="activeTab() === 'candidate'"
            [class.border-transparent]="activeTab() !== 'candidate'"
            [class.text-gray-500]="activeTab() !== 'candidate'"
          >
            🔍 Search / Recommended Jobs
          </button>
        </div>
      }

      @if (activeTab() === 'candidate') {
        <!-- Search Bar -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] p-4 mb-4 flex flex-col md:flex-row gap-3 shadow-sm">
          <div class="flex-1 relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              [(ngModel)]="searchTitle"
              placeholder="Describe the job you want"
              class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#0A66C2] bg-[#EEF3F8]/50"
            />
          </div>
          <div class="flex-shrink-0 flex gap-2">
            <button (click)="openAlertModal()" class="border border-[#0A66C2] text-[#0A66C2] text-xs font-semibold rounded-full px-4 py-2 hover:bg-blue-50 bg-white cursor-pointer">
              🔔 Set Alert
            </button>
          </div>
        </div>

        <!-- Auto Job Applier Settings Card -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] p-5 mb-4 shadow-sm">
          <div class="flex items-center justify-between border-b border-gray-150 pb-3 mb-4">
            <div class="flex items-center gap-2.5">
              <span class="text-xl">🤖</span>
              <div>
                <h3 class="font-bold text-gray-900 text-sm">Auto Job Applier</h3>
                <p class="text-[11px] text-gray-500 leading-snug">Automatically apply to jobs matching your criteria the moment they are posted.</p>
              </div>
            </div>
            <!-- Toggle Switch -->
            <label class="relative inline-flex items-center cursor-pointer select-none">
              <input type="checkbox" [(ngModel)]="autoApplyEnabled" (change)="saveAutoApplySettings()" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A66C2]"></div>
              <span class="ml-2.5 text-xs font-semibold text-gray-700">{{ autoApplyEnabled ? 'Active' : 'Inactive' }}</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="text-[11px] font-bold text-gray-700 block mb-1">Target Keyword</label>
              <input
                type="text"
                [(ngModel)]="autoApplyKeyword"
                (blur)="saveAutoApplySettings()"
                placeholder="e.g. Angular, Developer"
                class="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none bg-gray-50/30"
              />
            </div>
            <div>
              <label class="text-[11px] font-bold text-gray-700 block mb-1">Preferred Location</label>
              <input
                type="text"
                [(ngModel)]="autoApplyLocation"
                (blur)="saveAutoApplySettings()"
                placeholder="e.g. Kochi, Remote"
                class="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none bg-gray-50/30"
              />
            </div>
            <div>
              <label class="text-[11px] font-bold text-gray-700 block mb-1">Preferred Job Type</label>
              <select
                [(ngModel)]="autoApplyJobType"
                (change)="saveAutoApplySettings()"
                class="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none bg-white font-medium text-gray-800"
              >
                <option value="">Any Job Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
          
          @if (autoApplyEnabled) {
            <div class="mt-4 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-2">
              <span class="text-xs text-blue-700">⚡</span>
              <p class="text-[10px] text-blue-800 font-medium">
                Auto-applier is listening! When jobs matching <strong class="text-blue-900">"{{ autoApplyKeyword || 'any' }}"</strong> in <strong class="text-blue-900">"{{ autoApplyLocation || 'any' }}"</strong> (Type: <strong class="text-blue-900">{{ autoApplyJobType || 'Any' }}</strong>) are posted, you will be automatically applied.
              </p>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
          
          <!-- Left Pane: Recommendations List -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden shadow-sm flex flex-col">
            <div class="p-4 border-b border-gray-150 bg-white">
              <h2 class="font-semibold text-gray-900 text-sm">Jobs based on your preferences</h2>
              <p class="text-[11px] text-gray-500 mt-1 leading-snug">
                Assistant Manager or Sales And Marketing Specialist or Marketing Manager or Director of Innovation, on-site or hybrid in Thrissur
              </p>
              <div class="flex items-center justify-between mt-3 text-[11px] text-gray-400 font-medium">
                <span>{{ filteredJobs().length }} results &bull; How promoted jobs are ranked ℹ️</span>
              </div>
            </div>

            <div class="divide-y divide-gray-150 max-h-[650px] overflow-y-auto">
              @if (filteredJobs().length === 0) {
                <div class="p-8 text-center text-gray-500 text-xs italic">No jobs found matching your criteria.</div>
              } @else {
                @for (job of filteredJobs(); track job.id) {
                  <div
                    (click)="selectJob(job)"
                    [class.border-l-4]="selectedJob()?.id === job.id"
                    [class.border-l-[#0A66C2]]="selectedJob()?.id === job.id"
                    [class.bg-blue-50/30]="selectedJob()?.id === job.id"
                    class="p-4 flex gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors relative"
                    [attr.data-testid]="'card-job-' + job.id"
                  >
                    <!-- Dismiss Button X -->
                    <button
                      (click)="dismissJob(job.id, $event)"
                      class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-sm leading-none border-0 bg-transparent p-1 cursor-pointer"
                      title="Dismiss suggestion"
                    >
                      &times;
                    </button>

                    <!-- Company Logo -->
                    <div class="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-bold text-base text-[#0A66C2] flex-shrink-0">
                      {{ job.logo }}
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0 pr-4">
                      <h3 class="font-semibold text-[#0A66C2] text-xs leading-snug truncate hover:underline">{{ job.title }}</h3>
                      <p class="text-[11px] text-gray-800 mt-0.5">{{ job.company }}</p>
                      <p class="text-[11px] text-gray-500 mt-0.5">{{ job.location }} ({{ job.workplaceType || 'On-site' }})</p>
                      
                      <div class="flex items-center gap-1.5 flex-wrap mt-2">
                        @if (isJobViewed(job.id)) {
                          <span class="text-[9px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded uppercase">Viewed</span>
                        }
                        <span class="text-[9px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.2 rounded">Be an early applicant</span>
                      </div>

                      <div class="flex items-center gap-1 text-[10px] text-gray-400 mt-2 font-medium">
                        <span>{{ formatTime(job.postedAt) }}</span>
                        @if (job.easyApply) {
                          <span>&bull;</span>
                          <span class="text-[#0A66C2] font-semibold flex items-center gap-0.5">
                            <span class="bg-[#0A66C2] text-white text-[7px] font-bold px-0.5 rounded-sm scale-90">in</span> Easy Apply
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                }
              }
            </div>
          </div>

          <!-- Right Pane: Selected Job Details -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm overflow-hidden sticky top-16">
            @if (selectedJob(); as job) {
              <div class="p-6 space-y-5">
                
                <!-- Job title card header -->
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-bold text-3xl text-[#0A66C2] flex-shrink-0">
                    {{ job.logo }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h2 class="font-bold text-gray-900 text-lg leading-tight">{{ job.title }}</h2>
                    <p class="text-xs text-gray-800 mt-1 hover:underline cursor-pointer font-medium" [routerLink]="['/company', job.companyId]">
                      {{ job.company }}
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ job.location }} &bull; {{ formatTime(job.postedAt) }} &bull; 
                      <span class="text-green-700 font-semibold">{{ job.applicantsCount || 0 }} applicants</span>
                    </p>
                    <p class="text-[11px] text-gray-400 mt-1 font-medium italic">
                      {{ job.insightMessage || 'No response insights available yet' }}
                    </p>
                  </div>
                </div>

                <!-- Badges -->
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">
                    ✓ {{ job.workplaceType || 'On-site' }}
                  </span>
                  <span class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">
                    ✓ {{ job.type || 'Full-time' }}
                  </span>
                </div>

                <!-- CTA Actions Row -->
                <div class="flex items-center gap-3">
                  @if (isJobApplied(job.id)) {
                    <button
                      (click)="withdrawApplication(job.id)"
                      class="bg-transparent border border-red-600 text-red-600 text-xs font-bold rounded-full px-5 py-2 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Withdraw Application
                    </button>
                  } @else {
                    <button
                      (click)="openApplyModal()"
                      class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-full px-6 py-2 transition-colors cursor-pointer flex items-center gap-1 border-0"
                    >
                      @if (job.easyApply) {
                        <span class="bg-white text-[#0A66C2] text-[8px] font-black px-0.8 py-0.2 rounded-sm leading-none">in</span>
                        <span>Easy Apply</span>
                      } @else {
                        <span>Apply</span>
                      }
                    </button>
                  }

                  <button
                    (click)="toggleSaveJob(job.id)"
                    class="border text-xs font-bold rounded-full px-5 py-2 transition-colors cursor-pointer"
                    [class.text-[#0A66C2]]="isJobSaved(job.id)"
                    [class.border-[#0A66C2]]="isJobSaved(job.id)"
                    [class.bg-blue-50/50]="isJobSaved(job.id)"
                    [class.text-gray-700]="!isJobSaved(job.id)"
                    [class.border-gray-400]="!isJobSaved(job.id)"
                    [class.bg-white]="!isJobSaved(job.id)"
                  >
                    {{ isJobSaved(job.id) ? '✓ Saved' : 'Save' }}
                  </button>
                </div>

                <hr class="border-gray-150" />

                <!-- Qualifications Card -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start relative">
                  <div class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold bg-[#0A66C2] flex-shrink-0" [style.backgroundColor]="currentUser()?.avatarColor">
                    @if (currentUser()?.avatarUrl) {
                      <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover" />
                    } @else {
                      {{ currentUser()?.avatarInitials }}
                    }
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-800 font-semibold leading-normal">
                      Your profile and resume are missing some required qualifications
                    </p>
                    <button
                      (click)="showQualificationsModal.set(true)"
                      class="mt-3 inline-flex items-center gap-1.5 border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/50 text-xs font-bold px-4 py-1.5 rounded-full transition-colors cursor-pointer bg-white"
                    >
                      ✨ Show match details
                    </button>
                  </div>
                </div>

                <!-- Thumbs up/down feedback -->
                <div class="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                  <span>BETA &bull; Is this information helpful?</span>
                  <button
                    (click)="submitFeedback(job.id, 'up')"
                    class="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors border-0 bg-transparent cursor-pointer"
                    [class.text-green-600]="getFeedbackState(job.id) === 'up'"
                  >
                    👍
                  </button>
                  <button
                    (click)="submitFeedback(job.id, 'down')"
                    class="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors border-0 bg-transparent cursor-pointer"
                    [class.text-red-500]="getFeedbackState(job.id) === 'down'"
                  >
                    👎
                  </button>
                  @if (getFeedbackState(job.id)) {
                    <span class="text-green-700 font-semibold text-[10px]">Thanks for your feedback!</span>
                  }
                </div>

                <hr class="border-gray-150" />

                <!-- About the Job -->
                <div class="space-y-3">
                  <h3 class="font-bold text-gray-900 text-sm">About the job</h3>
                  <div class="text-xs text-gray-700 leading-relaxed whitespace-pre-line font-medium" [innerHTML]="job.aboutDescription || job.description">
                  </div>
                </div>
              </div>
            } @else {
              <div class="p-12 text-center text-gray-400 text-sm font-medium">
                Select a job to view details.
              </div>
            }
          </div>
        </div>
      }

      @if (activeTab() === 'employer') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900">Employer Recruiting Dashboard</h1>
              <p class="text-xs text-gray-500 mt-1">Manage your job openings and request ad campaigns for your company.</p>
            </div>
            <div class="flex flex-wrap gap-2.5">
              <button
                (click)="openPostJobModal()"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-full px-5 py-2.5 transition-colors cursor-pointer border-0 shadow-sm"
              >
                ➕ Post a New Job
              </button>
              <button
                (click)="openRequestAdModal()"
                class="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 bg-white text-xs font-bold rounded-full px-5 py-2.5 transition-colors cursor-pointer shadow-sm"
              >
                📢 Request Promoted Ad
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <!-- Left Column: Posted Jobs -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm p-5 space-y-4">
              <h2 class="font-bold text-gray-900 text-sm border-b border-gray-150 pb-2 flex justify-between items-center">
                <span>Your Posted Jobs</span>
                <span class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">{{ myPostedJobs().length }}</span>
              </h2>

              @if (myPostedJobs().length === 0) {
                <div class="text-center py-8 text-gray-400 text-xs italic">
                  You haven't posted any jobs yet. Click "Post a New Job" to get started.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (job of myPostedJobs(); track job.id) {
                    <div class="border border-gray-150 rounded p-4 space-y-2.5 hover:border-gray-300 transition-colors">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h3 class="font-bold text-gray-905 text-xs hover:underline cursor-pointer">{{ job.title }}</h3>
                          <p class="text-[11px] text-gray-600 mt-0.5">{{ job.company }} &bull; {{ job.location }}</p>
                        </div>
                        
                        <!-- Status Badge -->
                        @if (job.status === 'approved') {
                          <span class="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Active & Live</span>
                        } @else if (job.status === 'pending') {
                          <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Approval</span>
                        } @else {
                          <span class="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Rejected</span>
                        }
                      </div>

                      <p class="text-[10px] text-gray-500 leading-normal line-clamp-2">{{ job.description }}</p>
                      
                      <div class="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                        <span>Type: {{ job.type }} &bull; {{ job.workplaceType }}</span>
                        @if (job.salary) {
                          <span>&bull;</span>
                          <span>{{ job.salary }}</span>
                        }
                        <span>&bull;</span>
                        <span>Posted {{ formatTime(job.postedAt) }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Requested Ads -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm p-5 space-y-4">
              <h2 class="font-bold text-gray-900 text-sm border-b border-gray-150 pb-2 flex justify-between items-center">
                <span>Your Requested Ad Campaigns</span>
                <span class="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">{{ myRequestedAds().length }}</span>
              </h2>

              @if (myRequestedAds().length === 0) {
                <div class="text-center py-8 text-gray-400 text-xs italic">
                  You haven't requested any ad campaigns yet. Click "Request Promoted Ad" to create one.
                </div>
              } @else {
                <div class="space-y-3">
                  @for (ad of myRequestedAds(); track ad.id) {
                    <div class="border border-gray-150 rounded p-4 space-y-3 bg-gray-50/50 hover:border-gray-300 transition-colors">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h3 class="font-bold text-gray-905 text-xs">{{ ad.title }}</h3>
                          <p class="text-[11px] text-gray-600 mt-0.5">Brand: {{ ad.companyName }}</p>
                        </div>

                        <!-- Status Badge -->
                        @if (ad.status === 'approved') {
                          <span class="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">Live & Running</span>
                        } @else if (ad.status === 'pending') {
                          <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Approval</span>
                        } @else {
                          <span class="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Rejected</span>
                        }
                      </div>

                      <div class="bg-white border border-gray-200 rounded p-3 text-center space-y-2 shadow-xs max-w-[280px] mx-auto">
                        <div class="flex items-center justify-between text-[8px] text-gray-400 font-medium">
                          <span>Promoted</span>
                          <span>&bull;&bull;&bull;</span>
                        </div>
                        <div class="w-10 h-10 bg-blue-600 text-white rounded font-bold flex items-center justify-center mx-auto text-xs shadow-sm font-sans" [style.backgroundColor]="ad.logoColor || '#0A66C2'">
                          {{ ad.logoText }}
                        </div>
                        <h4 class="font-bold text-gray-905 text-[10px] leading-tight">{{ ad.title }}</h4>
                        <p class="text-[9px] text-gray-500 leading-normal">{{ ad.description }}</p>
                        <button type="button" class="w-full text-[9px] font-bold py-1 rounded-full border border-[#0A66C2] text-[#0A66C2] bg-white hover:bg-blue-50/50">
                          {{ ad.ctaText || 'Learn More' }}
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      @if (activeTab() === 'admin') {
        <div class="space-y-6 animate-in fade-in duration-200">
          <div class="bg-white rounded-lg border border-[#E0DFDC] p-6 shadow-sm">
            <h1 class="text-xl font-bold text-gray-900">System Administration Dashboard</h1>
            <p class="text-xs text-gray-500 mt-1">Review pending job postings and ad campaign requests submitted by businesses.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <!-- Left Column: Pending Jobs Queue -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm p-5 space-y-4">
              <h2 class="font-bold text-gray-900 text-sm border-b border-gray-150 pb-2 flex justify-between items-center">
                <span>Pending Job Postings Queue</span>
                <span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">{{ pendingJobs().length }}</span>
              </h2>

              @if (pendingJobs().length === 0) {
                <div class="text-center py-12 text-gray-400 text-xs italic">
                  🎉 All caught up! No pending jobs for approval.
                </div>
              } @else {
                <div class="space-y-4">
                  @for (job of pendingJobs(); track job.id) {
                    <div class="border border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:shadow-xs transition-shadow">
                      <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-bold text-sm text-[#0A66C2] flex-shrink-0">
                          {{ job.logo }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="font-bold text-gray-905 text-sm truncate">{{ job.title }}</h3>
                          <p class="text-xs text-gray-750 font-medium">{{ job.company }} &bull; {{ job.location }}</p>
                          <p class="text-[10px] text-gray-400 mt-0.5">Submitted {{ formatTime(job.postedAt) }}</p>
                        </div>
                      </div>

                      <div class="text-[11px] text-gray-600 bg-gray-50 rounded p-2.5 font-medium leading-relaxed max-h-32 overflow-y-auto font-sans">
                        <strong>Type:</strong> {{ job.workplaceType }} | {{ job.type }} &bull; <strong>Salary:</strong> {{ job.salary || 'N/A' }}
                        <br />
                        <strong>Description:</strong> {{ job.description }}
                      </div>

                      <div class="flex items-center gap-2 pt-1">
                        <button
                          (click)="approveJob(job.id)"
                          class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full px-4 py-1.5 transition-colors cursor-pointer border-0 shadow-sm"
                        >
                          ✓ Approve Job
                        </button>
                        <button
                          (click)="rejectJob(job.id)"
                          class="border border-red-500 hover:bg-red-50 text-red-650 text-xs font-bold rounded-full px-4 py-1.5 transition-colors cursor-pointer"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Right Column: Pending Ads Queue -->
            <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm p-5 space-y-4">
              <h2 class="font-bold text-gray-900 text-sm border-b border-gray-150 pb-2 flex justify-between items-center">
                <span>Pending Ad Campaigns Queue</span>
                <span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">{{ pendingAds().length }}</span>
              </h2>

              @if (pendingAds().length === 0) {
                <div class="text-center py-12 text-gray-400 text-xs italic">
                  🎉 All caught up! No pending ad requests for approval.
                </div>
              } @else {
                <div class="space-y-4">
                  @for (ad of pendingAds(); track ad.id) {
                    <div class="border border-gray-200 rounded-lg p-4 space-y-3 bg-white hover:shadow-xs transition-shadow">
                      <div>
                        <h3 class="font-bold text-gray-905 text-xs">{{ ad.title }}</h3>
                        <p class="text-[11px] text-gray-600 mt-0.5">Brand: {{ ad.companyName }}</p>
                      </div>

                      <div class="text-[11px] text-gray-600 bg-gray-50 rounded p-2.5 font-medium leading-relaxed font-sans">
                        <strong>Preview Description:</strong> {{ ad.description }}
                        <br />
                        <strong>Logo Initials:</strong> {{ ad.logoText }} | <strong>CTA:</strong> "{{ ad.ctaText }}" &rarr; <span class="text-blue-600 underline text-[10px] break-all">{{ ad.ctaUrl }}</span>
                      </div>

                      <div class="flex items-center gap-2 pt-1">
                        <button
                          (click)="approveAd(ad.id)"
                          class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-full px-4 py-1.5 transition-colors cursor-pointer border-0 shadow-sm"
                        >
                          ✓ Approve Ad
                        </button>
                        <button
                          (click)="rejectAd(ad.id)"
                          class="border border-red-500 hover:bg-red-50 text-red-650 text-xs font-bold rounded-full px-4 py-1.5 transition-colors cursor-pointer"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- QUALIFICATIONS MATCH DETAIL MODAL -->
      @if (showQualificationsModal() && selectedJob(); as job) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[480px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-semibold text-gray-900 text-base flex items-center gap-1.5">
                ✨ Qualification Match Details
              </h2>
              <button (click)="showQualificationsModal.set(false)" class="p-1 hover:bg-gray-150 rounded-full border-0 bg-transparent cursor-pointer">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="px-6 py-4 space-y-4">
              <p class="text-xs text-gray-600">Here is how your profile compares to the requirements specified by <strong>{{ job.company }}</strong>.</p>
              
              <div class="space-y-2.5">
                <!-- Matching skills -->
                <p class="text-xs font-bold text-gray-800">Matching qualifications ({{ currentUser()?.skills?.length || 0 }})</p>
                <div class="flex flex-wrap gap-1.5">
                  @for (skill of currentUser()?.skills; track skill) {
                    <span class="text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 flex items-center gap-1">
                      ✓ {{ skill }}
                    </span>
                  }
                </div>

                <hr class="border-gray-100 my-3" />

                <!-- Missing qualifications -->
                <p class="text-xs font-bold text-gray-800">Missing qualifications ({{ job.missingQualifications?.length || 0 }})</p>
                <div class="space-y-1.5 flex flex-col">
                  @for (skill of job.missingQualifications; track skill) {
                    <span class="text-[11px] font-medium text-red-700 bg-red-50/50 px-2.5 py-1 rounded-full border border-red-200 self-start flex items-center gap-1">
                      ✗ {{ skill }}
                    </span>
                  }
                </div>
              </div>
            </div>
            <div class="px-6 py-3 border-t border-gray-200 flex justify-end bg-gray-50">
              <button (click)="showQualificationsModal.set(false)" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-full px-5 py-1.5 border-0 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <!-- CREATE JOB ALERT MODAL OVERLAY -->
      @if (showAlertModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[450px] shadow-xl overflow-hidden" data-testid="modal-job-alert">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-semibold text-gray-900 text-base">Create job alert</h2>
              <button (click)="closeAlertModal()" class="p-1 hover:bg-gray-150 rounded-full border-0 bg-transparent cursor-pointer">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="px-6 py-4 space-y-4">
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Search keyword</label>
                <input
                  type="text"
                  [(ngModel)]="alertKeyword"
                  placeholder="e.g. Developer, Designer"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Location</label>
                <input
                  type="text"
                  [(ngModel)]="alertLocation"
                  placeholder="e.g. San Francisco, CA"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Experience level</label>
                <select
                  [(ngModel)]="alertExperience"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium"
                >
                  <option value="">Any</option>
                  <option value="Senior">Senior</option>
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Fresher">Fresher / Junior</option>
                </select>
              </div>
            </div>
            <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button (click)="closeAlertModal()" class="border border-gray-400 text-gray-605 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">
                Cancel
              </button>
              <button
                (click)="submitJobAlert()"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold rounded-full px-5 py-2 border-0 cursor-pointer"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      }

      <!-- EASY APPLY MODAL OVERLAY -->
      @if (selectedJob(); as job) {
        @if (showApplyModal()) {
          <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div class="bg-white rounded-xl w-full max-w-[500px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" data-testid="modal-easy-apply">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 class="font-semibold text-gray-900 text-base">Apply to {{ job.company }}</h2>
                <button (click)="closeApplyModal()" class="p-1 hover:bg-gray-150 rounded-full border-0 bg-transparent cursor-pointer">
                  <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div class="px-6 py-4 space-y-4">
                <div class="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p class="font-semibold text-xs text-gray-800">{{ job.title }}</p>
                  <p class="text-[11px] text-gray-605 mt-0.5">{{ job.company }} &bull; {{ job.location }}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold text-gray-700">Contact info</p>
                  <div class="mt-2 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.backgroundColor]="currentUser()?.avatarColor || '#0A66C2'">
                      {{ currentUser()?.avatarInitials }}
                    </div>
                    <div>
                      <p class="text-xs font-semibold text-gray-900">{{ currentUser()?.name }}</p>
                      <p class="text-[11px] text-gray-500">{{ currentUser()?.email }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Resume</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                    <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p class="text-xs text-gray-600 font-semibold">Upload resume (PDF, DOCX)</p>
                    <p class="text-[10px] text-gray-400 mt-1">Recommended file size: 2MB or less</p>
                  </div>
                </div>
              </div>
              <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button (click)="closeApplyModal()" class="border border-gray-400 text-gray-650 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">
                  Cancel
                </button>
                <button
                  (click)="submitApplication()"
                  data-testid="button-submit-application"
                  class="bg-[#0A66C2] hover:bg-[#004182] text-[#fff] text-xs font-semibold rounded-full px-5 py-2 border-0 cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        }
      }

      <!-- BUSINESS EMPLOYER MODALS -->
      @if (showPostJobModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[550px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-bold text-gray-900 text-base">Post a New Job Opening</h2>
              <button (click)="showPostJobModal.set(false)" class="p-1 hover:bg-gray-150 rounded-full border-0 bg-transparent cursor-pointer">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form (ngSubmit)="submitPostJob()" class="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Job Title *</label>
                  <input type="text" [(ngModel)]="postJobTitle" name="title" required placeholder="e.g. Senior Angular Developer" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Company Name *</label>
                  <input type="text" [(ngModel)]="postJobCompany" name="company" required placeholder="e.g. NeST Group" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Location *</label>
                  <input type="text" [(ngModel)]="postJobLocation" name="location" required placeholder="e.g. Kochi, Kerala" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Workplace Type *</label>
                  <select [(ngModel)]="postJobWorkplaceType" name="workplaceType" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white">
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Job Type *</label>
                  <select [(ngModel)]="postJobType" name="type" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Salary Range</label>
                  <input type="text" [(ngModel)]="postJobSalary" name="salary" placeholder="e.g. ₹5,00,000 - ₹8,00,000 / year" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Logo Initials (2 Chars) *</label>
                  <input type="text" maxlength="2" [(ngModel)]="postJobLogo" name="logo" required placeholder="e.g. NG" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none uppercase" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Job Description *</label>
                <textarea [(ngModel)]="postJobDescription" name="description" required rows="4" placeholder="Describe the responsibilities, requirements, and benefits..." class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-sans"></textarea>
              </div>
              <div class="border-t border-gray-200 pt-4 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4">
                <button type="button" (click)="showPostJobModal.set(false)" class="border border-gray-400 text-gray-600 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">Cancel</button>
                <button type="submit" [disabled]="!postJobTitle || !postJobCompany || !postJobLocation || !postJobDescription || !postJobLogo" class="bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full px-6 py-2 border-0 cursor-pointer">Post Job</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showRequestAdModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div class="bg-white rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 class="font-bold text-gray-900 text-base">Request a Promoted Ad Campaign</h2>
              <button (click)="showRequestAdModal.set(false)" class="p-1 hover:bg-gray-150 rounded-full border-0 bg-transparent cursor-pointer">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form (ngSubmit)="submitRequestAd()" class="px-6 py-4 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Ad Campaign Title *</label>
                  <input type="text" [(ngModel)]="reqAdTitle" name="title" required placeholder="e.g. Master your Angular skills" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Company/Brand Name *</label>
                  <input type="text" [(ngModel)]="reqAdCompany" name="companyName" required placeholder="e.g. NeST Academy" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Ad Description *</label>
                <input type="text" [(ngModel)]="reqAdDescription" name="description" required placeholder="e.g. Join the leading bootcamp and get certified." class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Logo Text (Max 5 Chars) *</label>
                  <input type="text" maxlength="5" [(ngModel)]="reqAdLogoText" name="logoText" required placeholder="e.g. NeST" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none uppercase" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">CTA Button Text *</label>
                  <input type="text" [(ngModel)]="reqAdCtaText" name="ctaText" required placeholder="e.g. Learn More, Apply Now" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">CTA Destination URL *</label>
                <input type="url" [(ngModel)]="reqAdCtaUrl" name="ctaUrl" required placeholder="e.g. https://www.nestgroup.net" class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none" />
              </div>
              <div class="border-t border-gray-200 pt-4 flex justify-end gap-3 bg-gray-50 -mx-6 -mb-4 px-6 py-4">
                <button type="button" (click)="showRequestAdModal.set(false)" class="border border-gray-400 text-gray-600 text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-100 bg-white cursor-pointer">Cancel</button>
                <button type="submit" [disabled]="!reqAdTitle || !reqAdCompany || !reqAdDescription || !reqAdLogoText || !reqAdCtaText || !reqAdCtaUrl" class="bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-full px-6 py-2 border-0 cursor-pointer">Request Ad</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class JobsComponent {
  private readonly stateService = inject(StateService);

  readonly currentUser = this.stateService.currentUser;
  readonly jobs = this.stateService.recommendedJobs;
  readonly applications = this.stateService.applications;
  readonly jobAlerts = this.stateService.jobAlerts;

  searchTitle = '';
  searchLocation = '';

  activeTab = signal<'candidate' | 'employer' | 'admin'>('candidate');

  // Pending for Admin
  pendingJobs = computed(() => this.stateService.jobs().filter((j) => j.status === 'pending'));
  pendingAds = computed(() => this.stateService.ads().filter((a) => a.status === 'pending'));

  // My postings for Employer
  myPostedJobs = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.stateService.jobs().filter((j) => j.postedById === user.id);
  });
  myRequestedAds = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.stateService.ads().filter((a) => a.postedById === user.id);
  });

  // Modal display toggles
  showPostJobModal = signal(false);
  showRequestAdModal = signal(false);

  // Form fields for Post Job
  postJobTitle = '';
  postJobCompany = '';
  postJobLocation = '';
  postJobWorkplaceType = 'On-site';
  postJobType = 'Full-time';
  postJobSalary = '';
  postJobDescription = '';
  postJobLogo = '';

  // Form fields for Request Ad
  reqAdTitle = '';
  reqAdCompany = '';
  reqAdDescription = '';
  reqAdLogoText = '';
  reqAdCtaText = 'Learn More';
  reqAdCtaUrl = 'https://www.nestgroup.net';

  selectedJob = signal<any | null>(null);
  showApplyModal = signal(false);
  showAlertModal = signal(false);
  showQualificationsModal = signal(false);

  alertKeyword = '';
  alertLocation = '';
  alertExperience = '';

  autoApplyEnabled = false;
  autoApplyKeyword = '';
  autoApplyLocation = '';
  autoApplyJobType = '';

  // Signals for local interactions
  dismissedJobs = signal<string[]>([]);
  viewedJobs = signal<string[]>([]);
  feedbackState = signal<Record<string, 'up' | 'down' | null>>({});

  constructor() {
    effect(() => {
      const activeJobs = this.filteredJobs();
      const current = this.selectedJob();
      if (activeJobs.length > 0) {
        const updated = activeJobs.find((j) => j.id === current?.id);
        if (updated) {
          this.selectedJob.set(updated);
        } else if (!current || !activeJobs.some((j) => j.id === current.id)) {
          this.selectedJob.set(activeJobs[0]);
        }
      } else {
        this.selectedJob.set(null);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const user = this.currentUser();
      if (user) {
        if (user.role === 'admin') {
          this.activeTab.set('admin');
        } else if (user.role === 'business') {
          this.activeTab.set('employer');
        } else {
          this.activeTab.set('candidate');
        }

        // Populate local settings
        this.autoApplyEnabled = user.autoApplyEnabled || false;
        this.autoApplyKeyword = user.autoApplyKeyword || '';
        this.autoApplyLocation = user.autoApplyLocation || '';
        this.autoApplyJobType = user.autoApplyJobType || '';
      }
    }, { allowSignalWrites: true });
  }

  filteredJobs = computed(() => {
    const titleQuery = this.searchTitle.toLowerCase().trim();
    const locQuery = this.searchLocation.toLowerCase().trim();
    const dismissed = this.dismissedJobs();
    return this.jobs()
      .filter((job) => !dismissed.includes(job.id))
      .filter((job) => {
        const matchTitle = !titleQuery || job.title.toLowerCase().includes(titleQuery) || job.company.toLowerCase().includes(titleQuery);
        const matchLoc = !locQuery || job.location.toLowerCase().includes(locQuery);
        return matchTitle && matchLoc;
      });
  });

  savedJobsCount = computed(() => this.currentUser()?.savedJobs?.length || 0);

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  selectJob(job: Job) {
    this.selectedJob.set(job);
    if (!this.viewedJobs().includes(job.id)) {
      this.viewedJobs.update((list) => [...list, job.id]);
    }
  }

  dismissJob(id: string, event: Event) {
    event.stopPropagation();
    this.dismissedJobs.update((list) => [...list, id]);
    if (this.selectedJob()?.id === id) {
      this.selectedJob.set(null);
    }
  }

  isJobViewed(id: string) {
    return this.viewedJobs().includes(id);
  }

  isJobSaved(jobId: string) {
    return this.currentUser()?.savedJobs?.includes(jobId) || false;
  }

  isJobApplied(jobId: string) {
    return this.applications().some((a) => a.jobId === jobId && a.userId === this.currentUser()?.id);
  }

  toggleSaveJob(jobId: string) {
    this.stateService.saveJob(jobId);
  }

  withdrawApplication(jobId: string) {
    this.stateService.withdrawApplication(jobId);
  }

  openApplyModal() {
    this.showApplyModal.set(true);
  }

  closeApplyModal() {
    this.showApplyModal.set(false);
  }

  submitApplication() {
    const job = this.selectedJob();
    if (job) {
      this.stateService.applyToJob(job.id);
    }
    this.closeApplyModal();
  }

  openAlertModal() {
    this.alertKeyword = '';
    this.alertLocation = '';
    this.alertExperience = '';
    this.showAlertModal.set(true);
  }

  closeAlertModal() {
    this.showAlertModal.set(false);
  }

  submitJobAlert() {
    this.stateService.addJobAlert(this.alertKeyword, this.alertLocation, this.alertExperience);
    this.closeAlertModal();
  }

  deleteJobAlert(alertId: string) {
    this.stateService.deleteJobAlert(alertId);
  }

  saveAutoApplySettings() {
    this.stateService.updateProfile({
      autoApplyEnabled: this.autoApplyEnabled,
      autoApplyKeyword: this.autoApplyKeyword,
      autoApplyLocation: this.autoApplyLocation,
      autoApplyJobType: this.autoApplyJobType
    });
  }

  submitFeedback(jobId: string, type: 'up' | 'down') {
    this.feedbackState.update((state) => ({
      ...state,
      [jobId]: state[jobId] === type ? null : type
    }));
  }

  getFeedbackState(jobId: string) {
    return this.feedbackState()[jobId] || null;
  }

  approveJob(jobId: string) {
    this.stateService.approveJob(jobId);
  }

  rejectJob(jobId: string) {
    this.stateService.rejectJob(jobId);
  }

  approveAd(adId: string) {
    this.stateService.approveAd(adId);
  }

  rejectAd(adId: string) {
    this.stateService.rejectAd(adId);
  }

  openPostJobModal() {
    this.postJobTitle = '';
    this.postJobCompany = '';
    this.postJobLocation = '';
    this.postJobWorkplaceType = 'On-site';
    this.postJobType = 'Full-time';
    this.postJobSalary = '';
    this.postJobDescription = '';
    this.postJobLogo = '';
    this.showPostJobModal.set(true);
  }

  submitPostJob() {
    this.stateService.postJobByBusiness({
      title: this.postJobTitle,
      company: this.postJobCompany,
      location: this.postJobLocation,
      workplaceType: this.postJobWorkplaceType,
      type: this.postJobType,
      salary: this.postJobSalary,
      description: this.postJobDescription,
      logo: this.postJobLogo.toUpperCase(),
      companyId: 'co4',
      easyApply: true
    });
    this.showPostJobModal.set(false);
  }

  openRequestAdModal() {
    this.reqAdTitle = '';
    this.reqAdCompany = '';
    this.reqAdDescription = '';
    this.reqAdLogoText = '';
    this.reqAdCtaText = 'Learn More';
    this.reqAdCtaUrl = 'https://www.nestgroup.net';
    this.showRequestAdModal.set(true);
  }

  submitRequestAd() {
    this.stateService.requestAd({
      title: this.reqAdTitle,
      companyName: this.reqAdCompany,
      description: this.reqAdDescription,
      logoText: this.reqAdLogoText.toUpperCase(),
      logoColor: '#0A66C2',
      coverColor: 'linear-gradient(135deg, #0A66C2, #000)',
      ctaText: this.reqAdCtaText,
      ctaUrl: this.reqAdCtaUrl
    });
    this.showRequestAdModal.set(false);
  }
}
