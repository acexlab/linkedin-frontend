import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[800px] mx-auto px-4 py-4 mt-14">
      <div class="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
        
        <!-- Left Tab options -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden flex-shrink-0 h-fit">
          <div class="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900 text-sm">Settings Settings</div>
          <div class="flex flex-col">
            @for (tabOption of ['account', 'security', 'visibility']; track tabOption) {
              <button
                (click)="activeTab.set(tabOption)"
                [class.bg-blue-50]="activeTab() === tabOption"
                [class.text-[#0A66C2]]="activeTab() === tabOption"
                [class.font-semibold]="activeTab() === tabOption"
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-l-2 border-transparent hover:border-gray-300"
              >
                @if (tabOption === 'account') { Account preferences }
                @if (tabOption === 'security') { Sign in & security }
                @if (tabOption === 'visibility') { Visibility }
              </button>
            }
          </div>
        </div>

        <!-- Right Content panel -->
        <div class="bg-white rounded-lg border border-[#E0DFDC] p-6">
          @if (activeTab() === 'account') {
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Account preferences</h2>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Headline</label>
                <input
                  type="text"
                  [(ngModel)]="headline"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                />
              </div>

              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Location</label>
                <input
                  type="text"
                  [(ngModel)]="location"
                  class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Avatar Color</label>
                  <select
                    [(ngModel)]="avatarColor"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white"
                  >
                    @for (col of colors; track col.value) {
                      <option [value]="col.value">{{ col.name }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-700 block mb-1">Cover Gradient Theme</label>
                  <select
                    [(ngModel)]="coverColor"
                    class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0A66C2] focus:outline-none bg-white"
                  >
                    <option value="linear-gradient(135deg, #0A66C2, #004182)">Default Blue</option>
                    <option value="linear-gradient(135deg, #057642, #03422a)">Green Tech</option>
                    <option value="linear-gradient(135deg, #8B44AC, #5a2d72)">Purple Design</option>
                    <option value="linear-gradient(135deg, #CC0000, #880000)">Netflix Red</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-100">
                <div>
                  <h3 class="text-sm font-semibold text-gray-800">Open to work banner</h3>
                  <p class="text-xs text-gray-500">Toggle whether your profile has the #OpenToWork tag</p>
                </div>
                <button
                  (click)="toggleOpenToWork()"
                  [class.bg-[#057642]]="currentUser()?.openToWork"
                  [class.bg-gray-300]="!currentUser()?.openToWork"
                  class="w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none"
                >
                  <span
                    [class.translate-x-6]="currentUser()?.openToWork"
                    [class.translate-x-1]="!currentUser()?.openToWork"
                    class="absolute top-1 left-0 w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200"
                  ></span>
                </button>
              </div>

              <button
                (click)="savePreferences()"
                class="bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold rounded-full px-5 py-2 transition-colors mt-2"
              >
                Save preferences
              </button>
            </div>
          }

          @if (activeTab() === 'security') {
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Sign in & security</h2>
            <div class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Email address</label>
                <input
                  type="email"
                  disabled
                  [value]="currentUser()?.email"
                  class="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label class="text-xs font-semibold text-gray-700 block mb-1">Password</label>
                <input
                  type="password"
                  disabled
                  value="••••••••••••••"
                  class="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          }

          @if (activeTab() === 'visibility') {
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Visibility</h2>
            <p class="text-sm text-gray-600">Choose who can view your profile data. This determines if other users see your contact status.</p>
            <div class="mt-4 p-3 border border-gray-200 rounded bg-gray-50">
              <span class="text-xs font-semibold text-[#0A66C2]">Status: PUBLIC</span>
              <p class="text-xs text-gray-500 mt-1">Anyone on LinkedIn clone can view your contact initials and headline description.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private readonly stateService = inject(StateService);

  readonly currentUser = this.stateService.currentUser;

  activeTab = signal<string>('account');

  // Input states
  headline = '';
  location = '';
  avatarColor = '';
  coverColor = '';

  colors = [
    { name: 'LinkedIn Blue', value: '#0A66C2' },
    { name: 'Meta Green', value: '#057642' },
    { name: 'Purple Ribbon', value: '#8B44AC' },
    { name: 'Vibrant Amber', value: '#C77800' },
    { name: 'Classic Charcoal', value: '#555555' },
    { name: 'Deep Red', value: '#CC0000' }
  ];

  constructor() {
    effect(() => {
      const user = this.currentUser();
      if (user) {
        this.headline = user.headline;
        this.location = user.location;
        this.avatarColor = user.avatarColor;
        this.coverColor = user.coverColor;
      }
    }, { allowSignalWrites: true });
  }

  toggleOpenToWork() {
    this.stateService.toggleOpenToWork();
  }

  savePreferences() {
    this.stateService.updateProfile({
      headline: this.headline,
      location: this.location,
      avatarColor: this.avatarColor,
      coverColor: this.coverColor
    });
  }
}
