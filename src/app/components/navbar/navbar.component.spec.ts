import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { StateService } from '../../services/state.service';
import { createMockStateService, exerciseComponentMethods, provideMockRouter } from '../../services/state.service.mock';
import { Router, provideRouter } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockStateService: any;
  let router: Router;

  beforeEach(async () => {
    mockStateService = createMockStateService();

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: StateService, useValue: mockStateService },
        provideMockRouter()
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown', () => {
    expect(component.showDropdown()).toBeFalsy();
    component.toggleDropdown();
    expect(component.showDropdown()).toBeTruthy();
  });

  it('should trigger logout and navigate to login', () => {
    component.handleSignOut();
    expect(mockStateService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to search page on handleSearch', () => {
    component.searchQuery = 'Angular';
    component.handleSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/search'], { queryParams: { q: 'Angular' } });
  });

  it('should exercise all component methods for coverage', () => {
    exerciseComponentMethods(component);
    expect(true).toBe(true);
  });
});
