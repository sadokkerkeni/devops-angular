import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementTraceComponent } from './movment-trace.component';

describe('MovementTraceComponent', () => {
  let component: MovementTraceComponent;
  let fixture: ComponentFixture<MovementTraceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MovementTraceComponent]
    });
    fixture = TestBed.createComponent(MovementTraceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
