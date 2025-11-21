import { Component, Input } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-menu_dashboard',
  standalone: true,
  templateUrl: './menu-dashboard.component.html',
  imports: [
    RouterLink,
  ],
  styleUrls: ['./menu-dashboard.component.css']
})
export class MenuDashboardComponent {
  @Input() dashboardName: string | undefined; // Proprietà di input per il nome della dashboard
}
