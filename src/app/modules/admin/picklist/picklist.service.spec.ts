import { TestBed } from '@angular/core/testing';

import { PicklistService } from './picklist.service';

describe('PicklistService', () => {
  let service: PicklistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PicklistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
