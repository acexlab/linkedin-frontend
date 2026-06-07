import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Course {
  title: string;
  initial: string;
  duration: string;
  category: string;
  readers: string;
  level: string;
  videoUrl: string;
  description: string;
}

@Component({
  selector: 'app-learning',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col font-sans text-gray-800">
      
      <!-- NAV BAR (MODIFIED) -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-2.5 shadow-sm">
        <div class="max-w-[1128px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <!-- Logo & Search -->
          <div class="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <span class="text-[#057642] font-black text-2xl tracking-tight flex items-center cursor-pointer flex-shrink-0" routerLink="/login">
              Linked<span class="bg-[#057642] text-white px-1 py-0.5 rounded ml-0.5 font-bold text-xl">in</span>
              <span class="text-gray-500 font-semibold text-sm tracking-wider uppercase ml-1.5 pt-1">Learning</span>
            </span>
            
            <form (ngSubmit)="handleSearch()" class="flex w-full sm:w-auto">
              <div class="relative flex items-center bg-gray-100 rounded border border-gray-300 w-full sm:w-[320px] md:w-[400px]">
                <button type="button" class="px-3 text-gray-500 border-r border-gray-300 text-xs font-semibold hover:bg-gray-200 h-full rounded-l transition-colors py-1.5">
                  Learning ▼
                </button>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  name="searchQuery"
                  placeholder="Search skills, subjects, or software"
                  class="bg-transparent px-3 py-1.5 text-xs w-full focus:outline-none"
                />
                <button type="submit" class="px-3 text-gray-500 hover:text-gray-900 focus:outline-none">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>
              </div>
            </form>
          </div>

          <!-- Nav Icons List (Hidden on Mobile) -->
          <nav class="hidden md:flex items-center gap-6 border-r border-gray-200 pr-6">
            <a
              routerLink="/top-content"
              routerLinkActive="text-gray-900 font-bold border-[#057642]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span class="text-xs">Top Content</span>
            </a>
            <a
              routerLink="/pub/dir"
              routerLinkActive="text-gray-900 font-bold border-[#057642]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span class="text-xs">People</span>
            </a>
            <a
              routerLink="/learning"
              routerLinkActive="text-gray-900 font-bold border-[#057642]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4 1.253"/></svg>
              <span class="text-xs">Learning</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span class="text-xs">Jobs</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
              <span class="text-xs">Games</span>
            </a>
            <a
              [routerLink]="['/login']"
              [queryParams]="{action: 'signin'}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              <span class="text-xs">Get the app</span>
            </a>
          </nav>

          <!-- Auth Links -->
          <div class="flex items-center gap-4 flex-shrink-0">
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signup'}"
              class="text-gray-600 hover:text-gray-900 font-semibold text-sm px-3 py-1.5 focus:outline-none"
            >
              Join now
            </button>
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signin'}"
              class="border border-[#057642] text-[#057642] hover:bg-green-50 font-semibold text-sm rounded-full px-4 py-1.5 transition-colors focus:outline-none"
            >
              Sign in
            </button>
          </div>

        </div>
      </header>

      <!-- SOLUTIONS BAR -->
      <div class="bg-white border-b border-gray-200 py-2 px-6">
        <div class="max-w-[1128px] mx-auto flex justify-end text-xs gap-3">
          <span class="text-gray-500">Solutions for:</span>
          <a routerLink="/login" class="text-[#0A66C2] hover:underline font-semibold">Business</a>
          <span class="text-gray-300">&bull;</span>
          <a routerLink="/login" class="text-[#0A66C2] hover:underline font-semibold">Higher Education</a>
          <span class="text-gray-300">&bull;</span>
          <a routerLink="/login" class="text-[#0A66C2] hover:underline font-semibold">Government</a>
          <span class="text-gray-300">&bull;</span>
          <a routerLink="/login" class="text-[#0A66C2] hover:underline font-semibold">Buy for my team</a>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="bg-white border-b border-gray-100 py-3 px-6 shadow-xs">
        <div class="max-w-[1128px] mx-auto flex flex-wrap gap-2 text-xs">
          <button (click)="handleFilter()" class="bg-[#057642] text-white font-semibold rounded-full px-4 py-1.5 transition-colors cursor-pointer">Best Match ▼</button>
          <button (click)="handleFilter()" class="border border-gray-300 hover:border-gray-500 text-gray-700 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">Level ▼</button>
          <button (click)="handleFilter()" class="border border-gray-300 hover:border-gray-500 text-gray-700 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">Type ▼</button>
          <button (click)="handleFilter()" class="border border-gray-300 hover:border-gray-500 text-gray-700 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">Time to complete ▼</button>
          <button (click)="handleFilter()" class="border border-gray-300 hover:border-gray-500 text-gray-700 rounded-full px-4 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer">Software ▼</button>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <main class="flex-grow max-w-[1128px] w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        
        <!-- Courses List -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-6">
          <h2 class="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Browse most popular courses
          </h2>

          <div class="divide-y divide-gray-100">
            @for (course of filteredCourses(); track course.title) {
              <div 
                (click)="selectCourse(course)"
                class="py-4 flex gap-4 hover:bg-gray-50/50 rounded px-2 transition-colors cursor-pointer group"
              >
                <!-- Thumbnail -->
                <div class="w-24 h-16 bg-[#057642] text-white rounded flex-shrink-0 flex items-center justify-center font-bold text-lg relative select-none">
                  {{ course.initial }}
                  <!-- Hover Play Overlay -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <span class="absolute bottom-1 right-1 bg-black/75 text-[10px] text-white px-1 rounded font-normal leading-tight">
                    {{ course.duration }}
                  </span>
                </div>

                <!-- Info -->
                <div class="flex-grow min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="bg-red-100 text-red-700 text-[9px] uppercase font-bold px-1 rounded">Video</span>
                    <h3 class="font-bold text-[#057642] hover:underline truncate text-sm">
                      {{ course.title }}
                    </h3>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">From: {{ course.category }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ course.readers }} viewers &bull; {{ course.level }}</p>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          
          <!-- Explore Topics Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-3">
            <h3 class="font-semibold text-gray-900 text-sm">Explore Topics</h3>
            <div class="flex flex-wrap gap-2">
              <button routerLink="/login" class="border border-gray-300 hover:border-gray-500 text-gray-700 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">Business</button>
              <button routerLink="/login" class="border border-gray-300 hover:border-gray-500 text-gray-700 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">Technology</button>
            </div>
          </div>

          <!-- Promo Card -->
          <div class="bg-white rounded-lg border border-gray-200 p-5 shadow-sm space-y-4">
            <p class="text-xs text-gray-600 leading-relaxed">
              Buy LinkedIn Learning for your business, higher education, or government team.
            </p>
            <button
              routerLink="/login"
              class="w-full bg-[#057642] hover:bg-[#03422a] text-white text-xs font-semibold rounded-full py-2.5 transition-colors focus:outline-none cursor-pointer text-center"
            >
              Buy for my team
            </button>
          </div>

        </div>

      </main>

      <!-- FOOTER -->
      <footer class="bg-white border-t border-gray-200 py-6 text-center">
        <p class="text-xs text-gray-500">
          LinkedIn Learning &copy; {{ currentYear }} · About · User Agreement · Privacy Policy · Cookie Policy
        </p>
      </footer>

      <!-- ================= VIDEO POPUP MODAL ================= -->
      @if (selectedCourse()) {
        <div 
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200" 
          (click)="closeVideo()"
        >
          <div 
            class="bg-white rounded-xl shadow-2xl w-full max-w-[800px] overflow-hidden relative flex flex-col" 
            (click)="$event.stopPropagation()"
          >
            <!-- Close Button -->
            <button 
              (click)="closeVideo()" 
              class="absolute top-3 right-3 text-white bg-black/60 hover:bg-black/90 rounded-full p-1.5 transition-colors focus:outline-none z-10"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Video Player Iframe -->
            <div class="aspect-video w-full bg-black relative">
              @if (safeVideoUrl()) {
                <iframe
                  [src]="safeVideoUrl()!"
                  class="w-full h-full"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              }
            </div>

            <!-- Course Detail Segment -->
            <div class="p-6 space-y-4">
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="bg-[#057642]/10 text-[#057642] text-[10px] uppercase font-extrabold px-2 py-0.5 rounded">
                    {{ selectedCourse()?.level }}
                  </span>
                  <span class="text-xs text-gray-500 font-semibold">{{ selectedCourse()?.category }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 leading-tight">
                  {{ selectedCourse()?.title }}
                </h3>
              </div>

              <p class="text-sm text-gray-600 leading-relaxed">
                {{ selectedCourse()?.description }}
              </p>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span>Duration: <strong class="text-gray-800">{{ selectedCourse()?.duration }}</strong></span>
                  <span>&bull;</span>
                  <span>Viewers: <strong class="text-gray-800">{{ selectedCourse()?.readers }}</strong></span>
                </div>

                <a
                  [routerLink]="['/login']"
                  [queryParams]="{action: 'signup'}"
                  (click)="closeVideo()"
                  class="bg-[#057642] hover:bg-[#03422a] text-white font-semibold text-xs rounded-full px-5 py-2.5 transition-colors cursor-pointer text-center"
                >
                  Join LinkedIn to save progress
                </a>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class LearningComponent {
  private readonly sanitizer = inject(DomSanitizer);

  searchQuery = '';
  currentYear = new Date().getFullYear();

  selectedCourse = signal<Course | null>(null);

  safeVideoUrl = computed(() => {
    const course = this.selectedCourse();
    if (!course) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(course.videoUrl);
  });

  courses: Course[] = [
    { 
      title: "Introduction to Angular Standalone Components", 
      initial: "NG", 
      duration: "40s", 
      category: "Angular Core Development", 
      readers: "145K", 
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/8-zIV7G9E4E",
      description: "Learn the fundamentals of Angular standalone components, how to boot an application without NgModules, and how to import common directives directly to build lighter weight, faster web applications."
    },
    { 
      title: "Sleek Modern Web Design with Tailwind CSS v4", 
      initial: "TW", 
      duration: "44s", 
      category: "Modern Frontend Styling", 
      readers: "230K", 
      level: "Intermediate",
      videoUrl: "https://www.youtube.com/embed/tS7upsfuxRY",
      description: "Dive into Tailwind CSS v4 features, including its CSS-first configuration system, lightning-fast compilation engine, dynamic utility generation, and native CSS custom properties integration."
    },
    { 
      title: "Signals State Management in Modern Frameworks", 
      initial: "SG", 
      duration: "12m", 
      category: "Framework Foundations", 
      readers: "85K", 
      level: "Advanced",
      videoUrl: "https://www.youtube.com/embed/38Z0eGZsnZ0",
      description: "Understand the reactive programming model of Angular Signals. Explore how writeable signals, read-only signals, computed formulas, and side-effecting effects interact to build performant UIs without zones."
    },
    { 
      title: "System Design & Distributed Pipelines at Scale", 
      initial: "SD", 
      duration: "1h 30m", 
      category: "Architecture & Infrastructure", 
      readers: "112K", 
      level: "Advanced",
      videoUrl: "https://www.youtube.com/embed/m8IOfR6G4xs",
      description: "A complete masterclass on system design fundamentals. Learn about load balancing, database scaling patterns (sharding, replication), caching tiers, and modeling real-time asynchronous message queues."
    },
    { 
      title: "Productivity Principles for Software Teams", 
      initial: "PP", 
      duration: "45m", 
      category: "Business Workflow", 
      readers: "90K", 
      level: "Beginner",
      videoUrl: "https://www.youtube.com/embed/502aP4_kGv4",
      description: "Agile, Scrum, and collaboration principles for high-performing software development teams. Learn how to structure sprints, run effective retro sessions, and remove delivery bottlenecks."
    }
  ];

  filteredCourses = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.courses;
    return this.courses.filter(c => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  });

  selectCourse(course: Course) {
    this.selectedCourse.set(course);
  }

  closeVideo() {
    this.selectedCourse.set(null);
  }

  handleSearch() {
    // Action is simulated, UI filters automatically via computer signal.
  }

  handleFilter() {
    // Simulated filter dropdown clicks
  }
}
