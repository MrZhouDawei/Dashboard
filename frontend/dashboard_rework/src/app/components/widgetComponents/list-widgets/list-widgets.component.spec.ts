import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWidgetsComponent } from './list-widgets.component';

describe('ListWidgetsComponent', () => {
  let component: ListWidgetsComponent;
  let fixture: ComponentFixture<ListWidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListWidgetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
