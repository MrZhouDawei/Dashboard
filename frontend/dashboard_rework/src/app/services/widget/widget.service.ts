import { Injectable, OnDestroy } from '@angular/core';
import { Database, get, onValue, ref, remove, set, update } from '@angular/fire/database';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Widget_interface } from '../../interfaces/widget_interface';
import { Dashboard_interface } from '../../interfaces/dashboard_interface'; // Ensure you import the interface

@Injectable({
  providedIn: 'root'
})
export class WidgetService implements OnDestroy {
  private onDestroy$: Subject<void> = new Subject<void>();

  constructor(private db: Database) {}

  // Function to filter and map the data
  private filterAndMapData(data: any[]): Widget_interface[] {
    return data.map(item => ({
      id: item.id || '', // Default value
      title: item.title || '',
      contentHTML: item.contentHTML || '',
      height: item.height || 0,
      width: item.width || 0,
      helpDocUrl: item.helpDocUrl || '',
      url: item.url || '',
      urlTitle: item.urlTitle || '',
      lastModified: item.lastModified || '',
    }));
  }

  // Fetch widget from the database under the widget node
  getWidgets(): Observable<Widget_interface[]> {
    const widgetsRef = ref(this.db, 'widgets'); // Path to widget

    return new Observable<Widget_interface[]>((observer) => {
      const unsubscribe = onValue(
        widgetsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const widgets = this.filterAndMapData(Object.values(data)); // Filter and map the widget
            observer.next(widgets);
          } else {
            observer.next([]); // Return empty array if no data
          }
        },
        (error) => {
          console.error('Error fetching widgets:', error);
          observer.error(error);
        },
        { onlyOnce: false }
      );

      // Cleanup listener when subscription is disposed
      return () => unsubscribe();
    }).pipe(
      takeUntil(this.onDestroy$), // Automatically unsubscribes when onDestroy$ emits
      catchError((error) => {
        console.error('Error fetching widget:', error);
        return of([]); // Return empty array in case of error
      })
    );
  }

  // Fetch a specific widget by ID
  async getWidgetByName(id: string): Promise<Widget_interface | null> {
    const widgetsRef = ref(this.db, 'widgets');

    try {
      const snapshot = await get(widgetsRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const widgets: Widget_interface[] = this.filterAndMapData(Object.values(data));

        // Find the widget with the matching name
        const foundWidget = widgets.find(widget => widget.id === id);
        return foundWidget || null; // Return the found widget or null if not found
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching widget by name:', error);
      return null; // Return null in case of error
    }
  }

  // Add a new widget under the widget node
  async addWidget(widget: Widget_interface): Promise<void> {
    const newWidgetRef = ref(this.db, `widgets/${widget.id}`); // Modify based on your data structure

    try {
      await set(newWidgetRef, widget);
    } catch (error) {
      console.error('Error adding widget:', error);
    }
  }

  // Fetch widgets by an array of IDs
  getWidgetsByIdsArray(ids: string[]): Observable<Widget_interface[]> {
    const widgetPromises = ids.map(id => {
      const widgetRef = ref(this.db, `widgets/${id}`);
      return get(widgetRef).then(snapshot => {
        if (snapshot.exists()) {
          return this.filterAndMapData([snapshot.val()])[0]; // Return the widget if it exists
        } else {
          return null; // Return null if not found
        }
      }).catch(error => {
        console.error(`Error fetching widget with ID ${id}:`, error);
        return null; // Return null in case of error
      });
    });

    return new Observable<Widget_interface[]>((observer) => {
      forkJoin(widgetPromises).subscribe({
        next: (widgets) => {
          // Filter out null values (widget that were not found)
          const filteredWidgets = widgets.filter(widget => widget !== null) as Widget_interface[];
          observer.next(filteredWidgets);
        },
        error: (error) => {
          observer.error(error);
        },
        complete: () => {
          observer.complete(); // Ensure completion
        }
      });
    }).pipe(
      takeUntil(this.onDestroy$), // Automatically clean up
      catchError((error) => {
        console.error('Error fetching widget by IDs:', error);
        return of([]); // Return empty array in case of error
      })
    );
  }

  // Delete a widget by ID
  deleteWidgetById(widgetId: string): Promise<void> {
    const widgetRef = ref(this.db, `widgets/${widgetId}`); // Path to the widget to delete
    const dashboardsRef = ref(this.db, 'dashboards'); // Path to dashboards

    return remove(widgetRef) // Step 1: Delete the widget
      .then(() => {

        // Step 2: Remove the widget from all dashboards
        return get(dashboardsRef).then(snapshot => {
          if (snapshot.exists()) {
            const dashboards: { [key: string]: Dashboard_interface } = snapshot.val();

            const updates: { [key: string]: any } = {};
            Object.keys(dashboards).forEach(dashboardKey => {
              const dashboard = dashboards[dashboardKey];

              // Check if the widgetId exists in widgetsInUse
              if (dashboard.widgetsInUse.includes(widgetId)) {
                updates[`dashboards/${dashboardKey}/widgetsInUse`] = dashboard.widgetsInUse.filter(id => id !== widgetId);
              }
            });

            // Update the dashboards to remove the widgetId
            const updatesRef = ref(this.db);
            return update(updatesRef, updates).then(() => {
            });
          } else {
            console.error('No dashboards found to update.');
            return Promise.resolve(); // No dashboards to update
          }
        });
      })
      .catch(error => {
        console.error('Error deleting widget or updating dashboards:', error);
      });
  }

  // Cleanup the service when it's destroyed
  ngOnDestroy() {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
