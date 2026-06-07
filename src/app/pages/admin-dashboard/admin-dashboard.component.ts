import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state.service';
import { User, Job, Ad, UserReport } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex font-sans text-gray-800">
      
      <!-- SIDEBAR -->
      <aside class="w-64 bg-white text-gray-700 flex flex-col border-r border-[#E0DFDC] shrink-0">
        <div class="p-6 border-b border-[#E0DFDC] flex items-center gap-2">
          <span class="text-white text-xl font-bold bg-[#0A66C2] px-2 py-0.5 rounded">in</span>
          <span class="text-gray-900 font-extrabold text-sm tracking-wide">SYSTEM ADMIN</span>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-1.5">
          <button
            (click)="activeSection.set('overview')"
            [class.bg-[#EEF3F8]]="activeSection() === 'overview'"
            [class.text-[#0A66C2]]="activeSection() === 'overview'"
            [class.border-l-4]="activeSection() === 'overview'"
            [class.border-[#0A66C2]]="activeSection() === 'overview'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
          >
            📊 Dashboard Overview
          </button>
          
          <button
            (click)="activeSection.set('enterprises')"
            [class.bg-[#EEF3F8]]="activeSection() === 'enterprises'"
            [class.text-[#0A66C2]]="activeSection() === 'enterprises'"
            [class.border-l-4]="activeSection() === 'enterprises'"
            [class.border-[#0A66C2]]="activeSection() === 'enterprises'"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
          >
            <span class="flex items-center gap-3">🏢 Verify Enterprises</span>
            @if (pendingBusinesses().length > 0) {
              <span class="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ pendingBusinesses().length }}
              </span>
            }
          </button>

          <button
            (click)="activeSection.set('jobs')"
            [class.bg-[#EEF3F8]]="activeSection() === 'jobs'"
            [class.text-[#0A66C2]]="activeSection() === 'jobs'"
            [class.border-l-4]="activeSection() === 'jobs'"
            [class.border-[#0A66C2]]="activeSection() === 'jobs'"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
          >
            <span class="flex items-center gap-3">💼 Job Postings Queue</span>
            @if (pendingJobs().length > 0) {
              <span class="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ pendingJobs().length }}
              </span>
            }
          </button>

          <button
            (click)="activeSection.set('ads')"
            [class.bg-[#EEF3F8]]="activeSection() === 'ads'"
            [class.text-[#0A66C2]]="activeSection() === 'ads'"
            [class.border-l-4]="activeSection() === 'ads'"
            [class.border-[#0A66C2]]="activeSection() === 'ads'"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
          >
            <span class="flex items-center gap-3">📢 Ad Campaigns Queue</span>
            @if (pendingAds().length > 0) {
              <span class="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ pendingAds().length }}
              </span>
            }
          </button>

          <button
            (click)="activeSection.set('incidents')"
            [class.bg-[#EEF3F8]]="activeSection() === 'incidents'"
            [class.text-[#0A66C2]]="activeSection() === 'incidents'"
            [class.border-l-4]="activeSection() === 'incidents'"
            [class.border-[#0A66C2]]="activeSection() === 'incidents'"
            class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
          >
            <span class="flex items-center gap-3">🛡️ Incident Reports Log</span>
            @if (pendingReports().length > 0) {
              <span class="bg-red-650 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ pendingReports().length }}
              </span>
            }
          </button>
        </nav>

        <!-- FOOTER INFO -->
        <div class="p-6 border-t border-[#E0DFDC] text-xs text-gray-500">
          <p>Logged in as Admin</p>
          <button (click)="signOut()" class="mt-3 text-red-650 hover:text-red-800 font-bold border-0 bg-transparent cursor-pointer p-0">
            Sign Out
          </button>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <main class="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14">
        
        <!-- SECTION TITLE HEADER -->
        <header class="bg-white border-b border-[#E0DFDC] px-8 py-6 flex items-center justify-between shadow-xs">
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight capitalize">
              {{ getSectionTitle() }}
            </h1>
            <p class="text-xs text-gray-500 mt-1">System administrator console panel</p>
          </div>
          
          <div class="text-xs text-slate-500 bg-slate-100 border border-[#E0DFDC] rounded-lg px-4 py-2 font-mono">
            Platform Status: <span class="text-green-600 font-bold">Active ✓</span>
          </div>
        </header>

        <!-- WRAPPER -->
        <div class="p-8 max-w-[1200px] w-full mx-auto space-y-6">

          <!-- 1. OVERVIEW SECTION -->
          @if (activeSection() === 'overview') {
            <div class="space-y-8 animate-in fade-in duration-200">
              <!-- Summary Stats Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0A66C2]"></div>
                  <div>
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Registered Users</span>
                    <span class="text-3xl font-extrabold text-slate-900 mt-1.5 block">{{ totalUsersCount() }}</span>
                    <span class="text-[10px] text-green-600 font-semibold mt-1 block">Live candidates & administrators</span>
                  </div>
                  <div class="text-4xl">👥</div>
                </div>

                <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#057642]"></div>
                  <div>
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Vetted Businesses</span>
                    <span class="text-3xl font-extrabold text-slate-900 mt-1.5 block">{{ vettedBusinessesCount() }}</span>
                    <span class="text-[10px] text-gray-500 font-medium mt-1 block">{{ pendingBusinesses().length }} waiting validation</span>
                  </div>
                  <div class="text-4xl">🏢</div>
                </div>

                <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C77800]"></div>
                  <div>
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Live Job Vacancies</span>
                    <span class="text-3xl font-extrabold text-slate-900 mt-1.5 block">{{ liveJobsCount() }}</span>
                    <span class="text-[10px] text-gray-500 font-medium mt-1 block">{{ pendingJobs().length }} pending approval</span>
                  </div>
                  <div class="text-4xl">💼</div>
                </div>

              </div>

              <!-- Second Stats row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                  <div>
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Open Incidents</span>
                    <span class="text-3xl font-extrabold text-slate-900 mt-1.5 block">{{ pendingReports().length }}</span>
                    <span class="text-[10px] text-red-500 font-bold mt-1 block">Requires moderation review</span>
                  </div>
                  <div class="text-4xl">🛡️</div>
                </div>

                <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex items-center justify-between shadow-sm relative overflow-hidden group">
                  <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0a66c2]"></div>
                  <div>
                    <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Mock Platform Revenues</span>
                    <span class="text-3xl font-extrabold text-slate-900 mt-1.5 block">₹{{ getPaidAdRevenues() }}</span>
                    <span class="text-[10px] text-green-600 font-semibold mt-1 block">From business ad billing logs</span>
                  </div>
                  <div class="text-4xl">💰</div>
                </div>

              </div>

              <!-- Activity Chart Mock -->
              <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 shadow-sm">
                <h3 class="text-sm font-bold text-slate-900 mb-4">Mock Site Traffic & Moderator Activity Trends</h3>
                <div class="flex items-end gap-3 h-48 pt-6 border-b border-l border-slate-200 px-4">
                  <div class="flex-1 bg-slate-100 hover:bg-slate-200 rounded-t h-[40%] relative group" title="Monday">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">400</span>
                  </div>
                  <div class="flex-1 bg-slate-100 hover:bg-slate-200 rounded-t h-[55%] relative group" title="Tuesday">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">550</span>
                  </div>
                  <div class="flex-1 bg-slate-100 hover:bg-slate-200 rounded-t h-[75%] relative group" title="Wednesday">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">750</span>
                  </div>
                  <div class="flex-1 bg-slate-100 hover:bg-slate-200 rounded-t h-[90%] relative group" title="Thursday">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">900</span>
                  </div>
                  <div class="flex-1 bg-[#0A66C2] rounded-t h-[95%] relative group" title="Friday (Today)">
                    <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#0A66C2]">950</span>
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-gray-400 font-semibold mt-2 px-6">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span class="text-[#0A66C2] font-bold">Fri (Today)</span>
                </div>
              </div>
            </div>
          }

          <!-- 2. VERIFY ENTERPRISES SECTION -->
          @if (activeSection() === 'enterprises') {
            <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div class="p-6 border-b border-[#E0DFDC] bg-gray-50 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Enterprise Approvals Queue</span>
                <span class="bg-[#EEF3F8] text-[#0A66C2] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {{ pendingBusinesses().length }} Pending
                </span>
              </div>

              <div class="divide-y divide-slate-150">
                @if (pendingBusinesses().length === 0) {
                  <div class="p-12 text-center text-gray-500 italic text-sm">
                    🎉 No business enterprises waiting for vetting approval!
                  </div>
                } @else {
                  @for (biz of pendingBusinesses(); track biz.id) {
                    <div class="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-lg flex items-center justify-center font-bold text-xl uppercase">
                          {{ biz.avatarInitials }}
                        </div>
                        <div>
                          <h4 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                            {{ biz.name }}
                            <span class="bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                              Awaiting Vetting
                            </span>
                          </h4>
                          <p class="text-xs text-gray-650 mt-0.5">{{ biz.headline }}</p>
                          <p class="text-[10px] text-gray-400 mt-1">Email ID: <span class="font-mono text-gray-600">{{ biz.email }}</span> &bull; Location: {{ biz.location }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          (click)="verifyBusiness(biz.id, 'approve')"
                          class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
                        >
                          ✓ Approve Enterprise
                        </button>
                        <button
                          (click)="verifyBusiness(biz.id, 'reject')"
                          class="bg-transparent border border-red-200 hover:bg-red-50 text-red-650 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- 3. JOB POSTINGS QUEUE SECTION -->
          @if (activeSection() === 'jobs') {
            <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div class="p-6 border-b border-[#E0DFDC] bg-gray-50 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Job Vacancies Queue</span>
                <span class="bg-[#EEF3F8] text-[#0A66C2] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {{ pendingJobs().length }} Pending
                </span>
              </div>

              <div class="divide-y divide-slate-150">
                @if (pendingJobs().length === 0) {
                  <div class="p-12 text-center text-gray-500 italic text-sm">
                    🎉 All job postings caught up! No pending vacancies.
                  </div>
                } @else {
                  @for (job of pendingJobs(); track job.id) {
                    <div class="p-6 space-y-4">
                      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div class="flex items-start gap-4">
                          <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xl text-[#0A66C2] border border-gray-200">
                            {{ job.logo }}
                          </div>
                          <div>
                            <h4 class="font-bold text-slate-900 text-sm">{{ job.title }}</h4>
                            <p class="text-xs text-gray-700 font-medium">{{ job.company }} &bull; {{ job.location }}</p>
                            <div class="flex items-center gap-1.5 flex-wrap mt-2">
                              <span class="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">{{ job.workplaceType }}</span>
                              <span class="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">{{ job.type }}</span>
                              @if (job.salary) {
                                <span class="text-[9px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase">{{ job.salary }}</span>
                              }
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            (click)="approveJob(job.id)"
                            class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
                          >
                            ✓ Approve Job
                          </button>
                          <button
                            (click)="rejectJob(job.id)"
                            class="bg-transparent border border-red-200 hover:bg-red-50 text-red-650 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>

                      <div class="bg-slate-50 border border-[#E0DFDC] rounded-lg p-4 text-xs font-medium text-gray-650 leading-relaxed font-sans">
                        <p class="font-bold text-slate-800 mb-1">Vacancy Description Preview:</p>
                        <p class="whitespace-pre-line">{{ job.description }}</p>
                      </div>

                      <p class="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <span>Submitted by recruiter:</span>
                        <span class="text-gray-600 font-mono">{{ job.postedById }}</span>
                        <span>&bull;</span>
                        <span>{{ formatTime(job.postedAt) }}</span>
                      </p>
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- 4. AD CAMPAIGNS QUEUE SECTION -->
          @if (activeSection() === 'ads') {
            <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div class="p-6 border-b border-[#E0DFDC] bg-gray-50 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Ad Campaigns Queue</span>
                <span class="bg-[#EEF3F8] text-[#0A66C2] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {{ pendingAds().length }} Pending
                </span>
              </div>

              <div class="divide-y divide-slate-150">
                @if (pendingAds().length === 0) {
                  <div class="p-12 text-center text-gray-500 italic text-sm">
                    🎉 No paid ad requests waiting validation.
                  </div>
                } @else {
                  @for (ad of pendingAds(); track ad.id) {
                    <div class="p-6 space-y-4">
                      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h4 class="font-bold text-slate-900 text-sm">{{ ad.title }}</h4>
                          <p class="text-xs text-gray-700 font-medium">Brand: {{ ad.companyName }}</p>
                          
                          <div class="flex items-center gap-1.5 flex-wrap mt-2">
                            <span class="text-[9px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase">💳 Paid</span>
                            @if (ad.transactionId) {
                              <span class="text-[9px] font-semibold text-gray-500 bg-gray-100 border border-[#E0DFDC] px-2 py-0.5 rounded font-mono">
                                {{ ad.transactionId }}
                              </span>
                            }
                            @if (ad.cardLast4) {
                              <span class="text-[9px] text-gray-400 font-semibold font-mono">Card ending: *{{ ad.cardLast4 }}</span>
                            }
                          </div>
                        </div>

                        <div class="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            (click)="approveAd(ad.id)"
                            class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
                          >
                            ✓ Approve Campaign
                          </button>
                          <button
                            (click)="rejectAd(ad.id)"
                            class="bg-transparent border border-red-200 hover:bg-red-50 text-red-650 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            ✗ Reject
                          </button>
                        </div>
                      </div>

                      <!-- Layout Preview of the Ad banner -->
                      <div class="bg-slate-50 border border-[#E0DFDC] rounded-lg p-4 flex flex-col md:flex-row gap-6 items-center">
                        <div class="flex-1 text-xs">
                          <p class="font-bold text-slate-800 mb-1">Ad Details:</p>
                          <p><span class="text-gray-500">CTA Button Text:</span> "{{ ad.ctaText }}"</p>
                          <p><span class="text-gray-500">Destination URL:</span> <a [href]="ad.ctaUrl" target="_blank" class="text-[#0A66C2] hover:underline font-semibold font-mono">{{ ad.ctaUrl }}</a></p>
                          <p class="mt-2 text-gray-650 whitespace-pre-wrap"><span class="text-gray-500">Headline/Description:</span> {{ ad.description }}</p>
                        </div>

                        <!-- Preview Banner Mock -->
                        <div class="w-full max-w-[280px] bg-white border border-[#E0DFDC] rounded-lg p-4 text-center space-y-2.5 shadow-sm">
                          <div class="flex items-center justify-between text-[8px] text-gray-400 font-bold uppercase">
                            <span>Promoted Campaign</span>
                            <span>&bull;&bull;&bull;</span>
                          </div>
                          <div class="w-10 h-10 bg-[#0A66C2] text-white rounded font-black flex items-center justify-center mx-auto text-xs shadow-sm font-sans" [style.backgroundColor]="ad.logoColor || '#0A66C2'">
                            {{ ad.logoText }}
                          </div>
                          <h4 class="font-bold text-gray-905 text-[10px] leading-tight">{{ ad.title }}</h4>
                          <p class="text-[9px] text-gray-500 leading-normal line-clamp-2">{{ ad.description }}</p>
                          <button type="button" class="w-full text-[9px] font-bold py-1 rounded-full border border-[#0A66C2] text-[#0A66C2] bg-white">
                            {{ ad.ctaText || 'Learn More' }}
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- 5. INCIDENT REPORTS LOG SECTION -->
          @if (activeSection() === 'incidents') {
            <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden animate-in fade-in duration-200">
              <div class="p-6 border-b border-[#E0DFDC] bg-gray-50 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">User Incident Reports Log</span>
                <span class="bg-red-50 text-red-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {{ pendingReports().length }} Pending Incidents
                </span>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-gray-50 border-b border-[#E0DFDC] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th class="px-6 py-4">Reporter</th>
                      <th class="px-6 py-4">Reported User</th>
                      <th class="px-6 py-4">Reason & Details</th>
                      <th class="px-6 py-4">Status</th>
                      <th class="px-6 py-4 text-right">Moderator Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-150 text-xs">
                    @if (reports().length === 0) {
                      <tr>
                        <td colspan="5" class="p-12 text-center text-gray-500 italic">No reports recorded.</td>
                      </tr>
                    } @else {
                      @for (report of reports(); track report.id) {
                        <tr class="hover:bg-slate-50/50" [class.bg-red-50/10]="report.status === 'pending'">
                          <td class="px-6 py-4">
                            <p class="font-bold text-slate-800">{{ getUserName(report.reporterId) }}</p>
                            <p class="text-[10px] text-gray-400 font-mono mt-0.5">ID: {{ report.reporterId }}</p>
                          </td>
                          <td class="px-6 py-4">
                            <p class="font-bold text-slate-800">{{ getUserName(report.reportedUserId) }}</p>
                            <p class="text-[10px] text-gray-400 font-mono mt-0.5">ID: {{ report.reportedUserId }}</p>
                          </td>
                          <td class="px-6 py-4 space-y-1">
                            <p class="font-bold text-slate-900 flex items-center gap-1.5">
                              <span class="bg-red-50 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded border border-red-200 uppercase">
                                {{ report.reason }}
                              </span>
                              @if (report.postId) {
                                <span class="text-[9px] text-[#0A66C2] bg-[#EEF3F8] px-1.5 py-0.2 rounded border border-blue-200 font-semibold uppercase">
                                  Post Issue
                                </span>
                              }
                            </p>
                            <p class="text-gray-650 max-w-[280px] leading-relaxed">{{ report.details || 'No detailed log provided' }}</p>
                            @if (report.postId && getPostPreview(report.postId)) {
                              <p class="text-[10px] bg-slate-100 border border-[#E0DFDC] rounded p-2 mt-1.5 text-gray-500 leading-normal italic">
                                Reported Content: "{{ getPostPreview(report.postId) }}"
                              </p>
                            }
                            <p class="text-[9px] text-gray-400 font-semibold">{{ formatTime(report.createdAt) }}</p>
                          </td>
                          <td class="px-6 py-4">
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
                              [class.bg-amber-50]="report.status === 'pending'"
                              [class.border-amber-200]="report.status === 'pending'"
                              [class.text-amber-800]="report.status === 'pending'"
                              [class.bg-green-50]="report.status === 'resolved'"
                              [class.border-green-200]="report.status === 'resolved'"
                              [class.text-green-800]="report.status === 'resolved'"
                            >
                              {{ report.status }}
                            </span>
                          </td>
                          <td class="px-6 py-4 text-right space-y-1.5">
                            @if (report.status === 'pending') {
                              <div class="flex flex-col items-end gap-1">
                                <button
                                  (click)="resolveReport(report.id, 'dismiss')"
                                  class="bg-gray-100 hover:bg-gray-200 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-md transition-colors border-0 cursor-pointer w-32"
                                >
                                  Dismiss Report
                                </button>
                                @if (report.postId) {
                                  <button
                                    (click)="resolveReport(report.id, 'delete_post')"
                                    class="bg-[#C77800] hover:bg-[#8a5300] text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors border-0 cursor-pointer w-32 shadow-sm"
                                  >
                                    Delete Post
                                  </button>
                                }
                                <button
                                  (click)="resolveReport(report.id, 'block_user')"
                                  class="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-colors border-0 cursor-pointer w-32 shadow-sm"
                                >
                                  Block User
                                </button>
                              </div>
                            } @else {
                              <span class="text-gray-400 font-semibold text-[10px]">Resolved ✓</span>
                            }
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

        </div>
      </main>

    </div>
  `
})
export class AdminDashboardComponent {
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly reports = this.stateService.reports;
  readonly users = this.stateService.users;
  readonly jobs = this.stateService.jobs;
  readonly ads = this.stateService.ads;

  activeSection = signal<'overview' | 'enterprises' | 'jobs' | 'ads' | 'incidents'>('overview');

  // Computed Vetting and Moderator Queues
  pendingBusinesses = computed(() => this.users().filter(u => u.role === 'business' && u.isApprovedBusiness === false));
  pendingJobs = computed(() => this.jobs().filter(j => j.status === 'pending'));
  pendingAds = computed(() => this.ads().filter(a => a.status === 'pending' && a.paymentStatus === 'paid'));
  pendingReports = computed(() => this.reports().filter(r => r.status === 'pending'));

  // Dashboard Overview Counters
  totalUsersCount = computed(() => this.users().length);
  vettedBusinessesCount = computed(() => this.users().filter(u => u.role === 'business' && u.isApprovedBusiness === true).length);
  liveJobsCount = computed(() => this.jobs().filter(j => j.status === 'approved').length);

  getSectionTitle() {
    switch (this.activeSection()) {
      case 'overview': return 'Console Overview';
      case 'enterprises': return 'Verify Business Registrations';
      case 'jobs': return 'Pending Job Postings Queue';
      case 'ads': return 'Pending Ad Campaigns Queue';
      case 'incidents': return 'Incident Reports Log';
    }
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  getUserName(userId: string) {
    const matched = this.users().find(u => u.id === userId);
    return matched ? matched.name : `User (${userId.slice(0,6)})`;
  }

  getPostPreview(postId: string) {
    const post = this.stateService.posts().find(p => p.id === postId);
    if (!post) return '';
    return post.content.length > 60 ? post.content.slice(0, 60) + '...' : post.content;
  }

  getPaidAdRevenues() {
    const paidAds = this.ads().filter(a => a.paymentStatus === 'paid');
    const sum = paidAds.reduce((acc, ad) => acc + (ad.paymentAmount || 299), 0);
    return sum.toLocaleString();
  }

  // Admin Actions
  verifyBusiness(userId: string, action: 'approve' | 'reject') {
    this.stateService.verifyBusiness(userId, action);
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

  resolveReport(reportId: string, action: 'dismiss' | 'delete_post' | 'block_user') {
    this.stateService.resolveReport(reportId, action);
  }

  signOut() {
    this.stateService.logout();
    this.router.navigate(['/login']);
  }
}
