import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { Post, User, Comment } from '../../services/state.types';
import { timeAgo } from '../../services/utils';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="max-w-[1128px] mx-auto px-4 py-4 mt-14">
      <div class="grid grid-cols-1 lg:grid-cols-[225px_1fr_290px] gap-4">

        <!-- LEFT SIDEBAR (MAPPED TO SCREENSHOT) -->
        <div class="hidden lg:block space-y-2">
          <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden shadow-xs">
            <!-- Cover image background -->
            <div class="relative group h-16 w-full bg-[#E0DFDC]">
              @if (currentUser()?.coverUrl) {
                <img [src]="currentUser()!.coverUrl" class="w-full h-full object-cover" alt="Cover" />
              } @else {
                <div class="w-full h-full" [style.background]="currentUser()?.coverColor || 'linear-gradient(135deg, #0A66C2, #004182)'"></div>
              }
              <!-- Hidden File Input for Cover Photo -->
              <input type="file" #coverInput (change)="onUploadCover($event)" class="hidden" accept="image/*" />
              <button (click)="coverInput.click()" class="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-[10px] cursor-pointer" title="Change Cover Banner">
                📷 Edit
              </button>
            </div>
            
            <div class="px-4 pb-4 -mt-10 flex flex-col items-center text-center relative">
              <!-- Profile Avatar -->
              <div class="relative group w-20 h-20 rounded-full border-2 border-white overflow-hidden shadow-sm flex items-center justify-center bg-[#0A66C2]">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover" alt="Profile" />
                } @else {
                  <span class="text-white font-bold text-2xl">{{ currentUser()?.avatarInitials }}</span>
                }
                <!-- Hover Upload Overlay -->
                <input type="file" #avatarInput (change)="onUploadAvatar($event)" class="hidden" accept="image/*" />
                <button (click)="avatarInput.click()" class="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold cursor-pointer">
                  Update
                </button>
              </div>

              <!-- Name and Headline -->
              <a [routerLink]="['/profile', currentUser()?.id]">
                <p class="font-semibold text-gray-900 text-sm mt-3 hover:text-[#0A66C2] hover:underline cursor-pointer">{{ currentUser()?.name }}</p>
              </a>
              <p class="text-xs text-gray-500 mt-1 leading-tight line-clamp-2">{{ currentUser()?.headline }}</p>
              <p class="text-[10px] text-gray-400 mt-1">{{ currentUser()?.location }}</p>

              <!-- Button: Experience -->
              <button [routerLink]="['/profile', currentUser()?.id]" class="mt-3 w-full border border-gray-300 hover:border-gray-500 text-gray-600 font-semibold text-xs py-1.5 px-3 rounded hover:bg-gray-50 transition-colors">
                + Experience
              </button>

              <!-- Redeem Premium Section -->
              <div class="w-full mt-4 pt-3 border-t border-gray-200 text-left">
                <span class="text-[10px] text-gray-400 block font-semibold">Gain exclusive tools & insights</span>
                <a routerLink="/login" class="text-xs text-gray-800 hover:text-[#0A66C2] font-semibold flex items-center gap-1.5 mt-0.5">
                  <span class="w-3 h-3 bg-amber-500 rounded-xs inline-block"></span>
                  Redeem Premium for ₹0
                </a>
              </div>

              <!-- Analytics counts -->
              <div class="w-full mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-left">
                <div class="flex justify-between text-xs">
                  <span class="text-gray-500">Profile viewers</span>
                  <span class="text-[#0A66C2] font-semibold">13</span>
                </div>
                <a [routerLink]="['/profile', currentUser()?.id]" class="text-xs text-[#0A66C2] font-semibold hover:underline block mt-0.5">
                  View all analytics
                </a>
              </div>

            </div>
          </div>

          <!-- Bottom Left List Links -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] shadow-sm divide-y divide-gray-100 overflow-hidden">
            <a routerLink="/saved" class="flex items-center gap-2 px-4 py-3 text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
              <span>Saved items</span>
            </a>
            <a routerLink="/login" class="flex items-center gap-2 px-4 py-3 text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <span class="text-gray-500 font-bold text-sm">👥</span>
              <span>Groups</span>
            </a>
            <a routerLink="/login" class="flex items-center gap-2 px-4 py-3 text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <span class="text-gray-500 font-bold text-sm">📰</span>
              <span>Newsletters</span>
            </a>
            <a routerLink="/login" class="flex items-center gap-2 px-4 py-3 text-xs text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
              <span class="text-gray-500 font-bold text-sm">📅</span>
              <span>Events</span>
            </a>
          </div>
        </div>

        <!-- MAIN FEED -->
        <div class="space-y-3">
          <div class="bg-white rounded-lg border border-[#E0DFDC] px-4 py-3 shadow-xs">
            <div class="flex items-center gap-3">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-[#0A66C2]">
                @if (currentUser()?.avatarUrl) {
                  <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover rounded-full" alt="Me" />
                } @else {
                  <span>{{ currentUser()?.avatarInitials || '?' }}</span>
                }
              </div>
              <button (click)="openPostModal()" data-testid="button-start-post" class="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm text-gray-500 font-semibold hover:bg-gray-100 text-left transition-colors cursor-pointer">
                Start a post
              </button>
            </div>
            <div class="flex items-center gap-1 mt-3 pt-2 border-t border-gray-100">
              <input type="file" #directImageInput (change)="onUploadPostImage($event); openPostModalWithImagePreloaded()" class="hidden" accept="image/*" />
              <button (click)="directImageInput.click()" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors flex-1 justify-center cursor-pointer">
                <svg class="w-4 h-4 text-[#378FE9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span>Photo</span>
              </button>
              <button (click)="openPostModal()" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors flex-1 justify-center cursor-pointer">
                <svg class="w-4 h-4 text-[#C37D16]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <span>Video</span>
              </button>
              <button (click)="openPostModal()" class="flex items-center gap-2 px-3 py-2 rounded text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors flex-1 justify-center cursor-pointer">
                <svg class="w-4 h-4 text-[#E06847]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                <span>Write article</span>
              </button>
            </div>
          </div>

          <!-- POST CARDS LIST -->
          @for (post of posts(); track post.id) {
            <div class="bg-white rounded-lg border border-[#E0DFDC] overflow-hidden shadow-xs" [attr.data-testid]="'card-post-' + post.id">
              <div class="px-4 pt-3 pb-0">
                <div class="flex items-start justify-between">
                  <a [routerLink]="['/profile', getAuthor(post)?.id]" class="flex items-start gap-2 group">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-[#0A66C2]">
                      @if (getAuthor(post)?.avatarUrl) {
                        <img [src]="getAuthor(post)!.avatarUrl" class="w-full h-full object-cover rounded-full" alt="Author" />
                      } @else {
                        <span>{{ getAuthor(post)?.avatarInitials || '?' }}</span>
                      }
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900 text-sm group-hover:text-[#0A66C2] group-hover:underline leading-tight">{{ getAuthor(post)?.name }}</p>
                      <p class="text-[11px] text-gray-500 leading-tight mt-0.5">{{ getAuthor(post)?.headline }}</p>
                      <p class="text-[10px] text-gray-400 mt-0.5">{{ formatTime(post.createdAt) }} &bull; <span title="Public">🌐</span></p>
                    </div>
                  </a>
                  <div class="flex items-center gap-1">
                    <button (click)="toggleSavePost(post.id)" [title]="isPostSaved(post.id) ? 'Unsave' : 'Save'" [class]="'p-1.5 rounded-full hover:bg-gray-100 ' + (isPostSaved(post.id) ? 'text-[#0A66C2]' : 'text-gray-400')">
                      <svg class="w-4 h-4" [attr.fill]="isPostSaved(post.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    </button>
                    <div class="relative">
                      <button (click)="togglePostMenu(post.id)" class="p-1 hover:bg-gray-100 rounded-full text-gray-500" [attr.data-testid]="'button-post-menu-' + post.id">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                      </button>
                      @if (activePostMenuId() === post.id) {
                        <div class="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-44 py-1" (click)="$event.stopPropagation()">
                          @if (isOwnPost(post)) {
                            <button (click)="triggerEditPost(post)" class="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left">
                              <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              Edit post
                            </button>
                            <button (click)="deletePost(post.id)" class="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left">
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Delete post
                            </button>
                          }
                          <button (click)="toggleSavePost(post.id)" class="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 text-left">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                            {{ isPostSaved(post.id) ? 'Unsave' : 'Save post' }}
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Post Content Text -->
              <div class="px-4 py-2">
                <p class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{{ post.content }}</p>
              </div>

              <!-- Render Job Update Visual Segment -->
              @if (post.isJobUpdate) {
                <div class="mx-4 my-2 p-6 bg-[#EDE7F6] rounded-lg border border-[#D1C4E9] flex flex-col items-center text-center space-y-4">
                  <div class="relative">
                    @if (getAuthor(post)?.avatarUrl) {
                      <img [src]="getAuthor(post)!.avatarUrl" class="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt="Avatar" />
                    } @else {
                      <div class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl" [style.backgroundColor]="getAuthor(post)?.avatarColor || '#0A66C2'">
                        {{ getAuthor(post)?.avatarInitials }}
                      </div>
                    }
                    <span class="absolute bottom-0 right-0 bg-purple-700 text-white rounded-full p-1 text-[10px] w-5 h-5 flex items-center justify-center shadow-xs">
                      🔒
                    </span>
                  </div>

                  <div>
                    <h4 class="font-bold text-gray-900 text-sm">
                      {{ getAuthor(post)?.name }} started a new position
                    </h4>
                    <p class="text-xs text-purple-800 font-semibold mt-1">
                      {{ getAuthor(post)?.headline }}
                    </p>
                  </div>
                </div>
              }

              <!-- Render Attached Post Image -->
              @if (post.image) {
                <div class="border-t border-gray-100">
                  <img [src]="post.image" class="w-full max-h-[420px] object-cover" alt="Post attachment" />
                </div>
              }

              <!-- Likes/Comments Count details -->
              @if (post.likes.length > 0 || post.comments.length > 0) {
                <div class="px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
                  @if (post.likes.length > 0) {
                    <span class="flex items-center gap-1 cursor-pointer hover:underline">
                      <span class="inline-flex items-center justify-center w-4 h-4 bg-[#0A66C2] rounded-full text-[9px] text-white">
                        👍
                      </span>
                      {{ post.likes.length }}
                    </span>
                  }
                  @if (post.comments.length > 0) {
                    <button (click)="toggleComments(post.id)" class="ml-auto hover:underline">
                      {{ post.comments.length }} comment{{ post.comments.length !== 1 ? 's' : '' }}
                    </button>
                  }
                </div>
              }

              <!-- Interactive Reaction Actions: Like, Comment, Repost, Send -->
              <div class="px-2 py-1 border-t border-gray-100 flex items-center relative">
                <div class="flex-1 relative" (mouseenter)="showReactionsBox(post.id)" (mouseleave)="hideReactionsBox(post.id)">
                  <button
                    (click)="likePost(post.id)"
                    [attr.data-testid]="'button-like-' + post.id"
                    [class]="'w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-colors hover:bg-gray-100 ' + (isPostLiked(post) ? 'text-[#0A66C2]' : 'text-gray-500')"
                  >
                    <svg class="w-4 h-4" [attr.fill]="isPostLiked(post) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
                    <span>Like</span>
                  </button>

                  @if (reactionPickerPostId() === post.id) {
                    <div class="absolute bottom-10 left-0 bg-white border border-gray-200 rounded-full shadow-lg flex items-center px-2 py-1.5 gap-1.5 z-30 animate-in fade-in zoom-in-75 duration-200">
                      @for (react of reactions; track react.label) {
                        <button
                          (click)="likePost(post.id); hideReactionsBox(post.id)"
                          [title]="react.label"
                          class="text-xl hover:scale-125 transition-transform focus:outline-none cursor-pointer"
                        >
                          {{ react.emoji }}
                        </button>
                      }
                    </div>
                  }
                </div>

                <button (click)="toggleComments(post.id)" [attr.data-testid]="'button-comment-' + post.id" class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-colors hover:bg-gray-100 text-gray-500 cursor-pointer">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <span>Comment</span>
                </button>

                <button class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-colors hover:bg-gray-100 text-gray-500">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" /></svg>
                  <span>Repost</span>
                </button>

                <button class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-colors hover:bg-gray-100 text-gray-500">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  <span>Send</span>
                </button>
              </div>

              <!-- Job Quick Feedback buttons row -->
              @if (post.isJobUpdate) {
                <div class="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
                  <button (click)="submitQuickComment(post.id, 'Congratulations!')" class="border border-gray-300 hover:border-gray-500 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold rounded-full px-3 py-1.5 flex-shrink-0 transition-colors cursor-pointer">
                    Congratulations! 👏
                  </button>
                  <button (click)="submitQuickComment(post.id, 'Wishing you the best!')" class="border border-gray-300 hover:border-gray-500 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold rounded-full px-3 py-1.5 flex-shrink-0 transition-colors cursor-pointer">
                    Wishing you the best!
                  </button>
                  <button (click)="submitQuickComment(post.id, 'Excited for you!')" class="border border-gray-300 hover:border-gray-500 text-gray-700 hover:bg-gray-100 text-[11px] font-semibold rounded-full px-3 py-1.5 flex-shrink-0 transition-colors cursor-pointer">
                    Excited for you!
                  </button>
                </div>
              }

              <!-- COMMENTS CONTAINER PANEL -->
              @if (activeCommentsPostId() === post.id) {
                <div class="px-4 pb-3 border-t border-gray-100 bg-gray-50">
                  <!-- Comments list -->
                  @for (c of post.comments; track c.id) {
                    <div class="flex items-start gap-2 mt-3" [attr.data-testid]="'comment-' + c.id">
                      <!-- Comment Author Avatar -->
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#0A66C2]">
                        @if (getAuthorById(c.authorId)?.avatarUrl) {
                          <img [src]="getAuthorById(c.authorId)!.avatarUrl" class="w-full h-full object-cover rounded-full" alt="Author" />
                        } @else {
                          <span>{{ getAuthorById(c.authorId)?.avatarInitials || '?' }}</span>
                        }
                      </div>
                      <div class="bg-white rounded-2xl px-3 py-2 flex-1 border border-gray-200">
                        <p class="font-semibold text-xs text-gray-900">{{ getAuthorById(c.authorId)?.name }}</p>
                        <p class="text-xs text-gray-700 mt-0.5">{{ c.content }}</p>
                      </div>
                    </div>
                  }

                  <!-- Add Comment Form box -->
                  <div class="flex items-center gap-2 mt-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-[#0A66C2]">
                      @if (currentUser()?.avatarUrl) {
                        <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover rounded-full" alt="Me" />
                      } @else {
                        <span>{{ currentUser()?.avatarInitials }}</span>
                      }
                    </div>
                    <div class="flex-1 flex items-center border border-gray-300 rounded-full overflow-hidden bg-white">
                      <input
                        type="text"
                        [(ngModel)]="commentTexts[post.id]"
                        (keydown.enter)="submitComment(post.id)"
                        placeholder="Add a comment..."
                        [attr.data-testid]="'input-comment-' + post.id"
                        class="flex-1 px-4 py-2 text-xs outline-none bg-transparent"
                      />
                      <button (click)="submitComment(post.id)" [disabled]="!commentTexts[post.id]?.trim()" [attr.data-testid]="'button-submit-comment-' + post.id" class="pr-3 text-[#0A66C2] disabled:text-gray-300 cursor-pointer">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- RIGHT SIDEBAR (RECOMMENDATIONS & NEWS widget) -->
        <div class="hidden lg:block space-y-2">
          <!-- LinkedIn News widget (Replicated from screenshot) -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] px-4 py-3 shadow-sm space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-gray-900">LinkedIn News</h3>
              <span class="text-xs text-gray-400 cursor-pointer" title="News info">ℹ️</span>
            </div>
            
            <div class="space-y-2.5">
              @for (news of newsList; track news.title) {
                <div class="cursor-pointer group">
                  <p class="text-xs font-semibold text-gray-700 group-hover:text-[#0A66C2] group-hover:underline leading-snug">
                    {{ news.title }}
                  </p>
                  <p class="text-[10px] text-gray-400 mt-0.5">
                    {{ news.time }} &bull; {{ news.readers }} readers
                  </p>
                </div>
              }
            </div>

            <button class="text-xs text-gray-500 font-semibold hover:text-gray-800 flex items-center gap-1 border-t border-gray-100 pt-2 w-full text-left">
              Show more news ▼
            </button>
          </div>

          <!-- Today's Puzzles Widget (Replicated from screenshot) -->
          <div class="bg-white rounded-lg border border-[#E0DFDC] px-4 py-3 shadow-sm space-y-3">
            <h3 class="text-sm font-semibold text-gray-900">Today's puzzles</h3>
            
            <div class="space-y-3">
              @for (puzzle of puzzleList; track puzzle.name) {
                <div class="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors group">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ puzzle.emoji }}</span>
                    <div>
                      <p class="text-xs font-semibold text-gray-800 group-hover:text-[#0A66C2] leading-tight">
                        {{ puzzle.name }}
                      </p>
                      <p class="text-[10px] text-gray-400">
                        {{ puzzle.desc }}
                      </p>
                    </div>
                  </div>
                  <span class="text-gray-400 group-hover:text-gray-600 text-xs font-bold">&gt;</span>
                </div>
              }
            </div>

            <button class="text-xs text-gray-500 font-semibold hover:text-gray-800 flex items-center gap-1 border-t border-gray-100 pt-2 w-full text-left">
              Show more ▼
            </button>
          </div>
        </div>
      </div>

      <!-- CREATE / EDIT POST MODAL OVERLAY -->
      @if (showPostModal()) {
        <div class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-16">
          <div class="bg-white rounded-xl w-full max-w-[552px] shadow-xl overflow-hidden" data-testid="modal-create-post">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 class="font-semibold text-gray-900 text-lg">{{ editingPost() ? 'Edit post' : 'Create a post' }}</h2>
              <button (click)="closePostModal()" class="p-1 hover:bg-gray-100 rounded-full cursor-pointer">
                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div class="px-6 py-4">
              <div class="flex items-start gap-3 mb-4">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 bg-[#0A66C2]">
                  @if (currentUser()?.avatarUrl) {
                    <img [src]="currentUser()!.avatarUrl" class="w-full h-full object-cover rounded-full" alt="Me" />
                  } @else {
                    <span>{{ currentUser()?.avatarInitials }}</span>
                  }
                </div>
                <div>
                  <p class="font-semibold text-gray-900 text-sm">{{ currentUser()?.name }}</p>
                  <button class="text-xs text-gray-600 border border-gray-400 rounded-full px-2 py-0.5 mt-0.5 hover:bg-gray-100">Anyone</button>
                </div>
              </div>

              <textarea
                autoFocus
                [(ngModel)]="postContent"
                data-testid="textarea-post-content"
                placeholder="What do you want to talk about?"
                class="w-full min-h-[120px] text-gray-800 placeholder-gray-400 text-base resize-none outline-none"
              ></textarea>

              <!-- Image Attachment Preview inside Modal -->
              @if (postImagePreview()) {
                <div class="relative mt-2 border border-gray-200 rounded overflow-hidden max-h-[200px] bg-gray-50 flex items-center justify-center">
                  <img [src]="postImagePreview()!" class="max-h-[200px] object-contain w-full" alt="Post Image Preview" />
                  <button (click)="removePostImage()" class="absolute top-2 right-2 bg-black/75 hover:bg-black/90 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs focus:outline-none cursor-pointer">
                    ✕
                  </button>
                </div>
              }
            </div>

            <div class="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <!-- Upload Action Icons -->
              <div class="flex items-center gap-1">
                <input type="file" #modalImageInput (change)="onUploadPostImage($event)" class="hidden" accept="image/*" />
                <button (click)="modalImageInput.click()" title="Add Photo" class="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer">
                  <svg class="w-5 h-5 text-[#378FE9]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </button>
                <button title="Mock Attachment Option" class="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900">
                  <svg class="w-5 h-5 text-[#C37D16]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </button>
              </div>
              <button
                (click)="submitPost()"
                [disabled]="!postContent.trim() && !postImagePreview()"
                data-testid="button-post-submit"
                class="bg-[#0A66C2] hover:bg-[#004182] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full px-5 py-1.5 transition-colors cursor-pointer"
              >
                {{ editingPost() ? 'Save' : 'Post' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class FeedComponent {
  private readonly stateService = inject(StateService);

  readonly currentUser = this.stateService.currentUser;
  readonly posts = this.stateService.rankedFeed;
  readonly users = this.stateService.users;
  readonly connections = this.stateService.connections;

  commentTexts: { [key: string]: string } = {};

  activePostMenuId = signal<string | null>(null);
  activeCommentsPostId = signal<string | null>(null);
  reactionPickerPostId = signal<string | null>(null);

  showPostModal = signal(false);
  editingPost = signal<Post | null>(null);
  postContent = '';
  postImagePreview = signal<string | null>(null);

  reactions = [
    { emoji: "👍", label: "Like" },
    { emoji: "🎉", label: "Celebrate" },
    { emoji: "❤️", label: "Love" },
    { emoji: "💡", label: "Insightful" },
    { emoji: "🤝", label: "Support" },
    { emoji: "😄", label: "Funny" }
  ];

  newsList = [
    { title: "IndiGo suspends flights to six internation...", time: "1d ago", readers: "3,018" },
    { title: "GCCs outpace IT services firms in tech ...", time: "21h ago", readers: "1,444" },
    { title: "RBI holds repo rate steady again", time: "21h ago", readers: "96" },
    { title: "More Indian viewers bat for live sports", time: "21h ago", readers: "589" },
    { title: "Insurance CEOs leave stability for startup ...", time: "1d ago", readers: "561" }
  ];

  puzzleList = [
    { emoji: "🧩", name: "Patches #81", desc: "1 connection played" },
    { emoji: "🍎", name: "Zip #446", desc: "Complete the path" },
    { emoji: "🔢", name: "Mini Sudoku #299", desc: "The classic game, made mini" },
    { emoji: "🍊", name: "Tango #607", desc: "Harmonize the grid" }
  ];

  connectedIds = computed(() => {
    const user = this.currentUser();
    if (!user) return [];
    return this.connections()
      .filter((c) => c.status === "accepted" && (c.fromId === user.id || c.toId === user.id))
      .map((c) => (c.fromId === user.id ? c.toId : c.fromId));
  });

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('click', () => {
        this.activePostMenuId.set(null);
      });
    }
  }

  formatTime(isoDate: string) {
    return timeAgo(isoDate);
  }

  getAuthor(post: Post): User | undefined {
    return this.users().find((u) => u.id === post.authorId);
  }

  getAuthorById(authorId: string): User | undefined {
    return this.users().find((u) => u.id === authorId);
  }

  isPostSaved(postId: string): boolean {
    return this.currentUser()?.savedPosts?.includes(postId) || false;
  }

  isPostLiked(post: Post): boolean {
    const user = this.currentUser();
    return user ? post.likes.includes(user.id) : false;
  }

  isOwnPost(post: Post): boolean {
    return this.currentUser()?.id === post.authorId;
  }

  toggleSavePost(postId: string) {
    this.stateService.savePost(postId);
  }

  togglePostMenu(postId: string) {
    event?.stopPropagation();
    if (this.activePostMenuId() === postId) {
      this.activePostMenuId.set(null);
    } else {
      this.activePostMenuId.set(postId);
    }
  }

  toggleComments(postId: string) {
    if (this.activeCommentsPostId() === postId) {
      this.activeCommentsPostId.set(null);
    } else {
      this.activeCommentsPostId.set(postId);
    }
  }

  showReactionsBox(postId: string) {
    this.reactionPickerPostId.set(postId);
  }

  hideReactionsBox(postId: string) {
    this.reactionPickerPostId.set(null);
  }

  likePost(postId: string) {
    this.stateService.likePost(postId);
  }

  submitComment(postId: string) {
    const text = this.commentTexts[postId];
    if (!text || !text.trim()) return;
    this.stateService.addComment(postId, text.trim());
    this.commentTexts[postId] = '';
  }

  submitQuickComment(postId: string, text: string) {
    this.stateService.addComment(postId, text);
  }

  deletePost(postId: string) {
    this.stateService.deletePost(postId);
  }

  openPostModal() {
    this.editingPost.set(null);
    this.postContent = '';
    this.postImagePreview.set(null);
    this.showPostModal.set(true);
  }

  openPostModalWithImagePreloaded() {
    // Modal is opened, the preview was already set by the change listener
    this.showPostModal.set(true);
  }

  triggerEditPost(post: Post) {
    this.editingPost.set(post);
    this.postContent = post.content;
    this.postImagePreview.set(post.image || null);
    this.showPostModal.set(true);
  }

  closePostModal() {
    this.showPostModal.set(false);
    this.editingPost.set(null);
    this.postContent = '';
    this.postImagePreview.set(null);
  }

  submitPost() {
    const editing = this.editingPost();
    const image = this.postImagePreview() || undefined;
    if (editing) {
      this.stateService.editPost(editing.id, this.postContent.trim(), image);
    } else {
      this.stateService.createPost(this.postContent.trim(), image);
    }
    this.closePostModal();
  }

  // Profile Banner / Avatar Image Upload handlers
  onUploadAvatar(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.stateService.updateProfile({ avatarUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  onUploadCover(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.stateService.updateProfile({ coverUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  onUploadPostImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      this.postImagePreview.set(base64);
    };
    reader.readAsDataURL(file);
  }

  removePostImage() {
    this.postImagePreview.set(null);
  }
}
