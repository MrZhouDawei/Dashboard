import { Component } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { WidgetFormComponent } from '../../common/widget-form/widget-form.component';
import { MenuWidgetComponent } from '../../common/menu-widget/menu-widget.component';

@Component({
  selector: 'app-edit-widget',
  standalone: true,
  imports: [WidgetFormComponent, MenuWidgetComponent],
  templateUrl: './edit-widget.component.html',
  styleUrl: './edit-widget.component.css'
})
export class EditWidgetComponent {
  widgetId: string | null = null;

  constructor(private activatedRoute: ActivatedRoute,) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.widgetId = params.get('id');
    });
  }
}
