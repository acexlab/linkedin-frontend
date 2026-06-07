import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Company, Job, Ad } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex font-sans text-gray-800">
      
      <!-- 1. PENDING VETTING BLOCKED OVERLAY -->
      @if (currentUser()?.isApprovedBusiness === false) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 pt-14">
          <div class="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl text-center space-y-5 border border-[#E0DFDC] animate-in fade-in zoom-in-95 duration-200">
            <div class="w-16 h-16 bg-amber-50 text-amber-650 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm border border-amber-200">
              ⏳
            </div>
            <div>
              <h2 class="text-xl font-black text-slate-900">Enterprise Vetting Pending</h2>
              <p class="text-xs text-gray-500 mt-2 leading-relaxed">
                Your business organization account is currently undergoing vetting verification by system administrators. 
                Once verified, you will unlock full access to job post managers, campaign builders, and payment integrations.
              </p>
            </div>
            <div class="bg-slate-50 border border-[#E0DFDC] rounded-lg p-3 text-left">
              <p class="text-[10px] text-gray-400 font-bold uppercase">Registration details</p>
              <p class="text-xs font-semibold text-slate-800 mt-1">Contact: {{ currentUser()?.name }}</p>
              <p class="text-xs text-gray-600 font-mono">Email: {{ currentUser()?.email }}</p>
            </div>
            <button (click)="signOut()" class="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold py-2.5 rounded-lg transition-colors border-0 cursor-pointer shadow-sm">
              Sign Out & Return Later
            </button>
          </div>
        </div>
      }

      <!-- 2. SIDEBAR -->
      @if (currentUser()?.isApprovedBusiness !== false) {
        <aside class="w-64 bg-white text-gray-700 flex flex-col border-r border-[#E0DFDC] shrink-0">
          <div class="p-6 border-b border-[#E0DFDC] flex items-center gap-2">
            <span class="text-white text-xl font-bold bg-[#0A66C2] px-2 py-0.5 rounded">in</span>
            <span class="text-gray-900 font-extrabold text-sm tracking-wide">BUSINESS CENTER</span>
          </div>

          <!-- Company Card Mini -->
          @if (myCompany(); as co) {
            <div class="px-6 py-4 border-b border-[#E0DFDC] flex items-center gap-3 bg-gray-50 font-sans">
              <div class="w-10 h-10 rounded bg-[#0A66C2] flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0 uppercase" [style.backgroundColor]="co.logoColor">
                {{ co.logo }}
              </div>
              <div class="min-w-0">
                <p class="font-bold text-gray-900 text-xs truncate">{{ co.name }}</p>
                <p class="text-[10px] text-gray-550 truncate">{{ co.industry }} &bull; {{ co.size }}</p>
              </div>
            </div>
          }

          <nav class="flex-1 px-4 py-6 space-y-1.5">
            <button
              (click)="activeSection.set('company')"
              [class.bg-[#EEF3F8]]="activeSection() === 'company'"
              [class.text-[#0A66C2]]="activeSection() === 'company'"
              [class.border-l-4]="activeSection() === 'company'"
              [class.border-[#0A66C2]]="activeSection() === 'company'"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
            >
              🏢 Company Profile
            </button>
            
            <button
              (click)="activeSection.set('jobs')"
              [class.bg-[#EEF3F8]]="activeSection() === 'jobs'"
              [class.text-[#0A66C2]]="activeSection() === 'jobs'"
              [class.border-l-4]="activeSection() === 'jobs'"
              [class.border-[#0A66C2]]="activeSection() === 'jobs'"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
            >
              <span class="flex items-center gap-3">💼 Job Postings</span>
              <span class="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ myJobs().length }}
              </span>
            </button>

            <button
              (click)="activeSection.set('ads')"
              [class.bg-[#EEF3F8]]="activeSection() === 'ads'"
              [class.text-[#0A66C2]]="activeSection() === 'ads'"
              [class.border-l-4]="activeSection() === 'ads'"
              [class.border-[#0A66C2]]="activeSection() === 'ads'"
              class="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
            >
              <span class="flex items-center gap-3">📢 Promoted Ads</span>
              <span class="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {{ myAds().length }}
              </span>
            </button>

            <button
              (click)="activeSection.set('billing')"
              [class.bg-[#EEF3F8]]="activeSection() === 'billing'"
              [class.text-[#0A66C2]]="activeSection() === 'billing'"
              [class.border-l-4]="activeSection() === 'billing'"
              [class.border-[#0A66C2]]="activeSection() === 'billing'"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#EEF3F8] hover:text-[#0A66C2] transition-colors cursor-pointer border-0 bg-transparent text-left"
            >
              💳 Analytics & Billing
            </button>
          </nav>

          <div class="p-6 border-t border-[#E0DFDC] text-xs text-gray-500">
            <p>Logged in as Recruiter</p>
            <button (click)="signOut()" class="mt-3 text-red-650 hover:text-red-800 font-bold border-0 bg-transparent cursor-pointer p-0">
              Sign Out
            </button>
          </div>
        </aside>
      }

      <!-- MAIN CONTENT -->
      @if (currentUser()?.isApprovedBusiness !== false) {
        <main class="flex-1 flex flex-col min-w-0 overflow-y-auto pt-14">
          
          <!-- SECTION TITLE HEADER -->
          <header class="bg-white border-b border-[#E0DFDC] px-8 py-6 flex items-center justify-between shadow-xs">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight capitalize">
                {{ getSectionTitle() }}
              </h1>
              <p class="text-xs text-gray-500 mt-1">Manage recruiting, campaigns, and organizational metrics</p>
            </div>
            
            @if (myCompany(); as co) {
              <div class="text-xs text-slate-500 bg-slate-100 border border-[#E0DFDC] rounded-lg px-4 py-2 font-semibold flex items-center gap-2">
                <span>Enterprise: </span>
                <span class="text-[#0A66C2] font-bold">{{ co.name }} ✓</span>
              </div>
            }
          </header>

          <!-- WRAPPER -->
          <div class="p-8 max-w-[1200px] w-full mx-auto space-y-6">

            <!-- A. COMPANY PROFILE TAB -->
            @if (activeSection() === 'company') {
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start animate-in fade-in duration-200">
                
                <!-- Left Column -->
                <div class="space-y-6">
                  <!-- Left Card: Form -->
                  <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6 space-y-6">
                    <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Organizational Profile Settings</h3>
                    
                    <form (ngSubmit)="saveCompanyProfile()" class="space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Company Name *</label>
                          <input type="text" [(ngModel)]="compName" name="compName" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Tagline / Mission *</label>
                          <input type="text" [(ngModel)]="compTagline" name="compTagline" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Industry Sector *</label>
                          <input type="text" [(ngModel)]="compIndustry" name="compIndustry" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Headquarters Location *</label>
                          <input type="text" [(ngModel)]="compHeadquarters" name="compHeadquarters" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Company Size (Employees) *</label>
                          <select [(ngModel)]="compSize" name="compSize" class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white font-medium">
                            <option value="1-10 employees">1-10 employees</option>
                            <option value="11-50 employees">11-50 employees</option>
                            <option value="51-200 employees">51-200 employees</option>
                            <option value="201-500 employees">201-500 employees</option>
                            <option value="501-1,000 employees">501-1,000 employees</option>
                            <option value="1,001-5,000 employees">1,001-5,000 employees</option>
                            <option value="5,001-10,000 employees">5,001-10,000 employees</option>
                            <option value="10,001+ employees">10,001+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Website URL *</label>
                          <input type="text" [(ngModel)]="compWebsite" name="compWebsite" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Logo URL (Optional)</label>
                          <input type="url" [(ngModel)]="compLogoUrl" name="compLogoUrl" placeholder="https://example.com/logo.png" class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Logo Initials (Max 3) *</label>
                          <input type="text" maxlength="3" [(ngModel)]="compLogo" name="compLogo" required class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none uppercase font-semibold" />
                        </div>
                        <div>
                          <label class="text-[11px] font-bold text-gray-500 block mb-1">Brand Theme Color *</label>
                          <input type="color" [(ngModel)]="compLogoColor" name="compLogoColor" class="w-full h-9 p-0.5 border border-[#E0DFDC] rounded-lg focus:outline-none cursor-pointer" />
                        </div>
                      </div>

                      <div>
                        <label class="text-[11px] font-bold text-gray-500 block mb-1">About Company Overview *</label>
                        <textarea [(ngModel)]="compAbout" name="compAbout" required rows="5" class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-sans font-medium"></textarea>
                      </div>

                      <div class="flex items-center justify-between pt-4 border-t border-slate-100">
                        <p class="text-[10px] text-gray-400 leading-normal max-w-sm">
                          💾 Saving modifications will instantly broadcast a public update post in the platform social feed.
                        </p>
                        <button type="submit" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors border-0 cursor-pointer shadow-sm">
                          Save Details & Broadcast Update
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Publish Company Feed Update Card -->
                  <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6 space-y-4">
                    <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Publish Company Feed Update</h3>
                    <form (ngSubmit)="publishFeedUpdate()" class="space-y-4">
                      <div>
                        <label class="text-[11px] font-bold text-gray-500 block mb-1">Update Content *</label>
                        <textarea [(ngModel)]="feedContent" name="feedContent" required rows="3" placeholder="What's happening at your company?" class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-sans font-medium"></textarea>
                      </div>
                      <div>
                        <label class="text-[11px] font-bold text-gray-500 block mb-1">Media Image URL (Optional)</label>
                        <input type="url" [(ngModel)]="feedImageUrl" name="feedImageUrl" placeholder="https://example.com/image.png" class="w-full border border-[#E0DFDC] rounded-lg px-3.5 py-2 text-sm focus:border-[#0A66C2] focus:outline-none font-medium" />
                      </div>
                      <div class="flex justify-end">
                        <button type="submit" class="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-colors border-0 cursor-pointer shadow-sm">
                          Publish Feed Update
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <!-- Right Card: Live Preview Card -->
                @if (myCompany(); as co) {
                  <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden space-y-4 pb-4">
                    <div class="h-20 w-full" [style.background]="co.coverColor || 'linear-gradient(135deg, #0A66C2, #004182)'"></div>
                    <div class="px-5 -mt-10 flex flex-col items-center text-center">
                      <div class="w-16 h-16 rounded border-2 border-white flex items-center justify-center font-bold text-white text-2xl uppercase shadow-md shrink-0 bg-white overflow-hidden animate-in fade-in duration-200">
                        @if (co.logoUrl) {
                          <img [src]="co.logoUrl" alt="Logo" class="w-full h-full object-cover" />
                        } @else {
                          <div class="w-full h-full flex items-center justify-center" [style.backgroundColor]="co.logoColor">
                            {{ co.logo }}
                          </div>
                        }
                      </div>
                      <h4 class="font-bold text-slate-900 text-base mt-2">{{ co.name }}</h4>
                      <p class="text-xs text-gray-600 italic mt-0.5">"{{ co.tagline }}"</p>
                      <p class="text-[10px] text-gray-400 mt-2 font-medium">Headquarters: {{ co.headquarters }}</p>
                    </div>
                    <hr class="border-[#E0DFDC]" />
                    <div class="px-5 space-y-3">
                      <p class="text-[10px] text-gray-400 font-bold uppercase">Corporate overview</p>
                      <p class="text-xs text-gray-650 leading-relaxed font-sans">{{ co.about }}</p>
                      
                      <p class="text-[10px] text-gray-400 font-bold uppercase pt-2">Details</p>
                      <div class="space-y-1.5 text-xs text-gray-700 font-semibold">
                        <p><span class="text-gray-500 font-normal">Industry:</span> {{ co.industry }}</p>
                        <p><span class="text-gray-500 font-normal">Scale Size:</span> {{ co.size }}</p>
                        <p><span class="text-gray-500 font-normal">Website:</span> <a href="#" class="text-[#0a66c2] hover:underline font-mono">{{ co.website }}</a></p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- B. JOB POSTINGS CENTER TAB -->
            @if (activeSection() === 'jobs') {
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start animate-in fade-in duration-200">
                
                <!-- Left: Posted Jobs List -->
                <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6 space-y-5">
                  <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Your Posted Job Openings</h3>

                  <div class="divide-y divide-[#E0DFDC]">
                    @if (myJobs().length === 0) {
                      <div class="p-8 text-center text-gray-400 italic text-xs">
                        You haven't posted any jobs yet. Complete the creation form to submission.
                      </div>
                    } @else {
                      @for (job of myJobs(); track job.id) {
                        <div class="py-4 first:pt-0 last:pb-0 space-y-3">
                          <div class="flex items-start justify-between gap-3">
                            <div>
                              <h4 class="font-bold text-slate-900 text-sm hover:underline cursor-pointer">{{ job.title }}</h4>
                              <p class="text-xs text-gray-650 mt-0.5">{{ job.company }} &bull; {{ job.location }}</p>
                            </div>
                            
                            <!-- Dynamic Status Pill -->
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                              [class.bg-green-50]="job.status === 'approved'"
                              [class.border-green-200]="job.status === 'approved'"
                              [class.text-green-800]="job.status === 'approved'"
                              [class.bg-amber-50]="job.status === 'pending'"
                              [class.border-amber-200]="job.status === 'pending'"
                              [class.text-amber-800]="job.status === 'pending'"
                              [class.bg-red-50]="job.status === 'rejected'"
                              [class.border-red-200]="job.status === 'rejected'"
                              [class.text-red-800]="job.status === 'rejected'"
                            >
                              {{ job.status === 'approved' ? 'Live' : (job.status === 'pending' ? 'Pending Approval' : 'Rejected') }}
                            </span>
                          </div>

                          <p class="text-xs text-gray-500 font-sans leading-relaxed line-clamp-2">{{ job.description }}</p>

                          <div class="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-semibold">
                            <span>Workplace: {{ job.workplaceType }}</span>
                            <span>&bull;</span>
                            <span>Type: {{ job.type }}</span>
                            @if (job.salary) {
                              <span>&bull;</span>
                              <span class="text-green-800">{{ job.salary }}</span>
                            }
                            <span>&bull;</span>
                            <span>Posted {{ formatTime(job.postedAt) }}</span>
                            <span>&bull;</span>
                            <button
                              type="button"
                              (click)="viewApplicants(job)"
                              class="text-[#0A66C2] bg-blue-50 hover:bg-blue-100 font-bold px-2 py-0.5 rounded border border-blue-200 cursor-pointer text-[10px] focus:outline-none transition-all"
                            >
                              View Applicants ({{ job.applicantsCount || 0 }})
                            </button>
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>

                <!-- Right: Post Job Form -->
                <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6 space-y-4">
                  <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Create New Job Opening</h3>
                  
                  <form (ngSubmit)="submitPostJob()" class="space-y-3">
                    <div>
                      <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Job Title *</label>
                      <input type="text" [(ngModel)]="jobTitle" name="jTitle" required placeholder="e.g. Senior Software Engineer" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Location *</label>
                        <input type="text" [(ngModel)]="jobLocation" name="jLoc" required placeholder="e.g. Kochi, Kerala" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                      </div>
                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Logo Initials *</label>
                        <input type="text" maxlength="2" [(ngModel)]="jobLogo" name="jLogo" required placeholder="e.g. NG" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none uppercase font-semibold" />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Workplace Type *</label>
                        <select [(ngModel)]="jobWorkplace" name="jWork" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none bg-white font-medium">
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Employment Type *</label>
                        <select [(ngModel)]="jobType" name="jType" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none bg-white font-medium">
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Salary Offer</label>
                      <input type="text" [(ngModel)]="jobSalary" name="jSal" placeholder="e.g. ₹6,00,000 - ₹9,00,000 / yr" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                    </div>

                    <div>
                      <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Job Description *</label>
                      <textarea [(ngModel)]="jobDesc" name="jDesc" required rows="4" placeholder="Scope of work, requirements, qualifications..." class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-sans font-medium"></textarea>
                    </div>

                    <div class="pt-2">
                      <button type="submit" [disabled]="!jobTitle || !jobLocation || !jobDesc || !jobLogo" class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition-colors border-0 cursor-pointer shadow-sm">
                        Submit Job Posting
                      </button>
                      <p class="text-[9px] text-gray-400 text-center mt-1.5 font-semibold">Submitted jobs enter verification review queue before publishing.</p>
                    </div>
                  </form>
                </div>

              </div>
            }

            <!-- C. PROMOTED AD CAMPAIGNS TAB -->
            @if (activeSection() === 'ads') {
              <div class="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start animate-in fade-in duration-200">
                
                <!-- Left: Campaign List -->
                <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6 space-y-5">
                  <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Your Advertising Campaigns</h3>

                  <div class="divide-y divide-[#E0DFDC]">
                    @if (myAds().length === 0) {
                      <div class="p-8 text-center text-gray-400 italic text-xs">
                        No active or requested campaigns found. Complete the promoted wizard to begin.
                      </div>
                    } @else {
                      @for (ad of myAds(); track ad.id) {
                        <div class="py-4 flex flex-col md:flex-row gap-6 items-center justify-between first:pt-0 last:pb-0">
                          
                          <!-- Info -->
                          <div class="flex-1 space-y-2 text-xs">
                            <h4 class="font-bold text-slate-900 text-sm">{{ ad.title }}</h4>
                            <p class="text-gray-650 leading-relaxed font-sans line-clamp-2 font-medium">{{ ad.description }}</p>
                            
                            <div class="flex items-center gap-2 flex-wrap font-semibold">
                              <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                                [class.bg-green-50]="ad.status === 'approved'"
                                [class.border-green-200]="ad.status === 'approved'"
                                [class.text-green-800]="ad.status === 'approved'"
                                [class.bg-amber-50]="ad.status === 'pending'"
                                [class.border-amber-200]="ad.status === 'pending'"
                                [class.text-amber-800]="ad.status === 'pending'"
                                [class.bg-red-50]="ad.status === 'rejected'"
                                [class.border-red-200]="ad.status === 'rejected'"
                                [class.text-red-800]="ad.status === 'rejected'"
                              >
                                {{ ad.status === 'approved' ? 'Active & Live' : (ad.status === 'pending' ? 'Pending Moderation' : 'Rejected') }}
                              </span>

                              <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                                [class.bg-green-50]="ad.paymentStatus === 'paid'"
                                [class.border-green-200]="ad.paymentStatus === 'paid'"
                                [class.text-green-800]="ad.paymentStatus === 'paid'"
                                [class.bg-amber-50]="ad.paymentStatus === 'pending'"
                                [class.border-amber-200]="ad.paymentStatus === 'pending'"
                                [class.text-amber-800]="ad.paymentStatus === 'pending'"
                              >
                                {{ ad.paymentStatus === 'paid' ? '💳 Paid' : '⏳ Payment Required' }}
                              </span>

                              @if (ad.paymentStatus === 'pending') {
                                <button
                                  (click)="launchPaymentFlow(ad.id)"
                                  class="bg-[#0A66C2] hover:bg-[#004182] text-white text-[9px] font-bold px-2.5 py-0.5 rounded transition-colors border-0 cursor-pointer shadow-xs scale-95"
                                >
                                  Complete Payment
                                </button>
                              }
                            </div>

                            @if (ad.transactionId) {
                              <p class="text-[9px] text-gray-400 font-semibold font-mono">
                                Txn: {{ ad.transactionId }} (Card: *{{ ad.cardLast4 }})
                              </p>
                            }
                          </div>

                          <!-- Preview Banner -->
                          <div class="w-full max-w-[200px] border border-[#E0DFDC] rounded-lg p-3 text-center space-y-1.5 shrink-0 bg-slate-50/50 scale-95 font-sans">
                            <div class="flex items-center justify-between text-[7px] text-gray-400 font-bold uppercase">
                              <span>Ad Preview</span>
                            </div>
                            <div class="w-8 h-8 text-white rounded font-black flex items-center justify-center mx-auto text-[10px] shadow-sm uppercase bg-[#0A66C2]" [style.backgroundColor]="ad.logoColor">
                              {{ ad.logoText }}
                            </div>
                            <h5 class="font-bold text-slate-800 text-[9px] leading-tight">{{ ad.title }}</h5>
                            <p class="text-[8px] text-gray-500 line-clamp-1 leading-normal font-medium">{{ ad.description }}</p>
                            <button type="button" class="w-full text-[8px] font-bold py-0.5 rounded-full border border-[#0A66C2] text-[#0A66C2] bg-white">
                              {{ ad.ctaText }}
                            </button>
                          </div>

                        </div>
                      }
                    }
                  </div>
                </div>

                <!-- Right: Ad Creation & Payment Wizard -->
                <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm p-6">
                  <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Promoted Ad Campaign Wizard</h3>
                  
                  <!-- WIZARD STEP 1: Details -->
                  @if (adWizardStep() === 1) {
                    <div class="space-y-3 mt-3 animate-in fade-in duration-200">
                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Campaign Headline Title *</label>
                        <input type="text" [(ngModel)]="adTitle" name="aTitle" required placeholder="e.g. Master React in 30 Days" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Brand/Company *</label>
                          <input type="text" [(ngModel)]="adBrand" name="aBrand" required placeholder="e.g. NeST Academy" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Logo Initials (Max 4) *</label>
                          <input type="text" maxlength="4" [(ngModel)]="adLogoText" name="aLogo" required placeholder="e.g. NEST" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none uppercase font-semibold" />
                        </div>
                      </div>

                      <div>
                        <label class="text-[10px] font-bold text-gray-500 block mb-0.5">Campaign Description *</label>
                        <input type="text" [(ngModel)]="adDesc" name="aDesc" required placeholder="e.g. Accelerate your career growth with certification." class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="text-[10px] font-bold text-gray-500 block mb-0.5">CTA Button Label *</label>
                          <input type="text" [(ngModel)]="adCtaText" name="aCtaText" required placeholder="e.g. Learn More" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                        <div>
                          <label class="text-[10px] font-bold text-gray-500 block mb-0.5">CTA Link URL *</label>
                          <input type="url" [(ngModel)]="adCtaUrl" name="aCtaUrl" required placeholder="e.g. https://yoursite.com" class="w-full border border-[#E0DFDC] rounded-lg px-3 py-1.5 text-xs focus:border-[#0A66C2] focus:outline-none font-medium" />
                        </div>
                      </div>

                      <div class="pt-3">
                        <button
                          type="button"
                          (click)="submitWizardStep1()"
                          [disabled]="!adTitle || !adBrand || !adLogoText || !adDesc || !adCtaText || !adCtaUrl"
                          class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 rounded-lg transition-colors border-0 cursor-pointer shadow-sm"
                        >
                          Proceed to Invoice & Checkout →
                        </button>
                      </div>
                    </div>
                  }

                  <!-- WIZARD STEP 2: Checkout Payment Simulator -->
                  @if (adWizardStep() === 2) {
                    <div class="space-y-4 mt-3 animate-in fade-in duration-200">
                      
                      <!-- Invoice receipt preview -->
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1.5 text-[#0A66C2] font-semibold">
                        <p class="font-bold border-b border-blue-200 pb-1 uppercase tracking-wider text-[10px]">Campaign Invoice Receipt</p>
                        <p class="flex justify-between font-bold"><span>Campaign Service:</span> <span>Promoted Ad Feed Placements</span></p>
                        <p class="flex justify-between"><span>Placement Target:</span> <span>SaaS candidates in Kerala</span></p>
                        <p class="flex justify-between border-t border-dashed border-blue-300 pt-1.5 text-sm font-extrabold">
                          <span>Total Billing Amount:</span> <span>₹24,900.00 ($299)</span>
                        </p>
                      </div>

                      <!-- Error panel if any -->
                      @if (checkoutError()) {
                        <p class="text-[10px] font-bold text-red-500 leading-normal">{{ checkoutError() }}</p>
                      }

                      <!-- Actions -->
                      <div class="flex flex-col gap-3 pt-2">
                        <button
                          type="button"
                          (click)="payCampaignWithRazorpay()"
                          class="w-full bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold py-2.5 rounded-lg transition-colors border-0 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          💳 Pay with Razorpay
                        </button>
                        <button type="button" (click)="adWizardStep.set(1)" class="w-full bg-transparent border border-[#E0DFDC] hover:bg-slate-50 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  }

                </div>
              </div>
            }

            <!-- D. ANALYTICS & BILLING TAB -->
            @if (activeSection() === 'billing') {
              <div class="space-y-6 animate-in fade-in duration-200">
                
                <!-- Graphic Metrics Row -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  
                  <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Job Applicants Count</span>
                      <span class="text-3xl font-extrabold text-slate-900 block mt-1">24</span>
                      <span class="text-[10px] text-green-600 font-semibold block mt-1">Across all live job openings</span>
                    </div>
                    <div class="text-4xl text-slate-100 font-black">📈</div>
                  </div>

                  <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Ad Placement CTR</span>
                      <span class="text-3xl font-extrabold text-slate-900 block mt-1">3.4%</span>
                      <span class="text-[10px] text-green-600 font-semibold block mt-1">Average campaign click-through rate</span>
                    </div>
                    <div class="text-4xl text-slate-100 font-black">📢</div>
                  </div>

                  <div class="bg-white rounded-xl border border-[#E0DFDC] p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider block">Billing Expenditures</span>
                      <span class="text-3xl font-extrabold text-slate-900 block mt-1">₹{{ getMyPaidAdExpenses() }}</span>
                      <span class="text-[10px] text-gray-500 font-medium block mt-1">Promoted campaigns billing logs</span>
                    </div>
                    <div class="text-4xl text-slate-100 font-black">💳</div>
                  </div>

                </div>

                <!-- Billing Invoices Table -->
                <div class="bg-white rounded-xl border border-[#E0DFDC] shadow-sm overflow-hidden">
                  <div class="p-6 border-b border-[#E0DFDC] bg-gray-50">
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Billing Logs & Receipts</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-slate-50 border-b border-[#E0DFDC] text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                          <th class="px-6 py-4">Transaction ID</th>
                          <th class="px-6 py-4">Campaign Name</th>
                          <th class="px-6 py-4">Payment Method</th>
                          <th class="px-6 py-4">Amount</th>
                          <th class="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-150 text-xs">
                        @if (myPaidAds().length === 0) {
                          <tr>
                            <td colspan="5" class="p-8 text-center text-gray-500 italic">No paid transactions on file.</td>
                          </tr>
                        } @else {
                          @for (ad of myPaidAds(); track ad.id) {
                            <tr class="hover:bg-[#EEF3F8]/30">
                              <td class="px-6 py-4 font-mono font-bold text-slate-800">{{ ad.transactionId }}</td>
                              <td class="px-6 py-4 font-semibold text-slate-900">{{ ad.title }}</td>
                              <td class="px-6 py-4 text-gray-500">Credit Card (*{{ ad.cardLast4 }})</td>
                              <td class="px-6 py-4 font-bold text-emerald-800 font-sans">₹{{ ad.paymentAmount?.toLocaleString() || '24,900' }}</td>
                              <td class="px-6 py-4">
                                <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase bg-green-50 border-green-200 text-green-800">
                                  Paid ✓
                                </span>
                              </td>
                            </tr>
                          }
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            }

            <!-- APPLICANTS LIST MODAL -->
            @if (selectedJobForApplicants(); as job) {
              <div class="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" (click)="selectedJobForApplicants.set(null)">
                <div class="bg-white h-full w-full max-w-[500px] p-6 shadow-2xl overflow-y-auto space-y-6 relative flex flex-col" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-between border-b border-gray-150 pb-4">
                    <div>
                      <h3 class="text-lg font-bold text-slate-900">{{ job.title }}</h3>
                      <p class="text-xs text-gray-500">Reviewing candidates for this position</p>
                    </div>
                    <button (click)="selectedJobForApplicants.set(null)" class="text-gray-400 hover:text-gray-650 p-1 border-0 bg-transparent cursor-pointer">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>

                  <div class="flex-1 overflow-y-auto space-y-4 pr-1">
                    @if (jobApplicants().length === 0) {
                      <div class="text-center py-12 text-gray-400 italic text-sm">
                        No candidates have applied to this position yet.
                      </div>
                    } @else {
                      @for (app of jobApplicants(); track app.id) {
                        <div class="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50/50">
                          <div class="flex items-start justify-between">
                            <div>
                              <h4 class="font-bold text-slate-900 text-sm">{{ app.applicantName }}</h4>
                              <p class="text-xs text-[#0A66C2] font-semibold mt-0.5">Applied {{ formatTime(app.appliedAt) }}</p>
                            </div>
                            
                            <!-- Status indicator -->
                            <span class="text-[9px] font-bold px-2 py-0.5 rounded border uppercase"
                              [class.bg-green-50]="app.status === 3"
                              [class.border-green-200]="app.status === 3"
                              [class.text-green-800]="app.status === 3"
                              [class.bg-red-50]="app.status === 4"
                              [class.border-red-200]="app.status === 4"
                              [class.text-red-800]="app.status === 4"
                              [class.bg-blue-50]="app.status !== 3 && app.status !== 4"
                              [class.border-blue-200]="app.status !== 3 && app.status !== 4"
                              [class.text-blue-800]="app.status !== 3 && app.status !== 4"
                            >
                              {{ app.status === 3 ? 'Shortlisted' : (app.status === 4 ? 'Rejected' : 'Applied') }}
                            </span>
                          </div>

                          <div class="space-y-1">
                            <p class="text-xs text-gray-550 font-bold uppercase">Cover Letter / Message</p>
                            <p class="text-xs text-gray-700 bg-white border border-gray-150 rounded-lg p-2.5 leading-relaxed italic">
                              "{{ app.coverLetter || 'No cover letter provided.' }}"
                            </p>
                          </div>

                          <div class="flex items-center justify-between text-xs pt-1.5 border-t border-gray-150">
                            <span class="text-[#0A66C2] font-semibold flex items-center gap-1">
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                              {{ app.resumeUrl || 'resume.pdf' }}
                            </span>

                            @if (app.status !== 3 && app.status !== 4) {
                              <div class="flex items-center gap-2">
                                <button
                                  (click)="updateStatus(app.id, 4)"
                                  class="bg-red-650 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer text-xs"
                                >
                                  Reject
                                </button>
                                <button
                                  (click)="updateStatus(app.id, 3)"
                                  class="bg-green-650 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg border-0 cursor-pointer text-xs"
                                >
                                  Shortlist
                                </button>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
            }

          </div>
        </main>
      }

    </div>
  `
})
export class BusinessDashboardComponent {
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);

  readonly currentUser = this.stateService.currentUser;
  readonly companies = this.stateService.companies;
  readonly jobs = this.stateService.jobs;
  readonly ads = this.stateService.ads;

  activeSection = signal<'company' | 'jobs' | 'ads' | 'billing'>('company');

  // Compute Company profile mapped to the business account
  myCompany = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return this.companies().find(c => c.employeeIds.includes(user.id)) ?? null;
  });

  // Filter Jobs/Ads belonging to this Business Owner
  myJobs = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.jobs().filter(j => j.postedById === user.id);
  });
  myAds = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.ads().filter(a => a.postedById === user.id);
  });

  myPaidAds = computed(() => this.myAds().filter(a => a.paymentStatus === 'paid'));

  // Company Profile form fields
  compName = '';
  compTagline = '';
  compIndustry = '';
  compHeadquarters = '';
  compSize = '1-10 employees';
  compWebsite = '';
  compLogo = '';
  compLogoColor = '#057642';
  compLogoUrl = '';
  compAbout = '';

  feedContent = '';
  feedImageUrl = '';

  // Job form fields
  jobTitle = '';
  jobLocation = '';
  jobLogo = '';
  jobWorkplace = 'On-site';
  jobType = 'Full-time';
  jobSalary = '';
  jobDesc = '';

  // Ad form fields
  adTitle = '';
  adBrand = '';
  adLogoText = '';
  adDesc = '';
  adCtaText = 'Learn More';
  adCtaUrl = '';

  // Ad Wizard Steps & Checkout fields
  adWizardStep = signal<1 | 2>(1);
  checkoutCardholder = '';
  checkoutCardNum = '';
  checkoutExp = '';
  checkoutCvv = '';
  checkoutError = signal('');
  activeCheckoutAdId = signal<string | null>(null);

  selectedJobForApplicants = signal<Job | null>(null);
  jobApplicants = signal<any[]>([]);

  constructor() {
    effect(() => {
      const co = this.myCompany();
      if (co) {
        this.compName = co.name;
        this.compTagline = co.tagline;
        this.compIndustry = co.industry;
        this.compHeadquarters = co.headquarters;
        this.compSize = co.size;
        this.compWebsite = co.website;
        this.compLogo = co.logo;
        this.compLogoColor = co.logoColor;
        this.compLogoUrl = co.logoUrl || '';
        this.compAbout = co.about;
      }
    }, { allowSignalWrites: true });
  }

  getSectionTitle() {
    switch (this.activeSection()) {
      case 'company': return 'Edit Company Profile';
      case 'jobs': return 'Job Openings Portal';
      case 'ads': return 'Promoted Advertising Center';
      case 'billing': return 'Analytics & Billing Invoices';
    }
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  getMyPaidAdExpenses() {
    const paidAds = this.myPaidAds();
    const sum = paidAds.reduce((acc, ad) => acc + (ad.paymentAmount || 24900), 0);
    return sum.toLocaleString();
  }

  saveCompanyProfile() {
    const co = this.myCompany();
    const companyData = {
      name: this.compName,
      tagline: this.compTagline,
      industry: this.compIndustry,
      headquarters: this.compHeadquarters,
      size: this.compSize,
      website: this.compWebsite,
      logo: this.compLogo ? this.compLogo.toUpperCase() : 'C',
      logoColor: this.compLogoColor,
      logoUrl: this.compLogoUrl,
      about: this.compAbout
    };

    if (co) {
      this.stateService.updateCompanyDetails(co.id, companyData);
      alert('Company details updated successfully, public notice broadcasted!');
    } else {
      this.stateService.createCompany(companyData);
      alert('Company profile created successfully!');
    }
  }

  publishFeedUpdate() {
    const co = this.myCompany();
    if (!co) {
      alert('Please save your company profile details first before publishing an update.');
      return;
    }
    if (!this.feedContent.trim()) return;

    this.stateService.createCompanyPost(co.id, this.feedContent, this.feedImageUrl);
    alert('Company feed update published successfully!');
    this.feedContent = '';
    this.feedImageUrl = '';
  }

  submitPostJob() {
    const user = this.currentUser();
    const co = this.myCompany();
    if (user) {
      this.stateService.postJobByBusiness({
        title: this.jobTitle,
        company: co ? co.name : 'Our Company',
        location: this.jobLocation,
        workplaceType: this.jobWorkplace,
        type: this.jobType,
        salary: this.jobSalary,
        description: this.jobDesc,
        logo: this.jobLogo.toUpperCase(),
        companyId: co ? co.id : 'co4',
        easyApply: true
      });

      alert('Job submission requested! Awaiting admin vetting approval.');
      this.jobTitle = '';
      this.jobLocation = '';
      this.jobLogo = '';
      this.jobSalary = '';
      this.jobDesc = '';
    }
  }

  submitWizardStep1() {
    // Submit ad in pending payment status
    const adId = this.stateService.requestAd({
      title: this.adTitle,
      companyName: this.adBrand,
      description: this.adDesc,
      logoText: this.adLogoText.toUpperCase(),
      logoColor: '#057642',
      coverColor: 'linear-gradient(135deg, #057642, #000)',
      ctaText: this.adCtaText,
      ctaUrl: this.adCtaUrl
    });

    if (adId) {
      this.activeCheckoutAdId.set(adId);
      this.adWizardStep.set(2);
      this.checkoutError.set('');
    }
  }

  launchPaymentFlow(adId: string) {
    this.activeCheckoutAdId.set(adId);
    this.adWizardStep.set(2);
    this.checkoutError.set('');
    this.activeSection.set('ads');
  }

  submitPaymentCheckout() {
    // Deprecated in favor of Razorpay
  }

  payCampaignWithRazorpay() {
    const adId = this.activeCheckoutAdId();
    if (!adId) return;

    this.checkoutError.set('');
    this.stateService.payWithRazorpay(
      adId,
      24900,
      (txnId) => {
        alert(`💳 Razorpay Payment Successful! Transaction ID: ${txnId}. Campaign entered admin moderation review.`);
        this.adWizardStep.set(1);
        this.adTitle = '';
        this.adBrand = '';
        this.adLogoText = '';
        this.adDesc = '';
        this.adCtaUrl = '';
        this.activeCheckoutAdId.set(null);
      },
      (error) => {
        this.checkoutError.set(error);
      }
    );
  }

  viewApplicants(job: Job) {
    this.selectedJobForApplicants.set(job);
    this.stateService.getApplicationsForJob(job.id).then(apps => {
      this.jobApplicants.set(apps);
    });
  }

  updateStatus(appId: string, statusNum: number) {
    this.stateService.updateApplicationStatus(appId, statusNum).then(() => {
      const job = this.selectedJobForApplicants();
      if (job) {
        this.stateService.getApplicationsForJob(job.id).then(apps => {
          this.jobApplicants.set(apps);
        });
      }
    });
  }

  signOut() {
    this.stateService.logout();
    this.router.navigate(['/login']);
  }
}
