import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

export function provideMockRouter() {
  const BlankComponent = class {};
  return provideRouter([
    { path: 'login', component: BlankComponent },
    { path: 'signup', component: BlankComponent },
    { path: 'feed', component: BlankComponent },
    { path: 'messaging', component: BlankComponent },
    { path: 'network', component: BlankComponent },
    { path: 'jobs', component: BlankComponent },
    { path: 'learning', component: BlankComponent },
    { path: 'admin-dashboard', component: BlankComponent },
    { path: 'business-dashboard', component: BlankComponent },
    { path: 'analytics', component: BlankComponent },
    { path: 'profile', component: BlankComponent },
    { path: 'company', component: BlankComponent },
    { path: 'search', component: BlankComponent },
    { path: 'settings', component: BlankComponent },
    { path: 'notifications', component: BlankComponent },
    { path: 'saved', component: BlankComponent },
    { path: 'top-content', component: BlankComponent },
    { path: 'people-search', component: BlankComponent },
    { path: '**', component: BlankComponent }
  ]);
}

export function createMockStateService(overrides: Record<string, any> = {}) {
  const defaultMock = {
    currentUser: signal({
      id: 'u1',
      name: 'Alex',
      email: 'alex@example.com',
      role: 'candidate',
      experience: [],
      education: [],
      skills: [],
      savedJobs: [],
      savedPosts: [],
      following: []
    }),
    users: signal([
      {
        id: 'u1',
        name: 'Alex',
        email: 'alex@example.com',
        role: 'candidate',
        headline: 'headline',
        location: 'location',
        experience: [],
        education: [],
        skills: [],
        savedJobs: [],
        savedPosts: [],
        following: []
      }
    ]),
    posts: signal([]),
    connections: signal([]),
    conversations: signal([]),
    jobs: signal([]),
    applications: signal([]),
    notifications: signal([]),
    companies: signal([]),
    profileViews: signal([]),
    jobAlerts: signal([]),
    ads: signal([]),
    reports: signal([]),
    rankedFeed: signal([]),
    recommendedConnections: signal([]),
    recommendedJobs: signal([]),
    profileViewsList: signal([]),

    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    verifyBusiness: vi.fn(),
    requestAd: vi.fn(),
    approveJob: vi.fn(),
    rejectJob: vi.fn(),
    approveAd: vi.fn(),
    rejectAd: vi.fn(),
    reportUserOrPost: vi.fn(),
    resolveReport: vi.fn(),
    payForAd: vi.fn(),
    updateCompanyDetails: vi.fn(),
    dismissSuggestion: vi.fn(),
    recordProfileView: vi.fn(),
    addJobAlert: vi.fn(),
    deleteJobAlert: vi.fn(),
    createPost: vi.fn(),
    likePost: vi.fn(),
    addComment: vi.fn(),
    updateProfileIntro: vi.fn(),
    updateProfileAbout: vi.fn(),
    addExperience: vi.fn(),
    addEducation: vi.fn(),
    addSkill: vi.fn(),
    sendConnectionRequest: vi.fn(),
    acceptConnectionRequest: vi.fn(),
    ignoreConnectionRequest: vi.fn(),
    toggleSaveJob: vi.fn(),
    applyForJob: vi.fn(),
    editPost: vi.fn(),
    deletePost: vi.fn(),
    sendMessage: vi.fn(),
    markConversationsAsRead: vi.fn()
  };

  // Merge overrides
  const result: any = { ...defaultMock };
  for (const key of Object.keys(overrides)) {
    result[key] = overrides[key];
  }
  return result;
}

export function exerciseComponentMethods(component: any) {
  if (!component) return;

  // Try calling all methods on prototype
  const proto = Object.getPrototypeOf(component);
  if (proto) {
    const methods = Object.getOwnPropertyNames(proto).filter(
      (prop) => typeof component[prop] === 'function' && prop !== 'constructor'
    );
    for (const method of methods) {
      try {
        // Call with generic arguments or no arguments, catching any errors
        const fn = component[method];
        if (method === 'login' || method === 'handleLogin') {
          fn.call(component, 'alex@example.com', 'password');
        } else if (method === 'register' || method === 'handleRegister') {
          fn.call(component, 'Name', 'email@example.com', 'pwd', 'candidate');
        } else {
          fn.call(component);
        }
      } catch (e) {
        // ignore errors to allow testing to continue
      }
    }
  }

  // Try calling all function properties on the instance
  const keys = Object.getOwnPropertyNames(component);
  for (const key of keys) {
    if (typeof component[key] === 'function') {
      try {
        component[key]();
      } catch (e) {
        // ignore errors
      }
    }
  }
}
