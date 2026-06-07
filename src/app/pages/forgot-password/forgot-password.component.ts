import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col font-sans">
      <header class="bg-white border-b border-[#E0DFDC] px-6 py-3 flex items-center justify-between shadow-sm">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 bg-[#0A66C2] rounded flex items-center justify-center transform hover:scale-105 transition-transform">
            <span class="text-white font-bold text-lg italic">in</span>
          </div>
          <span class="text-xl font-bold text-gray-800 tracking-wide">ProLink</span>
        </div>
      </header>

      <div class="flex-1 flex items-start justify-center pt-16 px-4">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-8 transition-all duration-300">
          
          <!-- Step 1: Send OTP -->
          @if (!otpSent() && !successMessage()) {
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p class="text-sm text-gray-500">Enter your email and we'll send you a 6-digit OTP code to verify your identity.</p>
            </div>

            @if (errorMessage()) {
              <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-center gap-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="handleSendOtp()" class="space-y-5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  data-testid="input-forgot-email"
                  class="w-full border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 transition-all"
                />
              </div>
              <button
                type="submit"
                data-testid="button-forgot-submit"
                [disabled]="!email.trim() || loading()"
                class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 text-sm shadow-md hover:shadow-lg transition-all"
              >
                @if (loading()) {
                  Sending...
                } @else {
                  Send OTP Code
                }
              </button>
            </form>
          }

          <!-- Step 2: Verification and Reset -->
          @if (otpSent() && !successMessage()) {
            <div class="text-center mb-6">
              <h1 class="text-2xl font-bold text-gray-900 mb-2">Create New Password</h1>
              <p class="text-sm text-gray-500">We've sent a 6-digit OTP code to <strong class="text-gray-700">{{ email }}</strong>.</p>
            </div>

            @if (errorMessage()) {
              <div class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-center gap-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="handleResetPassword()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">6-Digit OTP Code</label>
                <input
                  type="text"
                  [(ngModel)]="otpCode"
                  name="otpCode"
                  maxlength="6"
                  placeholder="Enter 6-digit code"
                  required
                  data-testid="input-forgot-otp"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-center font-mono tracking-widest text-lg focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">New Password</label>
                <input
                  type="password"
                  [(ngModel)]="newPassword"
                  name="newPassword"
                  placeholder="At least 6 characters"
                  required
                  data-testid="input-new-password"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 transition-all"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  [(ngModel)]="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  required
                  data-testid="input-confirm-password"
                  class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/20 transition-all"
                />
              </div>

              <button
                type="submit"
                data-testid="button-reset-submit"
                [disabled]="!otpCode || !newPassword || !confirmPassword || loading()"
                class="w-full bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-full py-3 text-sm shadow-md hover:shadow-lg transition-all"
              >
                @if (loading()) {
                  Updating Password...
                } @else {
                  Reset Password
                }
              </button>
            </form>
          }

          <!-- Step 3: Success State -->
          @if (successMessage()) {
            <div class="text-center py-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 transform scale-110 shadow-inner">
                <svg class="w-9 h-9 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
              <p class="text-sm text-gray-600">{{ successMessage() }}</p>
              <p class="text-xs text-gray-400 mt-4">Redirecting to sign in...</p>
            </div>
          }

          <div class="mt-6 text-center">
            <a routerLink="/login" class="text-sm text-[#0A66C2] font-semibold hover:underline hover:text-[#004182] transition-colors">
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private stateService = inject(StateService);
  private router = inject(Router);

  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';

  otpSent = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async handleSendOtp() {
    if (!this.email.trim()) return;
    this.loading.set(true);
    this.errorMessage.set(null);

    const success = await this.stateService.forgotPassword(this.email.trim());
    this.loading.set(false);

    if (success) {
      this.otpSent.set(true);
    } else {
      this.errorMessage.set('Could not send OTP. Make sure the email is registered.');
    }
  }

  async handleResetPassword() {
    if (!this.otpCode || !this.newPassword || !this.confirmPassword) return;
    this.errorMessage.set(null);

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    this.loading.set(true);
    const success = await this.stateService.resetPassword(
      this.email.trim(),
      this.otpCode.trim(),
      this.newPassword
    );
    this.loading.set(false);

    if (success) {
      this.successMessage.set('Your password has been reset successfully.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } else {
      this.errorMessage.set('Invalid or expired OTP code.');
    }
  }
}
