import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { App } from './app';
import { StateService } from './services/state.service';
import { Router } from '@angular/router';

describe('App', () => {
  let mockStateService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockStateService = {
      currentUser: signal(null),
    };

    mockRouter = {
      url: '/',
      navigate: () => Promise.resolve(true)
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: StateService, useValue: mockStateService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });
});

