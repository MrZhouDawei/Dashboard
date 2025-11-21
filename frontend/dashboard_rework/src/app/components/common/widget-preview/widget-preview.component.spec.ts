import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetPreviewComponent } from './widget-preview.component';

describe('WidgetPreviewComponent', () => {
  let component: WidgetPreviewComponent;
  let fixture: ComponentFixture<WidgetPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
