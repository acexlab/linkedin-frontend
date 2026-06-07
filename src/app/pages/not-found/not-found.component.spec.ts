import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { provideRouter } from '@angular/router';
import { provideMockRouter } from '../../services/state.service.mock';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [
        provideMockRouter()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
