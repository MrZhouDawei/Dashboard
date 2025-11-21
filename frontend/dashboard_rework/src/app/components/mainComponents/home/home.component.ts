import { Component, OnInit, NgZone } from '@angular/core';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { WidgetService } from '../../../services/widget/widget.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  dashboards$: Observable<any[]> = of([]);
  widgets$: Observable<any[]> = of([]);
  errorDashboards: string | null = null; // Error message for dashboards
  errorWidgets: string | null = null;   // Error message for widgets
  loadingDashboards: boolean = true;    // Loading indicator for dashboards
  loadingWidgets: boolean = true;       // Loading indicator for widgets

  constructor(
    private dashboardService: DashboardService,
    private widgetService: WidgetService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Carica i dati direttamente durante l'inizializzazione
    this.loadData();
  }

  private loadData(): void {
    // Esegui il caricamento dei dati fuori dal contesto di Angular
    this.ngZone.runOutsideAngular(() => {
      this.loadDashboards();
      this.loadWidgets();
    });
  }

  private loadDashboards(): void {
    this.dashboards$ = this.dashboardService.getDashboards().pipe(
      catchError(error => {
        this.ngZone.run(() => { // Torna al contesto di Angular per aggiornare lo stato
          this.errorDashboards = 'Failed to load dashboards.';
          this.loadingDashboards = false;
        });
        return of([]);
      })
    );

    this.dashboards$.subscribe(() => {
      this.ngZone.run(() => { // Torna al contesto di Angular per aggiornare lo stato
        this.loadingDashboards = false;
      });
    });
  }

  private loadWidgets(): void {
    this.widgets$ = this.widgetService.getWidgets().pipe(
      catchError(error => {
        this.ngZone.run(() => { // Torna al contesto di Angular per aggiornare lo stato
          this.errorWidgets = 'Failed to load widgets.';
          this.loadingWidgets = false;
        });
        return of([]);
      })
    );

    this.widgets$.subscribe(() => {
      this.ngZone.run(() => { // Torna al contesto di Angular per aggiornare lo stato
        this.loadingWidgets = false;
      });
    });
  }
}
