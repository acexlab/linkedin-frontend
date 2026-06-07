import { Component, inject, signal, computed, effect, ViewChild, ElementRef, AfterViewChecked, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService } from '../../services/state.service';
import { Conversation, User } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-4 mt-14">
      <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden flex" style="height: calc(100vh - 100px)">
        
        <!-- Left Side: Conversation List -->
        <div class="w-[320px] flex-shrink-0 border-r border-gray-200 flex flex-col">
          <!-- Header -->
          <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 class="font-semibold text-gray-900 text-lg">Messaging</h2>
            <div class="flex items-center gap-2">
              <button class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600" title="More">
                <!-- MoreHorizontal icon -->
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              </button>
              <button class="p-1.5 hover:bg-gray-100 rounded-full text-gray-600" data-testid="button-new-message" title="New message">
                <!-- Edit icon -->
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
            </div>
          </div>

          <!-- Search conversations -->
          <div class="px-3 py-2 border-b border-gray-100 flex-shrink-0">
            <div class="flex items-center gap-2 bg-[#EEF3F8] rounded-full px-3 py-1.5">
              <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                type="search"
                [(ngModel)]="searchText"
                placeholder="Search messages"
                data-testid="input-message-search"
                class="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <!-- Active threads lists -->
          <div class="overflow-y-auto flex-1">
            @for (conv of filteredConversations(); track conv.id) {
              @let otherUser = getOtherParticipant(conv);
              @let lastMsg = getLastMessage(conv);
              <div
                (click)="selectConversation(conv.id)"
                [attr.data-testid]="'card-conversation-' + conv.id"
                [class.bg-[#EEF3F8]]="activeConvId() === conv.id"
                [class.bg-blue-50]="conv.unreadCount > 0 && activeConvId() !== conv.id"
                class="px-3 py-3 flex items-center gap-3 cursor-pointer hover:bg-[#F3F2EF] transition-colors"
              >
                <!-- Avatar -->
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  [style.backgroundColor]="otherUser?.avatarColor || '#0A66C2'"
                >
                  {{ otherUser?.avatarInitials || '?' }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p [class.font-bold]="conv.unreadCount > 0" class="text-sm font-semibold text-gray-800 truncate">
                      {{ otherUser?.name }}
                    </p>
                    <p class="text-[11px] text-gray-400 flex-shrink-0 ml-1">
                      {{ lastMsg ? formatTime(lastMsg.createdAt) : '' }}
                    </p>
                  </div>
                  <p [class.font-bold]="conv.unreadCount > 0" class="text-xs truncate mt-0.5 text-gray-500">
                    {{ lastMsg?.senderId === currentUser()?.id ? 'You: ' : '' }}{{ lastMsg?.content || 'No messages yet' }}
                  </p>
                </div>
                @if (conv.unreadCount > 0) {
                  <span class="w-4 h-4 bg-[#CC1016] rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {{ conv.unreadCount }}
                  </span>
                }
              </div>
            }
          </div>
        </div>

        <!-- Right Side: Message Details Panel -->
        @if (activeConversation(); as conv) {
          @let other = getOtherParticipant(conv);
          <div class="flex-1 flex flex-col min-w-0">
            <!-- Detail Header -->
            <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                [style.backgroundColor]="other?.avatarColor || '#0A66C2'"
              >
                {{ other?.avatarInitials || '?' }}
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ other?.name }}</p>
                <p class="text-xs text-gray-500">{{ other?.headline }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div #scrollContainer class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              @for (msg of conv.messages; track msg.id) {
                @let isMine = msg.senderId === currentUser()?.id;
                @let sender = getSender(msg.senderId);
                <div
                  [attr.data-testid]="'message-' + msg.id"
                  [class.flex-row-reverse]="isMine"
                  class="flex items-end gap-2"
                >
                  @if (!isMine) {
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      [style.backgroundColor]="sender?.avatarColor || '#0A66C2'"
                    >
                      {{ sender?.avatarInitials || '?' }}
                    </div>
                  }
                  <div
                    [class.bg-[#0A66C2]]="isMine"
                    [class.text-white]="isMine"
                    [class.rounded-br-none]="isMine"
                    [class.bg-[#F3F2EF]]="!isMine"
                    [class.text-gray-800]="!isMine"
                    [class.rounded-bl-none]="!isMine"
                    class="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  >
                    <p>{{ msg.content }}</p>
                    <p [class.text-blue-200]="isMine" [class.text-gray-400]="!isMine" class="text-[10px] mt-1">
                      {{ formatTime(msg.createdAt) }}
                    </p>
                  </div>
                </div>
              }
            </div>

            <!-- Input -->
            <div class="px-4 py-3 border-t border-gray-200 flex-shrink-0">
              <div class="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-2 focus-within:border-[#0A66C2]">
                <input
                  type="text"
                  [(ngModel)]="newMessageText"
                  (keydown.enter)="handleSend()"
                  placeholder="Write a message..."
                  data-testid="input-message-text"
                  class="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                />
                <button
                  (click)="handleSend()"
                  [disabled]="!newMessageText.trim()"
                  data-testid="button-send-message"
                  class="text-[#0A66C2] disabled:text-gray-300 transition-colors"
                >
                  <!-- Send icon SVG -->
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </div>
        } @else {
          <!-- Empty View state -->
          <div class="flex-1 flex items-center justify-center text-gray-400">
            <div class="text-center">
              <p class="text-lg font-semibold">Select a message</p>
              <p class="text-sm mt-1">Choose from your existing conversations or start a new one.</p>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class MessagingComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  private readonly stateService = inject(StateService);
  private readonly route = inject(ActivatedRoute);

  readonly currentUser = this.stateService.currentUser;
  readonly users = this.stateService.users;
  readonly conversations = this.stateService.conversations;

  searchText = '';
  newMessageText = '';

  activeConvId = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const targetUserId = params['userId'];
      if (targetUserId) {
        const user = this.currentUser();
        if (user) {
          const existing = this.conversations().find(c => c.participantIds.includes(user.id) && c.participantIds.includes(targetUserId));
          if (existing) {
            this.activeConvId.set(existing.id);
          } else {
            this.stateService.sendMessage(null, targetUserId, "Hi, nice to connect!");
            setTimeout(() => {
              const updated = this.conversations().find(c => c.participantIds.includes(user.id) && c.participantIds.includes(targetUserId));
              if (updated) {
                this.activeConvId.set(updated.id);
              }
            }, 600);
          }
        }
      }
    });
  }

  constructor() {
    effect(() => {
      const convs = this.conversations();
      if (convs.length > 0 && !this.activeConvId()) {
        this.activeConvId.set(convs[0].id);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const activeId = this.activeConvId();
      if (activeId) {
        this.stateService.markConversationRead(activeId);
      }
    }, { allowSignalWrites: true });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  filteredConversations = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.conversations().filter((conv) => {
      const other = this.getOtherParticipant(conv);
      return !this.searchText || (other && other.name.toLowerCase().includes(this.searchText.toLowerCase()));
    });
  });

  activeConversation = computed(() => {
    const activeId = this.activeConvId();
    return this.conversations().find((c) => c.id === activeId) || null;
  });

  getOtherParticipant(conv: Conversation): User | undefined {
    const otherId = conv.participantIds.find((id) => id !== this.currentUser()?.id);
    return this.users().find((u) => u.id === otherId);
  }

  getLastMessage(conv: Conversation) {
    if (conv.messages.length === 0) return null;
    return conv.messages[conv.messages.length - 1];
  }

  getSender(senderId: string) {
    return this.users().find((u) => u.id === senderId);
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  selectConversation(convId: string) {
    this.activeConvId.set(convId);
  }

  handleSend() {
    const text = this.newMessageText.trim();
    const activeId = this.activeConvId();
    if (!text || !activeId) return;

    const conv = this.activeConversation();
    const otherId = conv?.participantIds.find((id) => id !== this.currentUser()?.id) || '';

    this.stateService.sendMessage(activeId, otherId, text);
    this.newMessageText = '';
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
