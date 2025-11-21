import { Component, OnInit, NgZone } from '@angular/core';
import { WidgetService } from '../../../services/widget/widget.service';
import { Widget_interface } from '../../../interfaces/widget_interface';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-list-widgets',
  templateUrl: './list-widgets.component.html',
  styleUrls: ['./list-widgets.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    AsyncPipe
  ]
})
export class ListWidgetsComponent implements OnInit {
  widgets$!: Observable<Widget_interface[]>; // Observable for widgets
  widgetToDeleteId: string | null = null; // ID of the widget to delete
  widgetToDeleteName: string | null = null; // Name of the widget to delete

  constructor(private _widgetService: WidgetService, private ngZone: NgZone) {}

  ngOnInit(): void {
    this.loadWidgets();
  }

  private loadWidgets(): void {
    this.ngZone.runOutsideAngular(() => {
      this.widgets$ = this._widgetService.getWidgets(); // Assign Observable
    });
  }

  openDeleteModal(widgetId: string, widgetName: string): void {
    this.widgetToDeleteId = widgetId;
    this.widgetToDeleteName = widgetName;


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
    this.widgetToDeleteId = null;
    this.widgetToDeleteName = null;
  }

  confirmDelete(): void {
    if (this.widgetToDeleteId) {
      this._widgetService.deleteWidgetById(this.widgetToDeleteId).then(() => {
        this.loadWidgets(); // Reload widgets after deletion
      }).catch(error => {
        console.error('Error deleting widget:', error);
      }).finally(() => {
        this.closeDeleteModal();
      });
    }
  }
}
