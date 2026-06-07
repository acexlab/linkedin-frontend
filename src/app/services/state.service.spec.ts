import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockRouter } from './state.service.mock';
import { StateService } from './state.service';

describe('StateService', () => {
  let service: StateService;

  beforeEach(() => {
    // Clear localStorage to ensure test isolation
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        StateService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideMockRouter()
      ]
    });
    service = TestBed.inject(StateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should seed data on load', () => {
    expect(service.users().length).toBeGreaterThan(0);
    expect(service.companies().length).toBeGreaterThan(0);
  });

  it('should login valid user successfully', async () => {
    const success = await service.login('alex@example.com', 'password');
    expect(success).toBe(true);
    expect(service.currentUser()).toBeTruthy();
    expect(service.currentUser()?.email).toBe('alex@example.com');
  });

  it('should fail login with invalid credentials', async () => {
    const success = await service.login('alex@example.com', 'wrongpassword');
    expect(success).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should register a new user successfully', async () => {
    const beforeCount = service.users().length;
    await service.register('New User', 'newuser@example.com', 'password', 'candidate');
    expect(service.users().length).toBe(beforeCount + 1);

    const loggedIn = await service.login('newuser@example.com', 'password');
    expect(loggedIn).toBe(true);
  });

  it('should logout user successfully', async () => {
    await service.login('alex@example.com', 'password');
    expect(service.currentUser()).toBeTruthy();
    service.logout();
    expect(service.currentUser()).toBeNull();
  });

  it('should approve a pending business recruiter', async () => {
    // admin login
    await service.login('admin@example.com', 'password');
    // find pending business
    const pendingUser = service.users().find(u => u.id === 'u_pending_biz');
    expect(pendingUser?.isApprovedBusiness).toBeFalsy();

    service.verifyBusiness('u_pending_biz', 'approve');
    const updatedUser = service.users().find(u => u.id === 'u_pending_biz');
    expect(updatedUser?.isApprovedBusiness).toBe(true);
  });

  it('should pay for an ad campaign', async () => {
    // Login as business user so that requestAd does not return empty string
    await service.login('business@example.com', 'password');

    // Request a mock ad campaign
    const adId = service.requestAd({
      title: 'Promote SaaS DevOps',
      companyName: 'TechCorp',
      description: 'DevOps workflow optimization tool.',
      logoText: 'TC',
      logoColor: '#000',
      coverColor: '#fff',
      ctaText: 'Apply Now',
      ctaUrl: 'https://example.com'
    });

    expect(adId).toBeTruthy();

    service.payForAd(adId!, {
      cardNumber: '1111222233334444',
      cardLast4: '4444',
      amount: 24900
    });

    const paidAd = service.ads().find(a => a.id === adId);
    expect(paidAd?.paymentStatus).toBe('paid');
    expect(paidAd?.paymentAmount).toBe(24900);
    expect(paidAd?.transactionId).toContain('TXN-');
  });

  it('should resolve a user incident report', async () => {
    await service.login('admin@example.com', 'password');
    const reports = service.reports();
    expect(reports.length).toBeGreaterThan(0);

    const pendingReport = reports.find(r => r.status === 'pending');
    expect(pendingReport).toBeTruthy();

    service.resolveReport(pendingReport!.id, 'dismiss');
    const resolvedReport = service.reports().find(r => r.id === pendingReport!.id);
    expect(resolvedReport?.status).toBe('resolved');
  });

  it('should cover all post operations: create, edit, delete, like, comment, save', async () => {
    await service.login('alex@example.com', 'password');
    const originalPostCount = service.posts().length;
    
    // create
    service.createPost('Test content', 'image.png');
    expect(service.posts().length).toBe(originalPostCount + 1);
    const post = service.posts()[0];
    expect(post.content).toBe('Test content');
    
    // edit
    service.editPost(post.id, 'Edited content', 'new_image.png');
    expect(service.posts()[0].content).toBe('Edited content');
    
    // like
    service.likePost(post.id);
    expect(service.posts()[0].likes).toContain('u1');
    service.likePost(post.id); // unlike
    expect(service.posts()[0].likes).not.toContain('u1');
    
    // comment
    service.addComment(post.id, 'Nice post');
    expect(service.posts()[0].comments.length).toBe(1);
    
    // save
    service.savePost(post.id);
    expect(service.currentUser()?.savedPosts).toContain(post.id);
    
    // delete
    service.deletePost(post.id);
    expect(service.posts().length).toBe(originalPostCount);
  });

  it('should cover connection operations: status, request, accept, ignore, withdraw, remove', async () => {
    await service.login('alex@example.com', 'password');
    const u3Id = 'u3';
    
    // status
    expect(service.getConnectionStatus(u3Id)).toBe('connected');
    
    // request
    const u9Id = 'u9';
    expect(service.getConnectionStatus(u9Id)).toBe('none');
    service.sendConnectionRequest(u9Id);
    expect(service.getConnectionStatus(u9Id)).toBe('pending_sent');
    
    // withdraw
    service.withdrawConnection(u9Id);
    expect(service.getConnectionStatus(u9Id)).toBe('none');
    
    // accept / ignore (requires pending received)
    // u4 has pending request to u1 (alex)
    const conn = service.connections().find(c => c.fromId === 'u4' && c.toId === 'u1');
    expect(conn).toBeTruthy();
    expect(service.getConnectionStatus('u4')).toBe('pending_received');
    
    service.acceptConnection(conn!.id);
    expect(service.getConnectionStatus('u4')).toBe('connected');
    
    // remove connection
    service.removeConnection('u4');
    expect(service.getConnectionStatus('u4')).toBe('none');
    
    // ignore connection
    // cn4 is from u5 to u1 pending
    const conn5 = service.connections().find(c => c.fromId === 'u5' && c.toId === 'u1');
    expect(conn5).toBeTruthy();
    service.ignoreConnection(conn5!.id);
    expect(service.getConnectionStatus('u5')).toBe('none');
  });

  it('should cover message operations', async () => {
    await service.login('alex@example.com', 'password');
    
    // send message in existing conversation
    const conv = service.conversations()[0];
    const prevMsgCount = conv.messages.length;
    service.sendMessage(conv.id, 'u2', 'Hello');
    expect(service.conversations()[0].messages.length).toBe(prevMsgCount + 1);
    
    // send message in new conversation
    service.sendMessage(null, 'u7', 'Hello David');
    const newConv = service.conversations().find(c => c.participantIds.includes('u7'));
    expect(newConv).toBeTruthy();
    
    // mark read
    service.markConversationRead(conv.id);
    expect(service.conversations()[0].unreadCount).toBe(0);
  });

  it('should cover job operations: apply, save, withdraw, post, alert', async () => {
    await service.login('alex@example.com', 'password');
    
    // save job
    service.saveJob('j2');
    expect(service.currentUser()?.savedJobs).toContain('j2');
    
    // apply
    service.applyToJob('j2');
    expect(service.applications().length).toBeGreaterThan(0);
    
    // withdraw app
    service.withdrawApplication('j2');
    
    // add job alert
    service.addJobAlert('Manager', 'Thrissur', 'Full-time');
    expect(service.jobAlerts().length).toBe(1);
    
    // delete job alert
    service.deleteJobAlert(service.jobAlerts()[0].id);
    expect(service.jobAlerts().length).toBe(0);
    
    // post job by business
    service.logout();
    await service.login('business@example.com', 'password');
    const initialJobs = service.jobs().length;
    service.postJobByBusiness({
      title: 'New Role',
      company: 'NeST Group',
      companyId: 'co_nest',
      location: 'Kochi',
      type: 'Full-time',
      salary: '₹10,00,000 / year',
      description: 'Desc',
      logo: 'NG',
      workplaceType: 'Hybrid',
      easyApply: true
    });
    expect(service.jobs().length).toBe(initialJobs + 1);
  });

  it('should cover profile and other operations: view, openToWork, followCompany, update, followUser', async () => {
    await service.login('alex@example.com', 'password');
    
    // record view
    service.recordProfileView('u2');
    
    // open to work
    const currentOpen = service.currentUser()?.openToWork;
    service.toggleOpenToWork();
    expect(service.currentUser()?.openToWork).toBe(!currentOpen);
    
    // follow company
    service.followCompany('co1');
    
    // update profile
    service.updateProfile({ headline: 'New Headline' });
    expect(service.currentUser()?.headline).toBe('New Headline');
    
    // follow user
    service.followUser('u2');
    expect(service.currentUser()?.following).toContain('u2');
    
    // notifications
    const n = service.notifications()[0];
    service.markNotificationRead(n.id);
    service.markAllNotificationsRead();
    
    // business approvals
    service.logout();
    await service.login('admin@example.com', 'password');
    service.approveJob('j1');
    service.rejectJob('j1');
    service.approveAd('ad1');
    service.rejectAd('ad1');
  });

  it('should cover company profile updates', async () => {
    await service.login('business@example.com', 'password');
    service.updateCompanyDetails('co_nest', { tagline: 'Updated tagline' });
    const company = service.companies().find(c => c.id === 'co_nest');
    expect(company?.tagline).toBe('Updated tagline');
  });

  it('should run migrations in loadData when storage has older data', () => {
    // Clear and set outdated data
    localStorage.clear();
    const oldData = {
      currentUserId: 'u1',
      users: [{ id: 'u1', email: 'alex@example.com', password: 'password', experience: [], education: [], skills: [] }],
      companies: [{ id: 'co1', name: 'Google', employeeIds: [] }],
      jobs: [],
      connections: [],
      conversations: [],
      notifications: []
    };
    localStorage.setItem('linkedin_clone_data_v2', JSON.stringify(oldData));
    
    // Inject and instantiate service again to trigger constructor -> loadData()
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [StateService]
    });
    const newService = TestBed.inject(StateService);
    
    // Verify migrations ran
    expect(newService.users().some(u => u.id === 'u13')).toBe(true);
    expect(newService.companies().some(c => c.id === 'co_nest')).toBe(true);
    expect(newService.users().some(u => u.email === 'admin@example.com')).toBe(true);
  });

  it('should evaluate lazy computed signals: rankedFeed, recommendedConnections, recommendedJobs, profileViewsList', async () => {
    await service.login('alex@example.com', 'password');
    
    // Read computed signals to force evaluation
    const feed = service.rankedFeed();
    expect(feed.length).toBeGreaterThan(0);

    const conns = service.recommendedConnections();
    expect(conns.length).toBeGreaterThan(0);

    const jobs = service.recommendedJobs();
    expect(jobs.length).toBeGreaterThan(0);

    const views = service.profileViewsList();
    expect(views).toBeDefined();
  });

  it('should resolve reports with delete_post and block_user actions', async () => {
    await service.login('admin@example.com', 'password');
    
    // Test report user or post method
    service.reportUserOrPost('u1', 'u2', 'p2', 'Spam', 'spam post');
    const newReport = service.reports()[0];
    expect(newReport).toBeTruthy();
    
    // Resolve report with delete_post
    service.resolveReport(newReport.id, 'delete_post');
    expect(service.posts().find(p => p.id === 'p2')).toBeFalsy();
    
    // Create another report and resolve with block_user
    service.reportUserOrPost('u1', 'u2', undefined, 'Harassment');
    const report2 = service.reports()[0];
    service.resolveReport(report2.id, 'block_user');
    expect(service.users().find(u => u.id === 'u2')).toBeFalsy();
  });

  it('should cover ad approval and rejection', async () => {
    await service.login('business@example.com', 'password');
    const adId = service.requestAd({
      title: 'Ad',
      companyName: 'Company',
      description: 'Desc',
      logoText: 'L',
      logoColor: '#000',
      coverColor: '#fff',
      ctaText: 'Apply',
      ctaUrl: 'http://example.com'
    });
    
    service.logout();
    await service.login('admin@example.com', 'password');
    
    // approve ad
    service.approveAd(adId);
    expect(service.ads().find(a => a.id === adId)?.status).toBe('approved');
    
    // reject ad
    service.rejectAd(adId);
    expect(service.ads().find(a => a.id === adId)?.status).toBe('rejected');
  });

  it('should cover additional branch conditions in messaging and following', async () => {
    await service.login('alex@example.com', 'password');
    
    // Send message with null conversationId to existing participant to match conversation branch
    service.sendMessage(null, 'u2', 'Hi again');
    
    // Follow company twice to cover unfollow branch
    service.followCompany('co1');
    service.followCompany('co1');
  });
});
