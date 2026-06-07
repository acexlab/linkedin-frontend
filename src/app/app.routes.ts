import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'pub/dir',
    loadComponent: () => import('./pages/people-search/people-search.component').then(m => m.PeopleSearchComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'learning',
    loadComponent: () => import('./pages/learning/learning.component').then(m => m.LearningComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'top-content',
    loadComponent: () => import('./pages/top-content/top-content.component').then(m => m.TopContentComponent),
    canActivate: [guestGuard]
  },
  {
    path: 'signup',
    loadComponent: () => import('./pages/signup/signup.component').then(m => m.SignupComponent),
    canActivate: [guestGuard]
  },
  {
    path: '',
    loadComponent: () => import('./pages/feed/feed.component').then(m => m.FeedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-network',
    loadComponent: () => import('./pages/network/network.component').then(m => m.NetworkComponent),
    canActivate: [authGuard]
  },
  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs.component').then(m => m.JobsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'messaging',
    loadComponent: () => import('./pages/messaging/messaging.component').then(m => m.MessagingComponent),
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.component').then(m => m.NotificationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:userId',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'saved',
    loadComponent: () => import('./pages/saved/saved.component').then(m => m.SavedComponent),
    canActivate: [authGuard]
  },
  {
    path: 'company/:companyId',
    loadComponent: () => import('./pages/company/company.component').then(m => m.CompanyComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics.component').then(m => m.AnalyticsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'business',
    loadComponent: () => import('./pages/business-dashboard/business-dashboard.component').then(m => m.BusinessDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];
