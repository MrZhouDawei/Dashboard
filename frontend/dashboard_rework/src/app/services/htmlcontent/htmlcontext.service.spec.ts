import { TestBed } from '@angular/core/testing';

import { HtmlcontextService } from './htmlcontext.service';

describe('HtmlcontextService', () => {
  let service: HtmlcontextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlcontextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
