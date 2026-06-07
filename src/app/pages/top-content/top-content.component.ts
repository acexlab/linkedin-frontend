import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-content',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col font-sans text-gray-800">
      
      <!-- NAV BAR -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-2 shadow-sm">
        <div class="max-w-[1128px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <!-- Logo & Branding -->
          <div class="flex items-center gap-2 cursor-pointer flex-shrink-0" routerLink="/login">
            <span class="text-[#0A66C2] font-black text-2xl tracking-tight flex items-center">
              Linked<span class="bg-[#0A66C2] text-white px-1 py-0.5 rounded ml-0.5 font-bold text-xl">in</span>
            </span>
            <span class="text-gray-500 font-semibold text-sm tracking-wider uppercase ml-1.5 pt-1">Explore</span>
          </div>

          <!-- Nav Icons List (Hidden on Mobile) -->
          <nav class="hidden md:flex items-center gap-6 border-r border-gray-200 pr-6">
            <a
              routerLink="/top-content"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span class="text-xs">Top Content</span>
            </a>
            <a
              routerLink="/pub/dir"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
              [routerLinkActiveOptions]="{exact: true}"
              class="flex flex-col items-center pb-1 text-gray-500 hover:text-gray-900 transition-colors border-b-2 border-transparent cursor-pointer"
            >
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span class="text-xs">People</span>
            </a>
            <a
              routerLink="/learning"
              routerLinkActive="text-gray-900 font-bold border-[#0A66C2]"
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
          <div class="flex items-center gap-3 flex-shrink-0">
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signup'}"
              class="text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-semibold text-sm rounded-full px-4 py-1.5 transition-colors focus:outline-none cursor-pointer"
            >
              Join now
            </button>
            <button
              [routerLink]="['/login']" [queryParams]="{action: 'signin'}"
              class="border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 font-semibold text-sm rounded-full px-4 py-1.5 transition-colors focus:outline-none cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <!-- MAIN EXPLORER -->
      <main class="flex-grow max-w-[1128px] w-full mx-auto px-6 py-12 space-y-16">
        
        <!-- TOPIC EXPLORER -->
        <div class="text-center space-y-6">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900">
            What topics do you want to explore?
          </h1>
          
          <div class="flex flex-wrap justify-center gap-2.5 max-w-[850px] mx-auto">
            @for (topic of topics; track topic) {
              <button
                (click)="handleTopicClick(topic)"
                class="bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-semibold text-xs md:text-sm rounded-full px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {{ topic }}
              </button>
            }
          </div>
        </div>

        <!-- EDITOR'S PICKS -->
        <div class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Editor's Picks</h2>
            <p class="text-sm text-gray-500 mt-0.5">Handpicked ideas and insights from professionals</p>
          </div>

          <!-- Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            @for (card of picks; track card.title) {
              <div
                class="bg-white rounded-lg border border-gray-200 p-5 shadow-xs hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[180px] cursor-pointer"
                routerLink="/login"
              >
                <div>
                  <div class="flex justify-between items-start">
                    <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{{ card.category }}</span>
                    <span class="text-lg">{{ card.emoji }}</span>
                  </div>
                  <h3 class="font-semibold text-gray-900 text-sm md:text-base mt-3 hover:text-[#0A66C2] line-clamp-3">
                    {{ card.title }}
                  </h3>
                </div>
                <div class="text-xs text-gray-400 mt-4">
                  {{ card.likes }} likes
                </div>
              </div>
            }
          </div>
        </div>

      </main>

      <!-- FOOTER -->
      <footer class="bg-white border-t border-gray-200 py-6 text-center">
        <p class="text-xs text-gray-500">
          LinkedIn Explore &copy; {{ currentYear }} · About · User Agreement · Privacy Policy · Cookie Policy
        </p>
      </footer>

      <!-- MOCK NOTIFICATION OVERLAY -->
      @if (showToast()) {
        <div class="fixed bottom-6 right-6 bg-gray-900 text-white text-xs rounded-lg px-4 py-3 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>Topic "{{ activeTopic() }}" is simulated. Sign in to view full posts.</span>
          <button (click)="showToast.set(false)" class="text-gray-400 hover:text-white font-bold ml-1">&times;</button>
        </div>
      }

    </div>
  `
})
export class TopContentComponent {
  currentYear = new Date().getFullYear();

  showToast = signal(false);
  activeTopic = signal('');

  topics = [
    "🚀 Tips for Managing Stressors with Mental Toughness",
    "💬 How to Navigate Difficult Conversations for Personal Growth",
    "💡 Top Emerging AI Use Cases and Their Capabilities",
    "😊 How Leaders Foster Psychological Safety",
    "🚀 Tips for Curating a Professional Network",
    "🚀 Tips for Strategic Career Planning",
    "🚀 How to Find the Right Mentor for Your Career",
    "🚀 Tips for Optimizing Your LinkedIn Profile",
    "⏱ How to Set Priorities as a Leader"
  ];

  picks = [
    { category: "Career", emoji: "🚀", title: "Career Advancement Tips: How to stand out in a crowded market", likes: "954K" },
    { category: "Innovation", emoji: "💡", title: "Scaling AI Infrastructure: Behind the scenes of LLM orchestration", likes: "412K" },
    { category: "Leadership", emoji: "⏱", title: "Effective Delegation: Letting go to empower your engineering team", likes: "620K" },
    { category: "Training & Development", emoji: "📊", title: "Continuous Learning Cycles: Design patterns for modern engineers", likes: "128K" }
  ];

  handleTopicClick(topic: string) {
    this.activeTopic.set(topic);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 3000);
  }
}
