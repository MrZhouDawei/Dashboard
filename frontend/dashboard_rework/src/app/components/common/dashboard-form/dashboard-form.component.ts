import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { AutocompleteComponent } from '../autocomplete/autocomplete.component';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Dashboard_interface } from '../../../interfaces/dashboard_interface';
import { NgClass, NgIf } from '@angular/common';
import {map, of} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {UrlCheckerService} from '../../../services/url_test/test_url';

@Component({
  selector: 'app-dashboard-form',
  standalone: true,
  imports: [AutocompleteComponent, ReactiveFormsModule, FormsModule, NgIf, NgClass],
  templateUrl: './dashboard-form.component.html',
  styleUrls: ['./dashboard-form.component.css']
})
export class DashboardFormComponent implements OnInit {
  private _input: string | null = null;

  @Input()
  set input(value: string | null) {
    this._input = value;
    if (this._input) {
      this.loadDashboardData(this._input);
    }
  }

  get input(): string | null {
    return this._input;
  }

  dashboardData: Dashboard_interface | null = null;
  dashboardForm: FormGroup;
  selectedWidgetIds: string[] = [];
  currentStep: number = 1;
  message: string | null = null;
  messageType: 'success' | 'error' | null = null;

  constructor(private _dashboardService: DashboardService, private fb: FormBuilder, private _urlCheckerService: UrlCheckerService) {
    // Initialize the form group
    this.dashboardForm = this.fb.group({
      name: ['', Validators.required],
      pageTitle: ['', Validators.required],
      helpDocUrl: ['',
        [Validators.required, Validators.pattern(
          `^(https?:\\/\\/)?` + // Schema (opzionale)
          `((([a-zA-Z0-9\\-]+\\.)+[a-zA-Z]{2,})|` + // Nome dominio
          `(localhost)|` + // Localhost
          `((\\d{1,3}\\.){3}\\d{1,3})|` + // IPv4
          `(\\[[a-fA-F0-9:.]+\\])` + // IPv6
          `)(:\\d+)?(\\/[-a-zA-Z0-9@:%._\\+~#=]*)*` + // Porta e percorso (opzionali)
          `(\\?[;&a-zA-Z0-9%._\\+~#=]*)?` + // Query string (opzionale)
          `(\\#[-a-zA-Z0-9@:%._\\+~#=]*)?$` // Frammento (opzionale)
        )],
        [this.validateUrlAsync.bind(this)] // Aggiungi validazione asincrona
      ],
      helpDocHeight: [500, [Validators.required, Validators.min(1)]],
      helpDocWidth: [500, [Validators.required, Validators.min(1)]],
      coordX: [0, [Validators.required]],
      coordY: [0, [Validators.required]],
    });
  }

  validateUrlAsync(control: AbstractControl) {
    if (!control.value) {
      return of(null);
    }

    return this._urlCheckerService.checkUrl(control.value).pipe(
      map((isValid) => {
        return isValid ? null : { invalidUrl: true };
      }),
      catchError((error) => {
        console.error('Errore durante la validazione dell\'URL:', error);
        return of({ invalidUrl: true });
      })
    );
  }

  ngOnInit(): void {

    if (this.input) {
      this.dashboardForm.get('name')?.disable();
      this.loadDashboardData(this.input);
    }
  }

  private loadDashboardData(dashboardName: string): void {

    this._dashboardService.getDashboardByName(dashboardName).then(dashboard => {
      if (dashboard) {
        this.selectedWidgetIds = dashboard.widgetsInUse;

        // Populate the form with dashboard data
        this.dashboardForm.patchValue({
          name: dashboard.name,
          pageTitle: dashboard.pageTitle,
          helpDocUrl: dashboard.helpDocUrl,
          helpDocHeight: dashboard.helpDocHeight,
          helpDocWidth: dashboard.helpDocWidth,
          coordX: dashboard.coords[0],
          coordY: dashboard.coords[1],
        });
      } else {
        console.warn('No dashboard found with name:', dashboardName);
      }
    }).catch(error => {
      console.error('Error loading dashboard data:', error);
    });
  }

  nextStep(): void {
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }

  async onSubmit(): Promise<void> {
    if (this.dashboardForm.valid && this.selectedWidgetIds.length > 0) {
      const formValues = this.dashboardForm.value;
      const dashrawname = this.dashboardForm.getRawValue().name;

      // Check if the dashboard already exists
      const existingDashboard = await this._dashboardService.getDashboardByName(formValues.name);

      if (!this.input && existingDashboard) {
        // If the dashboard exists, show an error message
        this.message = 'A dashboard with this name already exists. Please choose a different name.';
        this.messageType = 'error';
      } else {
        // If the dashboard does not exist, create a new one
        this.dashboardData = {
          name: dashrawname,
          helpDocUrl: formValues.helpDocUrl,
          helpDocWidth: formValues.helpDocWidth,
          helpDocHeight: formValues.helpDocHeight,
          pageTitle: formValues.pageTitle,
          coords: [formValues.coordX, formValues.coordY], // Construct coords
          widgetsInUse: this.selectedWidgetIds, // Include selected widgets
          lastModified: new Date().toISOString()
        } as Dashboard_interface;

        try {
          await this._dashboardService.addDashboard(this.dashboardData);
          if(this.input){
            this.message = 'Dashboard edited successfully.';
          }else {
            this.message = 'Dashboard created successfully!';
          }
          this.messageType = 'success';
        } catch (error) {
          console.error('Error:', error);
          this.message = 'Failed to create dashboard. Please try again.';
          this.messageType = 'error';
        }

      }
      // Reset the form after submitting
      if(!this.input) {
        this.dashboardForm.reset();
        this.selectedWidgetIds = [];
      }

    } else {
      this.message = 'Please fill in all required fields and select widgets.';
      this.messageType = 'error';
    }
    this.currentStep = 2;

    // Reset the message after a timeout (5 seconds)
    this.resetMessageAfterTimeout();
  }

  private resetMessageAfterTimeout(): void {
    setTimeout(() => {
      this.message = null;
      this.messageType = null;
    }, 5000); // Remove message after 5 seconds
  }

  onWidgetsSelected(widgetIds: string[]): void {
    this.selectedWidgetIds = widgetIds;
  }
}
