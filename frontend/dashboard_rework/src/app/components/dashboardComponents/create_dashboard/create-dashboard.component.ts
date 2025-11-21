import { Component } from '@angular/core';
import { DashboardFormComponent} from '../../common/dashboard-form/dashboard-form.component';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-create-dashboard',
  templateUrl: './create-dashboard.component.html',
  styleUrls: ['./create-dashboard.component.css'],
  imports: [
    DashboardFormComponent
  ],
  standalone: true
})
export class CreateDashboardComponent{
  dashboard: string | null = null;


  constructor(private activatedRoute: ActivatedRoute,) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.dashboard = params.get('name');
    });
  }

}
