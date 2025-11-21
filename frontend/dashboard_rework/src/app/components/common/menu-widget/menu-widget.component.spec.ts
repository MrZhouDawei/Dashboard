import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuWidgetComponent } from './menu-widget.component';

describe('MenuWidgetComponent', () => {
  let component: MenuWidgetComponent;
  let fixture: ComponentFixture<MenuWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
