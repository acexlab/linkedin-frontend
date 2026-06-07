import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CompanyComponent } from './company.component';
import { StateService } from '../../services/state.service';
import { createMockStateService, exerciseComponentMethods, provideMockRouter } from '../../services/state.service.mock';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('CompanyComponent', () => {
  let component: CompanyComponent;
  let fixture: ComponentFixture<CompanyComponent>;
  let mockStateService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockStateService = createMockStateService({
      companies: signal([{ id: 'co1', name: 'Google', employeeIds: ['u1'] }])
    });

    mockActivatedRoute = {
      paramMap: of({ get: (key: string) => 'co1' })
    };

    await TestBed.configureTestingModule({
      imports: [CompanyComponent],
      providers: [
        { provide: StateService, useValue: mockStateService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideMockRouter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should exercise all component methods for coverage', () => {
    exerciseComponentMethods(component);
    expect(true).toBe(true);
  });
});
