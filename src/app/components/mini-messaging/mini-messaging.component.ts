import { Component, inject, signal, computed, effect, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Conversation, User } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-mini-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mini-messaging-container font-sans">
      <!-- MAIN MESSAGING DRAWER -->
      <div 
        class="main-drawer bg-white rounded-t-xl border border-gray-300 shadow-2xl flex flex-col transition-all duration-300"
        [class.expanded]="isDrawerOpen()"
      >
        <!-- Header -->
        <div 
          class="header-bar px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer select-none bg-white rounded-t-xl hover:bg-gray-50"
          (click)="toggleDrawer()"
        >
          <div class="flex items-center gap-2">
            <!-- Profile Avatar with Status -->
            <div class="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
              @if (currentUser()?.avatarUrl) {
                <img [src]="currentUser()?.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
              } @else {
                <div class="w-full h-full flex items-center justify-center bg-[#0A66C2] text-white font-bold text-sm">
                  {{ currentUser()?.name?.charAt(0) }}
                </div>
              }
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-600 border-2 border-white rounded-full"></span>
            </div>
            
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-800">Messaging</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5" (click)="$event.stopPropagation()">
            <!-- Unread badge -->
            @if (totalUnread() > 0) {
              <span class="w-2 h-2 rounded-full bg-red-650 animate-pulse"></span>
            }

            <button class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent text-gray-500 cursor-pointer flex items-center justify-center">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </button>
            <button 
              class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent text-gray-500 cursor-pointer flex items-center justify-center transition-transform duration-300"
              [class.rotate-180]="isDrawerOpen()"
              (click)="toggleDrawer()"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Expanded Drawer Content -->
        @if (isDrawerOpen()) {
          <div class="drawer-body flex-1 flex flex-col bg-white overflow-hidden">
            <!-- Search bar -->
            <div class="px-3 py-2 border-b border-gray-150">
              <div class="relative flex items-center">
                <span class="absolute left-2.5 text-gray-400">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </span>
                <input 
                  type="text" 
                  [(ngModel)]="searchText"
                  placeholder="Search messages"
                  class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-250 bg-gray-50 rounded-md focus:bg-white focus:border-[#0A66C2] focus:outline-none" 
                />
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-150 text-xs font-bold shrink-0">
              <button 
                class="flex-1 py-2 text-center border-0 border-b-2 bg-transparent cursor-pointer"
                [class.border-[#057642]]="activeTab() === 'focused'"
                [class.text-[#057642]]="activeTab() === 'focused'"
                [class.border-transparent]="activeTab() !== 'focused'"
                [class.text-gray-500]="activeTab() !== 'focused'"
                (click)="activeTab.set('focused')"
              >
                Focused
              </button>
              <button 
                class="flex-1 py-2 text-center border-0 border-b-2 bg-transparent cursor-pointer"
                [class.border-[#057642]]="activeTab() === 'other'"
                [class.text-[#057642]]="activeTab() === 'other'"
                [class.border-transparent]="activeTab() !== 'other'"
                [class.text-gray-500]="activeTab() !== 'other'"
                (click)="activeTab.set('other')"
              >
                Other
              </button>
            </div>

            <!-- Conversation List -->
            <div class="flex-1 overflow-y-auto divide-y divide-gray-150">
              @if (filteredConversations().length === 0) {
                <div class="text-center py-12 text-gray-400 italic text-xs">
                  No conversations found.
                </div>
              } @else {
                @for (conv of filteredConversations(); track conv.id) {
                  <div 
                    class="p-3 flex items-start gap-2.5 hover:bg-gray-50 cursor-pointer transition-colors relative"
                    [class.bg-blue-50]="conv.unreadCount > 0"
                    (click)="openChat(conv.id)"
                  >
                    <!-- Avatar -->
                    <div class="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                      @if (getOtherParticipant(conv)?.avatarUrl) {
                        <img [src]="getOtherParticipant(conv)?.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                      } @else {
                        <div class="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold text-sm">
                          {{ getOtherParticipant(conv)?.name?.charAt(0) }}
                        </div>
                      }
                    </div>

                    <!-- Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-baseline">
                        <span class="text-xs font-bold text-slate-800 truncate" [class.font-black]="conv.unreadCount > 0">
                          {{ getOtherParticipant(conv)?.name }}
                        </span>
                        <span class="text-[10px] text-gray-400 whitespace-nowrap ml-1">
                          {{ getLastMessage(conv) ? formatTime(getLastMessage(conv)!.createdAt) : '' }}
                        </span>
                      </div>
                      <p class="text-xs text-gray-500 truncate mt-0.5" [class.font-bold]="conv.unreadCount > 0" [class.text-gray-800]="conv.unreadCount > 0">
                        {{ getLastMessage(conv)?.content || 'No messages yet' }}
                      </p>
                    </div>

                    <!-- Unread indication dot -->
                    @if (conv.unreadCount > 0) {
                      <span class="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 rounded-full bg-red-650"></span>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }
      </div>

      <!-- MINI SIDE-BY-SIDE CHAT WINDOWS -->
      <div class="chat-windows-row flex flex-row-reverse items-end gap-3">
        @for (chatId of openChats(); track chatId; let i = $index) {
          @if (getConversation(chatId); as conv) {
            <div 
              class="chat-window bg-white rounded-t-xl border border-gray-300 shadow-2xl flex flex-col transition-all duration-300"
              [class.minimized]="isChatMinimized(chatId)"
            >
              <!-- Header -->
              <div 
                class="header-bar px-3 py-2 border-b border-gray-200 flex items-center justify-between cursor-pointer select-none bg-white rounded-t-xl hover:bg-gray-50"
                (click)="toggleChatMinimize(chatId)"
              >
                <div class="flex items-center gap-2 max-w-[170px]">
                  <div class="relative w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                    @if (getOtherParticipant(conv)?.avatarUrl) {
                      <img [src]="getOtherParticipant(conv)?.avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center bg-gray-400 text-white font-bold text-xs">
                        {{ getOtherParticipant(conv)?.name?.charAt(0) }}
                      </div>
                    }
                  </div>
                  <div class="flex flex-col truncate">
                    <span class="text-xs font-bold text-slate-800 truncate">{{ getOtherParticipant(conv)?.name }}</span>
                    <span class="text-[9px] text-green-700 font-semibold">Active now</span>
                  </div>
                </div>

                <div class="flex items-center gap-1" (click)="$event.stopPropagation()">
                  <button 
                    class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent text-gray-500 cursor-pointer flex items-center justify-center transition-transform duration-300"
                    [class.rotate-180]="!isChatMinimized(chatId)"
                    (click)="toggleChatMinimize(chatId)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button 
                    class="p-1 hover:bg-gray-100 rounded-full border-0 bg-transparent text-gray-500 cursor-pointer flex items-center justify-center"
                    (click)="closeChat(chatId)"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>

              <!-- Chat Window Body (Only if expanded) -->
              @if (!isChatMinimized(chatId)) {
                <div class="chat-window-body flex-1 flex flex-col bg-white overflow-hidden">
                  <!-- Messages area -->
                  <div #chatScroll class="messages-area flex flex-col flex-1 p-3 overflow-y-auto space-y-2.5 bg-gray-50/50">
                    @for (msg of conv.messages; track msg.id) {
                      <div 
                        class="flex flex-col max-w-[85%]"
                        [class.self-end]="msg.senderId === currentUser()?.id"
                        [class.self-start]="msg.senderId !== currentUser()?.id"
                        [class.items-end]="msg.senderId === currentUser()?.id"
                        [class.items-start]="msg.senderId !== currentUser()?.id"
                      >
                        <div 
                          class="rounded-2xl px-3 py-1.5 text-xs leading-relaxed"
                          [class.bg-[#0A66C2]]="msg.senderId === currentUser()?.id"
                          [class.text-white]="msg.senderId === currentUser()?.id"
                          [class.bg-white]="msg.senderId !== currentUser()?.id"
                          [class.text-slate-800]="msg.senderId !== currentUser()?.id"
                          [class.border]="msg.senderId !== currentUser()?.id"
                          [class.border-gray-200]="msg.senderId !== currentUser()?.id"
                        >
                          {{ msg.content }}
                        </div>
                        <span class="text-[9px] text-gray-400 mt-0.5 px-1">{{ formatTime(msg.createdAt) }}</span>
                      </div>
                    }
                  </div>

                  <!-- Input area -->
                  <div class="input-area border-t border-gray-150 p-2 flex gap-1.5 items-center shrink-0">
                    <input 
                      type="text" 
                      [(ngModel)]="chatInputTexts[chatId]"
                      placeholder="Write a message..."
                      (keydown.enter)="sendChatMessage(chatId)"
                      class="flex-1 border border-gray-250 rounded-full px-3 py-1 text-xs focus:border-[#0A66C2] focus:outline-none bg-gray-50 focus:bg-white" 
                    />
                    <button 
                      class="bg-[#0A66C2] hover:bg-[#004182] text-white p-1.5 rounded-full border-0 cursor-pointer flex items-center justify-center shrink-0"
                      (click)="sendChatMessage(chatId)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .mini-messaging-container {
      position: fixed;
      bottom: 0;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: row-reverse;
      align-items: end;
      pointer-events: none;
      gap: 12px;
    }

    .main-drawer, .chat-window {
      pointer-events: auto;
      width: 288px;
      height: 48px;
      overflow: hidden;
      display: flex;
      flex-direction: col;
    }

    .main-drawer.expanded, .chat-window:not(.minimized) {
      height: 400px;
    }

    .chat-window {
      width: 260px;
    }

    .chat-window:not(.minimized) {
      height: 380px;
    }

    .chat-windows-row {
      display: flex;
      flex-direction: row-reverse;
      align-items: end;
      pointer-events: auto;
      gap: 12px;
    }

    .header-bar {
      height: 48px;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .messages-area {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class MiniMessagingComponent implements AfterViewChecked {
  private readonly stateService = inject(StateService);

  @ViewChildren('chatScroll') private chatScrolls?: QueryList<ElementRef>;

  readonly currentUser = this.stateService.currentUser;
  readonly users = this.stateService.users;
  readonly conversations = this.stateService.conversations;

  isDrawerOpen = signal<boolean>(false);
  activeTab = signal<'focused' | 'other'>('focused');
  searchText = '';

  openChats = signal<string[]>([]);
  minimizedChats = signal<Set<string>>(new Set());
  chatInputTexts: { [chatId: string]: string } = {};

  // Compute total unread message count
  totalUnread = computed(() => {
    return this.conversations().reduce((acc, c) => acc + c.unreadCount, 0);
  });

  filteredConversations = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.conversations().filter((conv) => {
      const other = this.getOtherParticipant(conv);
      const matchesSearch = !this.searchText || (other && other.name.toLowerCase().includes(this.searchText.toLowerCase()));
      // Focused is for conversations containing experiences or just default for now.
      // Other is fallback, let's keep all on Focused tab for simplicity, or partition by unread/other.
      const isFocused = this.activeTab() === 'focused';
      return matchesSearch;
    });
  });

  constructor() {
    // Automatically read conversation when a chat is expanded
    effect(() => {
      const open = this.openChats();
      const minimized = this.minimizedChats();
      for (const chatId of open) {
        if (!minimized.has(chatId)) {
          this.stateService.markConversationRead(chatId);
        }
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewChecked() {
    this.scrollToBottomAll();
  }

  toggleDrawer() {
    this.isDrawerOpen.set(!this.isDrawerOpen());
  }

  getConversation(chatId: string): Conversation | undefined {
    return this.conversations().find(c => c.id === chatId);
  }

  getOtherParticipant(conv: Conversation): User | undefined {
    const otherId = conv.participantIds.find((id) => id !== this.currentUser()?.id);
    return this.users().find((u) => u.id === otherId);
  }

  getLastMessage(conv: Conversation) {
    if (conv.messages.length === 0) return null;
    return conv.messages[conv.messages.length - 1];
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  openChat(chatId: string) {
    const current = this.openChats();
    if (!current.includes(chatId)) {
      // Limit to max 3 chats side-by-side
      const next = current.length >= 3 ? [...current.slice(1), chatId] : [...current, chatId];
      this.openChats.set(next);
    }
    // Remove from minimized set if it was minimized
    const newMinimized = new Set(this.minimizedChats());
    newMinimized.delete(chatId);
    this.minimizedChats.set(newMinimized);
    
    this.stateService.markConversationRead(chatId);
    this.scrollToBottomAll();
  }

  closeChat(chatId: string) {
    this.openChats.set(this.openChats().filter(id => id !== chatId));
    const newMinimized = new Set(this.minimizedChats());
    newMinimized.delete(chatId);
    this.minimizedChats.set(newMinimized);
    delete this.chatInputTexts[chatId];
  }

  isChatMinimized(chatId: string): boolean {
    return this.minimizedChats().has(chatId);
  }

  toggleChatMinimize(chatId: string) {
    const newMinimized = new Set(this.minimizedChats());
    if (newMinimized.has(chatId)) {
      newMinimized.delete(chatId);
      this.stateService.markConversationRead(chatId);
    } else {
      newMinimized.add(chatId);
    }
    this.minimizedChats.set(newMinimized);
    this.scrollToBottomAll();
  }

  sendChatMessage(chatId: string) {
    const content = this.chatInputTexts[chatId]?.trim();
    if (!content) return;

    const conv = this.getConversation(chatId);
    const otherId = conv?.participantIds.find((id) => id !== this.currentUser()?.id) || '';

    this.stateService.sendMessage(chatId, otherId, content);
    this.chatInputTexts[chatId] = '';
    this.scrollToBottomAll();
  }

  private scrollToBottomAll(): void {
    setTimeout(() => {
      try {
        this.chatScrolls?.forEach((scroll) => {
          scroll.nativeElement.scrollTop = scroll.nativeElement.scrollHeight;
        });
      } catch (err) {}
    }, 100);
  }
}
