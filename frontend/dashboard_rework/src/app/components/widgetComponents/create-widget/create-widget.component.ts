import { Component, OnInit } from '@angular/core';
import { WidgetFormComponent } from '../../common/widget-form/widget-form.component';


@Component({
  selector: 'app-create-widget',
  standalone: true,
  templateUrl: './create-widget.component.html',
  styleUrls: ['./create-widget.component.css'],
  imports: [WidgetFormComponent]
})
export class CreateWidgetComponent {
}
