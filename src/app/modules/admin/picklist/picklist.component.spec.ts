import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PicklistComponent } from './picklist.component';

describe('PicklistComponent', () => {
  let component: PicklistComponent;
  let fixture: ComponentFixture<PicklistComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PicklistComponent]
    });
    fixture = TestBed.createComponent(PicklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
