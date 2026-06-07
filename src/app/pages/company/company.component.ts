import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { Company, User, Job, Post } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[900px] mx-auto px-4 py-4 mt-14">
      @if (company(); as comp) {
        <!-- Cover + Logo Header -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden mb-3">
          <div class="h-32 w-full" [style.background]="comp.coverColor"></div>
          <div class="px-6 pb-5 -mt-8">
            <div class="flex items-end justify-between">
              <!-- Logo -->
              <div
                class="w-20 h-20 rounded border-2 border-white flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 bg-white overflow-hidden"
              >
                @if (comp.logoUrl) {
                  <img [src]="comp.logoUrl" alt="Logo" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center" [style.backgroundColor]="comp.logoColor">
                    {{ comp.logo }}
                  </div>
                }
              </div>
              <div class="flex gap-2 mb-1">
                <button
                  (click)="handleFollow(comp.id)"
                  [attr.data-testid]="'button-follow-company'"
                  [class]="isFollowing(comp.id) ? 'border-gray-400 text-gray-700 hover:bg-gray-50' : 'border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50'"
                  class="text-sm font-semibold rounded-full px-4 py-1.5 border transition-colors focus:outline-none"
                >
                  {{ isFollowing(comp.id) ? 'Following' : '+ Follow' }}
                </button>
                <a
                  [href]="'https://' + comp.website"
                  target="_blank"
                  rel="noreferrer"
                  class="flex items-center gap-1 text-sm font-semibold text-gray-700 border border-gray-300 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  <!-- ExternalLink icon SVG -->
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  Website
                </a>
              </div>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 mt-3">{{ comp.name }}</h1>
            <p class="text-sm text-gray-600 mt-0.5">{{ comp.tagline }}</p>
            <div class="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <!-- Users icon -->
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                {{ formatFollowers(comp.followers + (isFollowing(comp.id) ? 1 : 0)) }} followers
              </span>
              <span class="flex items-center gap-1">
                <!-- MapPin icon -->
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                {{ comp.headquarters }}
              </span>
              <span class="flex items-center gap-1">
                <!-- Briefcase icon -->
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                {{ comp.size }}
              </span>
              <span class="flex items-center gap-1">
                <!-- Globe icon -->
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                {{ comp.industry }}
              </span>
            </div>
          </div>

          <!-- Tabs selectors -->
          <div class="flex border-t border-gray-200 px-4">
            @for (t of ['home', 'about', 'jobs', 'people']; track t) {
              <button
                (click)="activeTab.set(t)"
                [class.border-[#0A66C2]]="activeTab() === t"
                [class.text-[#0A66C2]]="activeTab() === t"
                class="px-4 py-3 text-sm font-semibold capitalize border-b-2 border-transparent transition-colors hover:text-gray-900 focus:outline-none"
              >
                @if (t === 'jobs') { Jobs ({{ companyJobs().length }}) }
                @else if (t === 'people') { People ({{ employees().length }}) }
                @else { {{ t }} }
              </button>
            }
          </div>
        </div>

        <!-- Tab content panels -->
        <div>
          <!-- HOME TAB -->
          @if (activeTab() === 'home') {
            <div class="space-y-3">
              @if (companyPosts().length === 0) {
                <div class="bg-white rounded-lg border border-[#E0DFDC] p-8 text-center text-gray-500 text-sm">No recent posts from {{ comp.name }}.</div>
              } @else {
                @for (post of companyPosts(); track post.id) {
                  @let author = getAuthor(post.authorId);
                  <div class="bg-white rounded-lg border border-[#E0DFDC] p-4">
                    <a [routerLink]="['/profile', author?.id]" class="flex items-center gap-2 group mb-3">
                      <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" [style.backgroundColor]="author?.avatarColor || '#0A66C2'">
                        {{ author?.avatarInitials }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-900 group-hover:text-[#0A66C2]">{{ author?.name }}</p>
                        <p class="text-xs text-gray-400">{{ formatTime(post.createdAt) }}</p>
                      </div>
                    </a>
                    <p class="text-sm text-gray-800 line-clamp-3">{{ post.content }}</p>
                    <p class="text-xs text-gray-400 mt-2">{{ post.likes.length }} likes · {{ post.comments.length }} comments</p>
                  </div>
                }
              }
            </div>
          }

          <!-- ABOUT TAB -->
          @if (activeTab() === 'about') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] p-6">
              <h2 class="text-base font-semibold text-gray-900 mb-3">About {{ comp.name }}</h2>
              <p class="text-sm text-gray-700 leading-relaxed mb-6">{{ comp.about }}</p>
              <div class="grid grid-cols-2 gap-4">
                @for (item of [
                  { label: 'Industry', value: comp.industry },
                  { label: 'Company size', value: comp.size },
                  { label: 'Headquarters', value: comp.headquarters },
                  { label: 'Website', value: comp.website }
                ]; track item.label) {
                  <div>
                    <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">{{ item.label }}</p>
                    <p class="text-sm text-gray-800 mt-0.5">{{ item.value }}</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- JOBS TAB -->
          @if (activeTab() === 'jobs') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] divide-y divide-gray-100">
              @if (companyJobs().length === 0) {
                <div class="p-8 text-center text-gray-500 text-sm">No open positions at {{ comp.name }} right now.</div>
              } @else {
                @for (job of companyJobs(); track job.id) {
                  <div class="p-4 flex items-start gap-4">
                    <!-- Briefcase icon -->
                    <svg class="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    <div class="flex-1">
                      <a routerLink="/jobs">
                        <p class="text-sm font-semibold text-gray-900 hover:text-[#0A66C2] cursor-pointer">{{ job.title }}</p>
                      </a>
                      <p class="text-xs text-gray-500">{{ job.location }} · {{ job.type }}</p>
                      <p class="text-xs text-gray-400 mt-0.5">{{ formatTime(job.postedAt) }}</p>
                    </div>
                    @if (job.easyApply) {
                      <span class="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-2 py-0.5 flex-shrink-0">Easy Apply</span>
                    }
                  </div>
                }
              }
            </div>
          }

          <!-- PEOPLE TAB -->
          @if (activeTab() === 'people') {
            <div class="bg-white rounded-lg border border-[#E0DFDC] divide-y divide-gray-100">
              @if (employees().length === 0) {
                <div class="p-8 text-center text-gray-500 text-sm">No employees listed.</div>
              } @else {
                @for (emp of employees(); track emp.id) {
                  <div class="p-4 flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" [style.backgroundColor]="emp.avatarColor">
                      {{ emp.avatarInitials }}
                    </div>
                    <div class="flex-1">
                      <a [routerLink]="['/profile', emp.id]">
                        <p class="text-sm font-semibold text-gray-900 hover:text-[#0A66C2] cursor-pointer">{{ emp.name }}</p>
                      </a>
                      <p class="text-xs text-gray-500">{{ emp.headline }}</p>
                    </div>
                    <a [routerLink]="['/profile', emp.id]">
                      <button class="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
                        View profile
                      </button>
                    </a>
                  </div>
                }
              }
            </div>
          }
        </div>
      } @else {
        <div class="max-w-[900px] mx-auto px-4 py-12 text-center bg-white rounded-lg border border-[#E0DFDC]">
          <p class="text-gray-500 text-lg">Company not found.</p>
          <a routerLink="/" class="text-[#0A66C2] hover:underline mt-2 inline-block">Go to Feed</a>
        </div>
      }
    </div>
  `
})
export class CompanyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(StateService);

  readonly companies = this.stateService.companies;
  readonly users = this.stateService.users;
  readonly posts = this.stateService.posts;
  readonly jobs = this.stateService.jobs;
  readonly currentUser = this.stateService.currentUser;

  companyId = signal<string | null>(null);
  activeTab = signal<string>('home');

  company = computed(() => {
    const id = this.companyId();
    return this.companies().find((c) => c.id === id) || null;
  });

  employees = computed(() => {
    const comp = this.company();
    if (!comp) return [];
    return this.users().filter((u) => comp.employeeIds.includes(u.id));
  });

  companyJobs = computed(() => {
    const comp = this.company();
    if (!comp) return [];
    return this.jobs().filter(
      (j) => j.companyId === comp.id || j.company.toLowerCase() === comp.name.toLowerCase()
    );
  });

  companyPosts = computed(() => {
    const emps = this.employees();
    return this.posts().filter((p) => emps.some((e) => e.id === p.authorId)).slice(0, 4);
  });

  constructor() {
    this.route.paramMap.subscribe((params) => {
      this.companyId.set(params.get('companyId'));
    });
  }

  isFollowing(compId: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    const comp = this.companies().find((c) => c.id === compId);
    return comp ? comp.employeeIds.includes(user.id + '_follow') : false;
  }

  handleFollow(compId: string) {
    this.stateService.followCompany(compId);
  }

  formatFollowers(n: number): string {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  }

  getAuthor(authorId: string) {
    return this.users().find((u) => u.id === authorId);
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }
}
