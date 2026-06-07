import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StateService } from '../../services/state.service';
import { Post, Job, User } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-[800px] mx-auto px-4 py-4 mt-14">
      <div class="bg-white rounded-lg border border-[#E0DFDC] p-4 mb-4 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-gray-900">Saved items</h1>
          <p class="text-xs text-gray-500 mt-1">Manage posts and jobs you have saved for later.</p>
        </div>
      </div>

      <!-- Tab selectors -->
      <div class="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg border-t border-x border-[#E0DFDC]">
        <button
          (click)="activeTab.set('posts')"
          [class.border-[#0A66C2]]="activeTab() === 'posts'"
          [class.text-[#0A66C2]]="activeTab() === 'posts'"
          class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent transition-colors hover:text-[#0A66C2] focus:outline-none"
        >
          Saved Posts ({{ savedPosts().length }})
        </button>
        <button
          (click)="activeTab.set('jobs')"
          [class.border-[#0A66C2]]="activeTab() === 'jobs'"
          [class.text-[#0A66C2]]="activeTab() === 'jobs'"
          class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent transition-colors hover:text-[#0A66C2] focus:outline-none"
        >
          Saved Jobs ({{ savedJobs().length }})
        </button>
      </div>

      <!-- Tab panels -->
      <div class="bg-white rounded-b-lg border-b border-x border-[#E0DFDC]">
        <!-- POSTS TAB -->
        @if (activeTab() === 'posts') {
          @if (savedPosts().length === 0) {
            <div class="p-8 text-center text-gray-500 text-sm">No saved posts. Bookmark posts from the home feed.</div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (post of savedPosts(); track post.id) {
                @let author = getAuthor(post.authorId);
                <div class="p-4 space-y-2 relative">
                  <!-- Unsave Action button -->
                  <button (click)="unsavePost(post.id)" title="Unsave" class="absolute top-4 right-4 p-1 rounded-full text-[#0A66C2] hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>

                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" [style.backgroundColor]="author?.avatarColor || '#0A66C2'">
                      {{ author?.avatarInitials || '?' }}
                    </div>
                    <div>
                      <a [routerLink]="['/profile', author?.id]" class="text-xs font-semibold text-gray-900 hover:underline leading-tight block">{{ author?.name }}</a>
                      <span class="text-[10px] text-gray-400 block">{{ formatTime(post.createdAt) }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-800 line-clamp-3 leading-relaxed pr-6">{{ post.content }}</p>
                  <a routerLink="/" class="text-xs text-[#0A66C2] hover:underline mt-1 inline-block">View full post</a>
                </div>
              }
            </div>
          }
        }

        <!-- JOBS TAB -->
        @if (activeTab() === 'jobs') {
          @if (savedJobs().length === 0) {
            <div class="p-8 text-center text-gray-500 text-sm">No saved jobs. Bookmark jobs from the jobs panel.</div>
          } @else {
            <div class="divide-y divide-gray-100">
              @for (job of savedJobs(); track job.id) {
                <div class="p-4 flex items-start gap-3 relative">
                  <!-- Unsave Action button -->
                  <button (click)="unsaveJob(job.id)" title="Unsave" class="absolute top-4 right-4 p-1 rounded-full text-[#0A66C2] hover:bg-gray-100">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>

                  <div class="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center font-bold text-lg text-gray-600 flex-shrink-0">
                    {{ job.logo }}
                  </div>
                  <div class="flex-1 min-w-0 pr-6">
                    <a routerLink="/jobs" class="font-semibold text-sm text-gray-900 hover:text-[#0A66C2] hover:underline">{{ job.title }}</a>
                    <p class="text-xs text-gray-700 mt-0.5">{{ job.company }} &bull; {{ job.location }}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">Posted {{ formatTime(job.postedAt) }}</p>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `
})
export class SavedComponent {
  private readonly stateService = inject(StateService);

  readonly currentUser = this.stateService.currentUser;
  readonly posts = this.stateService.posts;
  readonly jobs = this.stateService.jobs;
  readonly users = this.stateService.users;

  activeTab = signal<string>('posts');

  savedPosts = computed(() => {
    const list = this.currentUser()?.savedPosts || [];
    return this.posts().filter((p) => list.includes(p.id));
  });

  savedJobs = computed(() => {
    const list = this.currentUser()?.savedJobs || [];
    return this.jobs().filter((j) => list.includes(j.id));
  });

  getAuthor(authorId: string) {
    return this.users().find((u) => u.id === authorId);
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  unsavePost(postId: string) {
    this.stateService.savePost(postId);
  }

  unsaveJob(jobId: string) {
    this.stateService.saveJob(jobId);
  }
}
