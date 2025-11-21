import {Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, input, Input} from '@angular/core';
import { WidgetService } from '../../../services/widget/widget.service';
import { Widget_interface } from '../../../interfaces/widget_interface';
import {NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'autocomplete-dashboard',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.css'],
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ]
})
export class AutocompleteComponent implements OnInit {
  allWidgets: Widget_interface[] = []; // Array di tutti i widget
  filteredItems: Widget_interface[] = []; // Array di widget filtrati
  selectedWidgetIds: string[] = []; // Array di ID dei widget selezionati
  inputValue: string = ''; // Valore dell'input per la ricerca
  showAutocompleteList: boolean = false;

  @Input() storedWidgets: string[] = [];
  @Output() widgetSelectionChange  = new EventEmitter<string[]>();
  @ViewChild('inputElement') inputElement: ElementRef |undefined;

  constructor(private widgetService: WidgetService) {}

  ngOnInit(): void {
    this.loadWidgets();
    if (this.storedWidgets.length > 0) {
      this.selectedWidgetIds = this.storedWidgets;
    }
  }

  loadWidgets(): void {
    this.widgetService.getWidgets().subscribe(
      (widgets) => {
        this.allWidgets = widgets;
        this.filteredItems = widgets; // Inizializza la lista filtrata con tutti i widget
      },
      (error) => {
        console.error('Error loading widgets:', error);
      }
    );
  }

  onSelect(event: any,widget: Widget_interface): void {
    event.stopPropagation();
    if (!this.selectedWidgetIds.includes(widget.id)) {
      this.selectedWidgetIds.push(widget.id);
    }// Non cancella il valore dell'input

    // Rimuove il widget selezionato dalla lista filtrata
    this.filteredItems = this.filteredItems.filter(item => item.id !== widget.id);
    // Ritorna il focus all'input
    const inputElement = document.getElementById('autocomplete-input');
    if (inputElement) {
      inputElement.focus();
    }
    this.showAutocompleteList = this.filteredItems.length > 0;
    this.widgetSelectionChange.emit(this.selectedWidgetIds);
  }

  onInput(): void {
    const searchTerm = this.inputValue.toLowerCase();
    this.filteredItems = this.allWidgets.filter(widget =>
      !this.selectedWidgetIds.includes(widget.id) && widget.title.toLowerCase().includes(searchTerm)
    );
    this.showAutocompleteList = this.filteredItems.length > 0;

  }

  removeWidget(widgetId: string): void {
    this.selectedWidgetIds = this.selectedWidgetIds.filter(id => id !== widgetId);
    this.widgetSelectionChange.emit(this.selectedWidgetIds);
  }


  onClick(event: any): void {
    if (!event.target.contains(this.inputElement!.nativeElement)) {
      this.showAutocompleteList = false;
    }
  }

  takeFocus(event: any) {
    event.stopPropagation();
    this.showAutocompleteList = true;
  }
}
