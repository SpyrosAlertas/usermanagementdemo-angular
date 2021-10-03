import { TestBed } from '@angular/core/testing';

import { IsAdminOrSelfService } from './is-admin-or-self.service';

describe('IsAdminOrSelfService', () => {
  let service: IsAdminOrSelfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IsAdminOrSelfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
