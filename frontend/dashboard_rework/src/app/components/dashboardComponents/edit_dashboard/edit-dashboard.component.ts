import { Component } from '@angular/core';
import { MenuDashboardComponent} from '../../common/menu_dashboard/menu-dashboard.component';
import { DashboardFormComponent} from '../../common/dashboard-form/dashboard-form.component';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-edit_dashboard',
  standalone: true,
  imports: [ DashboardFormComponent , MenuDashboardComponent ],
  templateUrl: './edit-dashboard.component.html',
  styleUrl: './edit-dashboard.component.css'
})
export class EditDashboardComponent {
  dashboardNam: string | null = null;

  constructor(private activatedRoute: ActivatedRoute,) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.dashboardNam = params.get('name');
    });
  }
}
