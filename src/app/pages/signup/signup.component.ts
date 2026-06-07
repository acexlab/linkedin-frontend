import { Component, inject, signal, OnInit, NgZone } from '@angular/core';

declare var google: any;
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#F3F2EF] flex flex-col font-sans text-gray-800 items-center justify-between py-10 px-4">
      
      <!-- Logo Header -->
      <div class="flex justify-center mb-6 cursor-pointer" routerLink="/login">
        <span class="text-[#0A66C2] font-black text-3xl tracking-tight flex items-center">
          Linked<span class="bg-[#0A66C2] text-white px-1.5 py-0.5 rounded ml-0.5 font-bold text-2xl">in</span>
        </span>
      </div>

      <!-- Main Sign Up Card -->
      <div class="bg-white rounded-lg border border-gray-200 shadow-sm w-full max-w-[420px] p-8 space-y-6">
        <div class="text-center space-y-1">
          <h1 class="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
            Join LinkedIn now — it's free!
          </h1>
          <p class="text-xs text-gray-500">Make the most of your professional life</p>
        </div>

        @if (errorMessage()) {
          <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2.5">
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="registerForm" class="space-y-4">
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

          <!-- Gmail SSO Button -->
          <button
            type="button"
            (click)="onGmailSignup()"
            class="w-full border border-gray-300 hover:border-gray-400 bg-white text-gray-700 font-semibold text-sm rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"/>
            </svg>
            <span>Continue with Gmail</span>
          </button>
        </form>

        <p class="text-center text-sm text-gray-600">
          Already on LinkedIn? 
          <a routerLink="/login" class="text-[#0A66C2] font-semibold hover:underline">Sign in</a>
        </p>
      </div>

      <!-- Business links -->
      <div class="text-center text-xs text-gray-500 mt-6">
        Looking to create a page for a business? <a routerLink="/login" class="text-[#0A66C2] hover:underline font-semibold">Get help</a>
      </div>

    </div>
  `
})
export class SignupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly stateService = inject(StateService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  errorMessage = signal('');
  showPassword = signal(false);

  ngOnInit() {
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

      const signupBtn = document.getElementById("googleBtnSignup");
      if (signupBtn) {
        google.accounts.id.renderButton(
          signupBtn,
          { theme: "outline", size: "large", width: 356, shape: "pill", text: "signup_with" }
        );
      }
    }
  }

  async handleGoogleCredential(credentialToken: string) {
    this.errorMessage.set('');
    const role = this.registerForm.value.role || 'candidate';
    const ok = await this.stateService.googleLogin(credentialToken, role);
    if (ok) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set('Google sign-up failed.');
    }
  }

  async onGmailSignup() {
    if (this.stateService.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_GOES_HERE' || this.stateService.GOOGLE_CLIENT_ID.includes('mock')) {
      // Mock signup with a fresh random Gmail address
      const mockEmail = `testuser_${Math.floor(Math.random() * 900 + 100)}@gmail.com`;
      const ok = await this.stateService.googleLogin(`mock_google_token_${mockEmail}`, this.registerForm.value.role || 'candidate');
      if (ok) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set('Google sign-up failed.');
      }
    } else {
      if (typeof google !== 'undefined') {
        google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            alert("Please use the 'Sign up with Google' button above.");
          }
        });
      } else {
        alert("Google library not loaded. Please try again.");
      }
    }
  }

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['candidate', [Validators.required]]
  });

  togglePasswordShow() {
    this.showPassword.update(val => !val);
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    const { name, email, password, role } = this.registerForm.value;
    const existing = this.stateService.users().find((u) => u.email === email);
    if (existing) {
      this.errorMessage.set('An account with this email already exists.');
      return;
    }
    const registeredUser = await this.stateService.register(name, email, password, role);
    if (registeredUser && registeredUser.id) {
      this.router.navigate(['/profile', registeredUser.id]);
    } else {
      this.router.navigate(['/']);
    }
  }

  async onSSOLogin() {
    const ok = await this.stateService.login('alex@example.com', 'password');
    if (ok) {
      this.router.navigate(['/']);
    }
  }
}
