import { TestBed } from '@angular/core/testing';

import { MovementTraceService } from './movment-trace.service';

describe('MovementTraceService', () => {
  let service: MovementTraceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementTraceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
