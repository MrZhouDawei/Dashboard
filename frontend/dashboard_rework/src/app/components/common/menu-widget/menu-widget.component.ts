import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-menu-widget',
  standalone: true,
  imports: [ RouterLink ],
  templateUrl: './menu-widget.component.html',
  styleUrl: './menu-widget.component.css'
})
export class MenuWidgetComponent {
  @Input() widgetId: string | null = null;
}
