import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LineComponent } from './line.component';

describe('LineComponent', () => {
  let component: LineComponent;
  let fixture: ComponentFixture<LineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LineComponent]
    });
    fixture = TestBed.createComponent(LineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
