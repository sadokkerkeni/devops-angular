import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnLineComponent } from './return-line.component';

describe('ReturnLineComponent', () => {
  let component: ReturnLineComponent;
  let fixture: ComponentFixture<ReturnLineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnLineComponent]
    });
    fixture = TestBed.createComponent(ReturnLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
