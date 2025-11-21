import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetFormComponent } from './widget-form.component';

describe('WidgetFormComponent', () => {
  let component: WidgetFormComponent;
  let fixture: ComponentFixture<WidgetFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
