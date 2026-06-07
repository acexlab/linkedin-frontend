import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { User, Job, Post } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[800px] mx-auto px-4 py-4 mt-14">
      <div class="bg-white rounded-lg border border-[#E0DFDC] p-4 mb-4">
        <h1 class="text-lg font-semibold text-gray-900">Search results for "{{ query() }}"</h1>
        <p class="text-xs text-gray-500 mt-1">Showing matching People, Jobs, and Posts</p>
      </div>

      <!-- Tab selection buttons -->
      <div class="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg border-t border-x border-[#E0DFDC]">
        @for (tabOption of ['people', 'jobs', 'posts']; track tabOption) {
          <button
            (click)="activeTab.set(tabOption)"
            [class.border-[#0A66C2]]="activeTab() === tabOption"
            [class.text-[#0A66C2]]="activeTab() === tabOption"
            class="flex-1 py-3 text-sm font-semibold capitalize border-b-2 border-transparent transition-colors hover:text-[#0A66C2] focus:outline-none"
          >
            {{ tabOption }}
            @if (tabOption === 'people') { ({{ peopleResults().length }}) }
            @if (tabOption === 'jobs') { ({{ jobsResults().length }}) }
            @if (tabOption === 'posts') { ({{ postsResults().length }}) }
          </button>
        }
      </div>

      <!-- Tab content panels -->
      <div class="bg-white rounded-b-lg border-b border-x border-[#E0DFDC]">
        <!-- PEOPLE TAB -->
        @if (activeTab() === 'people') {
          @if (peopleResults().length === 0) {
            <div class="p-8 text-center text-gray-500 text-sm">No people match your query.</div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (user of peopleResults(); track user.id) {
                <div class="p-4 flex items-center gap-3">
                  <!-- Avatar -->
                  <div
                    class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    [style.backgroundColor]="user.avatarColor"
                  >
                    {{ user.avatarInitials }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <a [routerLink]="['/profile', user.id]" class="font-semibold text-sm text-gray-900 hover:text-[#0A66C2] hover:underline">{{ user.name }}</a>
                    <p class="text-xs text-gray-500 truncate mt-0.5">{{ user.headline }}</p>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ user.location }}</p>
                  </div>
                  <a [routerLink]="['/profile', user.id]">
                    <button class="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
                      View profile
                    </button>
                  </a>
                </div>
              }
            </div>
          }
        }

        <!-- JOBS TAB -->
        @if (activeTab() === 'jobs') {
          @if (jobsResults().length === 0) {
            <div class="p-8 text-center text-gray-500 text-sm">No jobs match your query.</div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (job of jobsResults(); track job.id) {
                <div class="p-4 flex items-start gap-3">
                  <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-bold text-lg text-gray-600 flex-shrink-0">
                    {{ job.logo }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <a routerLink="/jobs" class="font-semibold text-sm text-gray-900 hover:text-[#0A66C2] hover:underline">{{ job.title }}</a>
                    <p class="text-xs text-gray-700 mt-0.5">{{ job.company }} &bull; {{ job.location }}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">Posted {{ formatTime(job.postedAt) }}</p>
                  </div>
                  <a routerLink="/jobs">
                    <button class="text-xs font-semibold text-[#0A66C2] border border-[#0A66C2] rounded-full px-3 py-1 hover:bg-blue-50 transition-colors">
                      View job
                    </button>
                  </a>
                </div>
              }
            </div>
          }
        }

        <!-- POSTS TAB -->
        @if (activeTab() === 'posts') {
          @if (postsResults().length === 0) {
            <div class="p-8 text-center text-gray-500 text-sm">No posts match your query.</div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (post of postsResults(); track post.id) {
                @let author = getAuthor(post.authorId);
                <div class="p-4 space-y-2">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.backgroundColor]="author?.avatarColor || '#0A66C2'">
                      {{ author?.avatarInitials || '?' }}
                    </div>
                    <div>
                      <a [routerLink]="['/profile', author?.id]" class="text-xs font-semibold text-gray-900 hover:underline leading-tight block">{{ author?.name }}</a>
                      <span class="text-[10px] text-gray-400 block">{{ formatTime(post.createdAt) }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-800 line-clamp-3 leading-relaxed">{{ post.content }}</p>
                  <a routerLink="/" class="text-xs text-[#0A66C2] hover:underline mt-1 inline-block">View full post</a>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class SearchComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(StateService);

  readonly users = this.stateService.users;
  readonly jobs = this.stateService.jobs;
  readonly posts = this.stateService.posts;

  query = signal<string>('');
  activeTab = signal<string>('people');

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.query.set(params['q'] || '');
    });
  }

  peopleResults = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return [];
    return this.users().filter(
      (u) => u.name.toLowerCase().includes(q) || u.headline.toLowerCase().includes(q)
    );
  });

  jobsResults = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return [];
    return this.jobs().filter(
      (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    );
  });

  postsResults = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return [];
    return this.posts().filter((p) => p.content.toLowerCase().includes(q));
  });

  getAuthor(authorId: string) {
    return this.users().find((u) => u.id === authorId);
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }
}
