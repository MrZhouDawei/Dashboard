import { Component, OnInit, NgZone } from '@angular/core';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { Dashboard_interface } from '../../../interfaces/dashboard_interface';
import { NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-dashboards',
  standalone: true,
  templateUrl: './list-dashboards.component.html',
  styleUrls: ['./list-dashboards.component.css'],
  imports: [
    NgForOf,
    RouterLink
  ]
})
export class ListDashboardsComponent implements OnInit {
  dashboards: Dashboard_interface[] = []; // Property to hold the dashboards
  dashboardToDelete: string | null = null; // Dashboard to delete

  constructor(private _dashboardService: DashboardService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.loadDashboards();
    });
  }

  private loadDashboards(): void {
    this._dashboardService.getDashboards().subscribe(
      (dashboards: Dashboard_interface[]) => {
        this.ngZone.run(() => {
          this.dashboards = dashboards; // Store the fetched dashboards
        });
      },
      (error) => {
        console.error('Error fetching dashboards:', error); // Handle errors
      }
    );
  }

  openDeleteModal(dashboardName: string): void {
    this.dashboardToDelete = dashboardName;

    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.remove('hidden'); // Show the modal
    }
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteModal');
    if (modal) {
      modal.classList.add('hidden'); // Hide the modal
    }
    this.dashboardToDelete = null; // Reset the name
  }

  confirmDelete(): void {
    if (this.dashboardToDelete) {
      this._dashboardService.deleteDashboardByName(this.dashboardToDelete)
        .then(() => {
          // Refresh the list after deletion
          this.dashboards = this.dashboards.filter(d => d.name !== this.dashboardToDelete);
        })
        .catch((error) => {
          console.error('Error deleting dashboard:', error);
        })
        .finally(() => {
          this.closeDeleteModal(); // Close the modal after action
        });
    }
  }
}
