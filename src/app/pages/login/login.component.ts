import { Component, inject, signal, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-white flex flex-col font-sans text-gray-800">
      
      <!-- HEADER NAV BAR -->
      <header class="bg-white border-b border-gray-100 sticky top-0 z-40 px-6 py-3 flex items-center justify-between max-w-[1128px] w-full mx-auto">
        <div class="flex items-center gap-2 cursor-pointer" routerLink="/login">
          <!-- Premium Logo UI -->
          <span class="text-[#0A66C2] font-black text-2xl tracking-tight flex items-center">
            Linked<span class="bg-[#0A66C2] text-white px-1 py-0.5 rounded ml-0.5 font-bold text-xl">in</span>
          </span>
        </div>

        <div class="flex items-center gap-6">
          <!-- Nav Icons List (Hidden on Mobile) -->
          <nav class="hidden md:flex items-center gap-6 border-r border-gray-200 pr-6">
            <button routerLink="/top-content" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span class="text-xs">Top Content</span>
            </button>
            <button routerLink="/pub/dir" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <span class="text-xs">People</span>
            </button>
            <button routerLink="/learning" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4 1.253"/></svg>
              <span class="text-xs">Learning</span>
            </button>
            <button (click)="openLoginModal()" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <span class="text-xs">NoJobs</span>
            </button>
            <button (click)="openLoginModal()" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z"/></svg>
              <span class="text-xs">Games</span>
            </button>
            <button (click)="openLoginModal()" class="flex flex-col items-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none cursor-pointer">
              <svg class="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
              <span class="text-xs">Get the app</span>
            </button>
          </nav>
          
          <div class="flex items-center gap-3">
            <button
              (click)="openRegisterModal()"
              class="text-secondary hover:bg-hover-bg hover:text-foreground font-semibold text-base rounded-button px-5 py-2.5 transition-colors focus:outline-none"
            >
              Join now
            </button>
            <button
              (click)="openLoginModal()"
              data-testid="button-sign-in"
              class="border border-primary text-primary hover:bg-primary/5 font-semibold text-base rounded-button px-5 py-2 transition-colors focus:outline-none"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <!-- MAIN FOLDS PORTAL -->
      <main class="flex-1">

        <!-- FOLD 1: HERO CONTAINER (FIND JOB) -->
        <section class="max-w-[1128px] mx-auto px-6 py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div class="space-y-6">
            <h1 class="text-4xl md:text-5xl font-light text-[#8F5849] leading-tight" style="font-family: var(--app-font-sans)">
              Find the right job or internship for you
            </h1>
          </div>
          <div>
            <h2 class="text-gray-500 uppercase text-xs font-semibold mb-3 tracking-wider">Suggested Searches</h2>
            <div class="flex flex-wrap gap-2">
              @for (job of suggestedSearches; track job) {
                <button
                  (click)="openMockModal(job + ' Search')"
                  class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-full px-4 py-2 border border-transparent hover:border-gray-300 transition-all cursor-pointer"
                >
                  {{ job }}
                </button>
              }
              <button
                (click)="toggleSuggestedSearchShowMore()"
                class="border border-gray-400 hover:border-gray-600 text-gray-700 font-semibold text-sm rounded-full px-4 py-2 flex items-center gap-1 hover:bg-gray-50 transition-colors"
              >
                {{ showMoreSearches() ? 'Show less' : 'Show more' }}
                <svg class="w-4 h-4 transition-transform duration-200" [class.rotate-180]="showMoreSearches()" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
            </div>
            @if (showMoreSearches()) {
              <div class="flex flex-wrap gap-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                @for (job of extraSearches; track job) {
                  <button
                    (click)="openMockModal(job + ' Search')"
                    class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-full px-4 py-2 transition-colors cursor-pointer"
                  >
                    {{ job }}
                  </button>
                }
              </div>
            }
          </div>
        </section>

        <!-- FOLD 2: POST JOB BANNER -->
        <section class="bg-[#F1ECE5] py-16 text-center px-6 border-y border-[#E0DFDC]">
          <div class="max-w-[700px] mx-auto space-y-4">
            <h2 class="text-3xl font-light text-[#B24020] leading-tight">
              Post your job for millions of people to see
            </h2>
            <button
              (click)="openMockModal('Post a Job')"
              class="border border-primary text-primary hover:bg-primary/5 font-semibold text-base rounded-button px-6 py-2.5 transition-colors focus:outline-none mt-2"
            >
              Post a job
            </button>
          </div>
        </section>

        <!-- FOLD 3: CONNECT & LEARN CARDS -->
        <section class="max-w-[1128px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Connect Column -->
          <div class="flex flex-col items-center text-center space-y-4">
            <img src="/hero_connect.png" alt="Connect illustration" class="w-full max-w-[320px] h-auto object-contain mb-2 rounded" />
            <h3 class="text-2xl font-light text-gray-900 leading-tight">
              Connect with people who can help
            </h3>
            <button
              (click)="openMockModal('Find people')"
              class="border border-secondary text-secondary hover:bg-hover-bg font-semibold text-base rounded-button px-6 py-2 transition-colors focus:outline-none"
            >
              Find people you know
            </button>
          </div>
          <!-- Learn Column -->
          <div class="flex flex-col items-center text-center space-y-4">
            <img src="/hero_learn.png" alt="Learn illustration" class="w-full max-w-[320px] h-auto object-contain mb-2 rounded" />
            <h3 class="text-2xl font-light text-gray-900 leading-tight">
              Learn the skills you need to succeed
            </h3>
            <div class="relative w-full max-w-[280px]">
              <button
                (click)="toggleLearnDropdown()"
                class="w-full border border-gray-400 hover:border-gray-600 text-gray-700 hover:bg-gray-50 font-semibold text-base rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors focus:outline-none"
              >
                <span>Choose a topic to learn about</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </button>
              @if (showLearnDropdown()) {
                <div class="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 text-left overflow-hidden py-1">
                  @for (topic of learnTopics; track topic) {
                    <button (click)="openMockModal('Learn ' + topic); showLearnDropdown.set(false)" class="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">
                      {{ topic }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        </section>

        <!-- FOLD 4: EXPLORE AND SSO CARD -->
        <section class="bg-[#F3F2EF] py-16 border-t border-gray-200">
          <div class="max-w-[1128px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
              <h2 class="text-3xl md:text-4xl font-light text-gray-900 leading-tight">
                Explore jobs and grow your professional network
              </h2>
              
              <!-- Stack of sign in options -->
              <div class="space-y-3 max-w-[380px]">
                <!-- Google Sign-In Button Target -->
                <div id="googleBtnHero" class="w-full flex justify-center"></div>
              </div>

              <p class="text-xs text-gray-500 max-w-[380px] leading-relaxed">
                By clicking Continue to join or sign in, you agree to LinkedIn's <span class="text-[#0A66C2] hover:underline cursor-pointer">User Agreement</span>, <span class="text-[#0A66C2] hover:underline cursor-pointer">Privacy Policy</span>, and <span class="text-[#0A66C2] hover:underline cursor-pointer">Cookie Policy</span>.
              </p>

              <p class="text-sm text-gray-600 pt-2">
                New to LinkedIn? 
                <button (click)="openRegisterModal()" class="text-[#0A66C2] font-semibold hover:underline">Join now</button>
              </p>
            </div>
            
            <div class="flex justify-center">
              <img src="/hero_explore.png" alt="Explore illustration" class="w-full max-w-[420px] h-auto object-contain rounded" />
            </div>
          </div>
        </section>

        <!-- FOLD 5: OPEN TO WORK -->
        <section class="max-w-[1128px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div class="space-y-4">
            <h2 class="text-3xl font-light text-[#B24020] leading-tight">
              Let the right people know you're open to work
            </h2>
            <p class="text-sm text-gray-600 leading-relaxed max-w-[480px]">
              With the Open To Work feature, you can privately tell recruiters or publicly share with the LinkedIn community that you are looking for new job opportunities.
            </p>
          </div>
          <div class="flex justify-center relative">
            <img src="/hero_opentowork.png" alt="Open to Work illustration" class="w-full max-w-[360px] h-auto object-contain rounded-full border border-gray-100 shadow-sm" />
            
            <!-- Carousel Nav chevron simulation -->
            <button (click)="openMockModal('Next OpenToWork slider')" class="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white hover:bg-gray-100 rounded-full border border-gray-300 shadow flex items-center justify-center text-gray-700">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>

        <!-- FOLD 6: SOFTWARE TOOLS & GAMES -->
        <section class="bg-white py-16 border-t border-gray-200">
          <div class="max-w-[1128px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
            <!-- Software Tools Column -->
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="text-2xl font-light text-gray-900 leading-tight">Discover the best software tools</h3>
                <p class="text-sm text-gray-500">Connect with buyers who have first-hand experience to find the best products for you.</p>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (tool of softwareTools; track tool) {
                  <button (click)="openMockModal(tool)" class="border border-gray-400 hover:border-gray-600 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-full px-4 py-2 transition-colors cursor-pointer">
                    {{ tool }}
                  </button>
                }
                <button (click)="openMockModal('Software list')" class="text-[#0A66C2] hover:underline font-semibold text-sm ml-2">Show all</button>
              </div>
            </div>

            <!-- Games Column -->
            <div class="space-y-6">
              <div class="space-y-2">
                <h3 class="text-2xl font-light text-gray-900 leading-tight">Keep your mind sharp with games</h3>
                <p class="text-sm text-gray-500">Take a break and reconnect with your network through quick daily games.</p>
              </div>
              <div class="flex flex-wrap gap-2">
                @for (game of games; track game) {
                  <button (click)="openMockModal(game)" class="border border-gray-400 hover:border-gray-600 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-full px-4 py-2 transition-colors cursor-pointer">
                    {{ game }}
                  </button>
                }
              </div>
            </div>
          </div>
        </section>

      </main>

      <!-- FOOTER -->
      <footer class="bg-gray-100 border-t border-gray-200 py-10 px-6 mt-auto">
        <div class="max-w-[1128px] mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 text-xs text-gray-500 mb-8">
          <div class="space-y-2">
            <span class="text-[#0A66C2] font-black text-sm tracking-tight flex items-center">
              Linked<span class="bg-[#0A66C2] text-white px-0.5 py-0.2 rounded ml-0.5 font-bold text-xs">in</span>
            </span>
            <p>&copy; {{ currentYear }}</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-700">General</h4>
            <p class="hover:underline cursor-pointer">Sign Up</p>
            <p class="hover:underline cursor-pointer">Help Center</p>
            <p class="hover:underline cursor-pointer">About</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-700">Browse LinkedIn</h4>
            <p class="hover:underline cursor-pointer">Learning</p>
            <p class="hover:underline cursor-pointer">Jobs</p>
            <p class="hover:underline cursor-pointer">Salary</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-700">Business Solutions</h4>
            <p class="hover:underline cursor-pointer">Talent</p>
            <p class="hover:underline cursor-pointer">Marketing</p>
            <p class="hover:underline cursor-pointer">Sales</p>
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-gray-700">Directories</h4>
            <p class="hover:underline cursor-pointer">Members</p>
            <p class="hover:underline cursor-pointer">Jobs</p>
            <p class="hover:underline cursor-pointer">Companies</p>
          </div>
        </div>
      </footer>


      <!-- ================= MODALS OVERLAYS ================= -->

      <!-- 1. SIGN IN MODAL -->
      @if (showLoginModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" (click)="closeModals()">
          <div class="bg-white rounded-card border border-border shadow-md w-full max-w-[400px] p-8 relative overflow-hidden" (click)="$event.stopPropagation()" data-testid="modal-login">
            <button (click)="closeModals()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-hover-bg transition-colors focus:outline-none">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 class="text-3xl font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p class="text-sm text-gray-500 mb-6">Never Ever Stay updated on your professional world</p>

            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2.5 mb-4" data-testid="text-login-error">
                {{ errorMessage() }}
              </div>
            }

            @if (otpRequired()) {
              <form [formGroup]="otpForm" (ngSubmit)="onSubmitOtp()" class="space-y-4 mb-4">
                <div class="bg-blue-50 border border-blue-200 text-[#0A66C2] text-xs rounded px-3 py-2.5">
                  A verification code has been sent to {{ otpEmail() }}.
                </div>
                <div>
                  <label class="text-gray-700 text-xs font-semibold block mb-1">Verification Code</label>
                  <input
                    type="text"
                    formControlName="code"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                    placeholder="Enter 6-digit code"
                    maxlength="6"
                  />
                </div>
                <button
                  type="submit"
                  [disabled]="otpForm.invalid"
                  class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full py-2.5 transition-colors cursor-pointer"
                >
                  Verify Code
                </button>
              </form>
            } @else {
              <!-- Email / Password Login Form -->
              <form [formGroup]="loginForm" (ngSubmit)="onSubmitLogin()" class="space-y-4 mb-4">
                <div>
                  <label class="text-gray-700 text-xs font-semibold block mb-1">Email</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                    placeholder="Email address"
                    data-testid="input-login-email"
                  />
                </div>
                
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <label class="text-gray-700 text-xs font-semibold block">Password</label>
                    <a routerLink="/forgot-password" (click)="closeModals()" class="text-xs text-[#0A66C2] hover:underline font-semibold focus:outline-none">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    formControlName="password"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                    placeholder="Password"
                    data-testid="input-login-password"
                  />
                </div>

                <button
                  type="submit"
                  [disabled]="loginForm.invalid"
                  class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-full py-2.5 transition-colors cursor-pointer"
                  data-testid="button-login-submit"
                >
                  Sign in
                </button>
              </form>

              <div class="flex items-center gap-3 my-4">
                <hr class="flex-1 border-gray-200" />
                <span class="text-gray-400 text-xs">or</span>
                <hr class="flex-1 border-gray-200" />
              </div>

              <!-- Google Sign-In Button Target -->
              <div id="googleBtnModal" class="w-full flex justify-center mb-3"></div>
            }

            <p class="text-center text-sm text-gray-600">
              New to LinkedIn? 
              <button (click)="switchToRegister()" class="text-[#0A66C2] font-semibold hover:underline focus:outline-none">Join now</button>
            </p>
          </div>
        </div>
      }

      <!-- 2. REGISTER / JOIN NOW MODAL -->
      @if (showRegisterModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200" (click)="closeModals()">
          <div class="bg-white rounded-card border border-border shadow-md w-full max-w-[400px] p-8 relative overflow-hidden" (click)="$event.stopPropagation()">
            <button (click)="closeModals()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-hover-bg transition-colors focus:outline-none">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 class="text-2xl font-semibold text-gray-900 mb-1">Make the most of your professional life</h2>
            <p class="text-sm text-gray-500 mb-6">Start your journey today</p>

            @if (errorMessage()) {
              <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
                {{ errorMessage() }}
              </div>
            }

            <form [formGroup]="registerForm" (ngSubmit)="onSubmitRegister()" class="space-y-4">
              <!-- Full name -->
              <div>
                <label class="text-gray-700 text-xs font-semibold block mb-1">Full name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                  placeholder="First and last name"
                />
              </div>

              <!-- Email -->
              <div>
                <label class="text-gray-700 text-xs font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                  placeholder="Email address"
                />
              </div>

              <!-- Password -->
              <div>
                <label class="text-gray-700 text-xs font-semibold block mb-1">Password (6+ characters)</label>
                <input
                  type="password"
                  formControlName="password"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2]"
                  placeholder="Password"
                />
              </div>

              <!-- Join As -->
              <div>
                <label class="text-gray-700 text-xs font-semibold block mb-1">Join as</label>
                <select
                  formControlName="role"
                  class="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-1 focus:ring-[#0A66C2] transition-colors bg-white font-medium cursor-pointer"
                >
                  <option value="candidate">Candidate (seeking jobs)</option>
                  <option value="business">Business/Employer (posting jobs & ads)</option>
                </select>
              </div>

              <button
                type="submit"
                [disabled]="registerForm.invalid"
                class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 text-white text-sm font-semibold rounded-full py-2.5 transition-colors cursor-pointer"
              >
                Agree & Join
              </button>

              <div class="flex items-center gap-3 my-4">
                <hr class="flex-1 border-gray-200" />
                <span class="text-gray-400 text-xs">or</span>
                <hr class="flex-1 border-gray-200" />
              </div>

              <!-- Google Sign-In Button Target -->
              <div id="googleBtnRegisterModal" class="w-full flex justify-center"></div>
            </form>

            <div class="flex items-center gap-3 my-4">
              <hr class="flex-1 border-gray-200" />
              <span class="text-gray-400 text-xs">or</span>
              <hr class="flex-1 border-gray-200" />
            </div>

            <p class="text-center text-sm text-gray-600">
              Already on LinkedIn? 
              <button (click)="switchToLogin()" class="text-[#0A66C2] font-semibold hover:underline focus:outline-none">Sign in</button>
            </p>
          </div>
        </div>
      }

      <!-- 3. MOCK SIMULATED FEATURE MODAL -->
      @if (showMockModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150" (click)="closeModals()">
          <div class="bg-white rounded-xl shadow-2xl w-full max-w-[420px] p-6 relative overflow-hidden text-center" (click)="$event.stopPropagation()">
            <div class="w-12 h-12 bg-blue-50 text-[#0A66C2] rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mb-2">Sign in Required</h3>
            <p class="text-sm text-gray-500 mb-6">
              The "{{ mockFeatureName() }}" tool is a premium feature. Please sign in or register to explore our full network features!
            </p>

            <div class="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button (click)="closeModals()" class="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-full py-2 px-5 transition-colors focus:outline-none cursor-pointer">
                Cancel
              </button>
              <button (click)="switchToLogin()" class="bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm rounded-full py-2 px-5 transition-colors focus:outline-none cursor-pointer">
                Sign in now
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'signin') {
        this.openLoginModal();
      } else if (params['action'] === 'signup') {
        this.openRegisterModal();
      } else if (params['action'] === 'mock') {
        this.openMockModal(params['feature'] || 'Feature');
      }
    });

    setTimeout(() => {
      this.initGoogleSignIn();
    }, 500);
  }

  initGoogleSignIn() {
    if (typeof google !== 'undefined') {
      const clientId = this.stateService.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE'
        ? '809283748234-mockclientid.apps.googleusercontent.com'
        : this.stateService.GOOGLE_CLIENT_ID;
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        }
      });

      const heroBtn = document.getElementById("googleBtnHero");
      if (heroBtn) {
        google.accounts.id.renderButton(
          heroBtn,
          { theme: "outline", size: "large", width: 380, shape: "pill", text: "continue_with" }
        );
      }

      const modalBtn = document.getElementById("googleBtnModal");
      if (modalBtn) {
        google.accounts.id.renderButton(
          modalBtn,
          { theme: "outline", size: "large", width: 320, shape: "pill", text: "signin_with" }
        );
      }

      const registerModalBtn = document.getElementById("googleBtnRegisterModal");
      if (registerModalBtn) {
        google.accounts.id.renderButton(
          registerModalBtn,
          { theme: "outline", size: "large", width: 336, shape: "pill", text: "signup_with" }
        );
      }
    }
  }

  async handleGoogleCredential(credentialToken: string) {
    this.errorMessage.set('');
    const role = this.registerForm.value.role || 'candidate';
    const ok = await this.stateService.googleLogin(credentialToken, role);
    if (ok) {
      this.closeModals();
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set('Google sign-in failed.');
    }
  }

  errorMessage = signal<string>('');
  currentYear = new Date().getFullYear();

  // Modal display toggles
  showLoginModal = signal(false);
  showRegisterModal = signal(false);
  showMockModal = signal(false);
  mockFeatureName = signal('');

  // Searches toggles
  showMoreSearches = signal(false);
  showLearnDropdown = signal(false);

  suggestedSearches = [
    "Engineering",
    "Business Development",
    "Finance",
    "Administrative Assistant",
    "Retail Associate",
    "Customer Service",
    "Operations",
    "Information Technology",
    "Marketing",
    "Human Resources"
  ];

  extraSearches = [
    "Consulting",
    "Design",
    "Legal Services",
    "Sales",
    "Healthcare",
    "Media & Communications"
  ];

  learnTopics = [
    "Technology & Engineering",
    "Business Management",
    "Creative Arts & Design",
    "Personal Development",
    "Productivity & Systems"
  ];

  softwareTools = [
    "E-Commerce Platforms",
    "CRM Software",
    "Human Resources Management Systems",
    "Recruiting Software",
    "Sales Intelligence Software",
    "Project Management Software",
    "Help Desk Software",
    "Social Networking Software",
    "Desktop Publishing Software"
  ];

  games = [
    "Patches",
    "Zip",
    "Mini Sudoku",
    "Queens",
    "Tango",
    "Pinpoint",
    "Crossclimb"
  ];

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['candidate', [Validators.required]]
  });

  otpRequired = signal(false);
  otpEmail = signal('');
  otpForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
  });

  openLoginModal() {
    this.closeModals();
    this.loginForm.reset();
    this.showLoginModal.set(true);
    setTimeout(() => {
      this.initGoogleSignIn();
    }, 100);
  }

  openRegisterModal() {
    this.closeModals();
    this.registerForm.reset();
    this.showRegisterModal.set(true);
    setTimeout(() => {
      this.initGoogleSignIn();
    }, 100);
  }

  openMockModal(feature: string) {
    this.closeModals();
    this.mockFeatureName.set(feature);
    this.showMockModal.set(true);
  }

  closeModals() {
    this.showLoginModal.set(false);
    this.showRegisterModal.set(false);
    this.showMockModal.set(false);
    this.otpRequired.set(false);
    this.otpEmail.set('');
    this.errorMessage.set('');
  }

  switchToRegister() {
    this.openRegisterModal();
  }

  switchToLogin() {
    this.openLoginModal();
  }

  toggleSuggestedSearchShowMore() {
    this.showMoreSearches.update(val => !val);
  }

  toggleLearnDropdown() {
    this.showLearnDropdown.update(val => !val);
  }

  async onGoogleLogin() {
    // Simulated SSO logging in as Alex
    const ok = await this.stateService.login('alex@example.com', 'password');
    if (ok) {
      this.router.navigate(['/']);
    }
  }

  async onGmailLogin() {
    if (this.stateService.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE' || this.stateService.GOOGLE_CLIENT_ID.includes('mock')) {
      // Mock login as a mock Gmail account
      const role = this.registerForm.value.role || 'candidate';
      const ok = await this.stateService.googleLogin('mock_google_token_google_user@gmail.com', role);
      if (ok) {
        this.closeModals();
        this.router.navigate(['/']);
      }
    } else {
      if (typeof google !== 'undefined') {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            alert("Please use the 'Sign in with Google' button above.");
          }
        });
      } else {
        alert("Google library not loaded. Please try again.");
      }
    }
  }

  async onMicrosoftLogin() {
    // Simulated SSO logging in as Alex
    const ok = await this.stateService.login('alex@example.com', 'password');
    if (ok) {
      this.router.navigate(['/']);
    }
  }

  async onSubmitLogin() {
    if (this.loginForm.invalid) return;
    this.errorMessage.set('');
    const { email, password } = this.loginForm.value;
    const res = await this.stateService.login(email, password);
    if (res && res.otpRequired) {
      this.otpEmail.set(res.email);
      this.otpRequired.set(true);
      this.otpForm.reset();
    } else if (res === true) {
      this.closeModals();
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set('Email or password is incorrect.');
    }
  }

  async onSubmitOtp() {
    if (this.otpForm.invalid) return;
    this.errorMessage.set('');
    const { code } = this.otpForm.value;
    const ok = await this.stateService.verifyOtp(this.otpEmail(), code);
    if (ok) {
      this.closeModals();
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set('Invalid or expired OTP code.');
    }
  }

  async onSubmitRegister() {
    if (this.registerForm.invalid) return;
    const { name, email, password, role } = this.registerForm.value;
    const existing = this.stateService.users().find((u) => u.email === email);
    if (existing) {
      this.errorMessage.set('An account with this email already exists.');
      return;
    }
    await this.stateService.register(name, email, password, role);
    this.closeModals();
    this.router.navigate(['/']);
  }
}
