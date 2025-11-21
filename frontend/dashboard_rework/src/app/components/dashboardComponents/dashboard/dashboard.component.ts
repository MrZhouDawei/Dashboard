import {Component, OnInit, NgZone, ViewEncapsulation, ViewChild, OnDestroy,Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DashboardService } from '../../../services/dashboard/dashboard.service';
import { WidgetService } from '../../../services/widget/widget.service';
import { Dashboard_interface } from '../../../interfaces/dashboard_interface';
import { Widget_interface } from '../../../interfaces/widget_interface';
import { GridstackModule, NgGridStackOptions, GridstackComponent } from 'gridstack/dist/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MenuDashboardComponent } from '../../common/menu_dashboard/menu-dashboard.component';
import { HtmlcontextService } from '../../../services/htmlcontent/htmlcontext.service';
import {UrlCheckerService} from '../../../services/url_test/test_url';
import {GridItemHTMLElement, GridStackNode} from 'gridstack';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, GridstackModule, MenuDashboardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  public gridOptions: NgGridStackOptions = {
    margin: 10, // Margine tra i widget
    cellHeight: 'auto', // Altezza automatica delle celle
    animate: true, // Abilita animazioni durante i movimenti
    float: true, // Permetti il posizionamento automatico
    minRow: 1, // Numero minimo di righe nella griglia
    resizable: {
      handles: 'all', // Abilita il ridimensionamento
    },
  };


  @ViewChild(GridstackComponent) gridstackComponent!: GridstackComponent; // Reference to the grid

  dashboard: Dashboard_interface | null = null;
  loadingDashboard = true; // Variabile per gestire il caricamento
  errorDashboard: string | null = null;
  widgetsInUse: Widget_interface[] = [];
  showHelpDoc = false;
  saveLayoutEnabled: boolean = false
  safeHelpDocUrl: SafeResourceUrl | null = null;
  protected defaultHelpDocUrl: string = 'https://docs.google.com/document/d/1_qRBLN9ODPrUIp02V-IYfafgguxyrajIleviRXM0LH8/pub';

  // Variabile per isEditable
  isEditable: boolean = false;

  // Variabile per l'orologio
  currentTime: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dashboardService: DashboardService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    protected sanitizer: DomSanitizer, // Inietta DomSanitizer
    private _htmlcontextService: HtmlcontextService,// Inietta il servizio di decrittazione
    private _urlcheckservice: UrlCheckerService,
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.isEditable = params['isEditable'] === 'true';
    });

    this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (name) {
        if (isPlatformBrowser(this.platformId)) {
          this.fetchDashboard(name);
        } else {
          console.warn('Dashboard rendering is disabled on the api');
        }
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.startClock();
    }
  }


  ngOnDestroy(): void {
    this.widgetsInUse.forEach(widget => {
      const iframe = document.getElementById(`item-${widget.id}`)?.querySelector('iframe');
      if (iframe?.src) {
        URL.revokeObjectURL(iframe.src);
      }
    });
  }

  private startClock(): void {
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString(); // Formatta l'ora
    }, 1000); // Aggiorna ogni secondo
  }

  protected toggleSaveLayout(): void {
    this.saveLayoutEnabled = !this.saveLayoutEnabled;
    if (this.saveLayoutEnabled) {
      this.saveGridStateToLocalStorage(this.gridstackComponent.grid?.getGridItems() || []);
    } else {
      localStorage.removeItem(this.dashboard?.name!);
    }
  }


  private fetchDashboard(name: string): void {
    this.loadingDashboard = true; // Inizio del caricamento

    this.ngZone.runOutsideAngular(() => {
      this.dashboardService.getDashboardByName(name)
        .then(dashboard => {
          this.ngZone.run(() => {
            this.loadingDashboard = false;
            if (dashboard) {
              this.dashboard = dashboard;
              this.checkUrlAvailability(dashboard.helpDocUrl);
              this.fetchWidgets();
            } else {
              this.errorDashboard = 'Dashboard not found';
              this.safeHelpDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultHelpDocUrl);
            }
          });
        })
        .catch(error => {
          this.ngZone.run(() => {
            this.loadingDashboard = false;
            this.errorDashboard = 'Error fetching dashboard: ' + error;
            this.safeHelpDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultHelpDocUrl);
          });
        });
    });
  }


  private checkUrlAvailability(url: string): void {
    this._urlcheckservice.checkUrl(url).subscribe((isValid) => {
      if (isValid) {
        // URL is valid and reachable
        this.safeHelpDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        // URL is not valid; fallback to the default URL
        console.error('URL not reachable, falling back to default URL');
        this.safeHelpDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultHelpDocUrl);
      }
    });
  }


  private fetchWidgets(): void {
    const widgetIds = this.dashboard?.widgetsInUse || []
    if (widgetIds.length > 0) {
      this.widgetService.getWidgetsByIdsArray(widgetIds).subscribe(widgets => {
        this.widgetsInUse = widgets;
        this.addWidgetsToGrid(); // Aggiungi i widget alla griglia
      });
    } else {
      console.error('No widget IDs found in the dashboard.');
    }
  }

  private addWidgetsToGrid(): void {
    let storedDashboardData = JSON.parse(localStorage.getItem(this.dashboard?.name!)!)
    if(storedDashboardData) {
      let queryDashDate = new Date(this.dashboard!.lastModified);
      let cachedDashboardDate = new Date(storedDashboardData.date);
      if(cachedDashboardDate.getTime() != queryDashDate.getTime()) {
        localStorage.removeItem(this.dashboard?.name!);
      }else {
        this.saveLayoutEnabled = storedDashboardData.isEnabled
      }
    }
    this.widgetsInUse.forEach(widget => {
      const widgetElement = document.createElement('div');
      widgetElement.className = 'grid-stack-item';

      // Decodifica il contenuto del widget
      const decryptedData = this._htmlcontextService.decryptAndSplit(widget.contentHTML);

      if (decryptedData) {
        // Crea un contenitore interno per il widget
        const contentDiv = document.createElement('div');
        contentDiv.className = `grid-stack-item-content widget-${widget.id}`;
        contentDiv.style.backgroundColor = '#f0f0f0';
        contentDiv.style.textAlign = 'center'; // Centra il testo
        // Aggiungi il titolo e l'icona (usando Flexbox per l'allineamento)
        const titleHTML = `
          <div class="widget-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <a href="${widget.url}" target="_blank" class="widget-title" style="flex-grow: 1; text-align: left;">
              ${widget.urlTitle}
            </a>
            <button class="widget-help-btn" data-help-doc-url="${widget.helpDocUrl}" style="cursor: pointer;">
              <span class="widget-span" style="font-size: 18px;">?</span>
            </button>
          </div>`;

        // Aggiungi il titolo nel corpo del widget
        decryptedData.html = titleHTML + decryptedData.html; // Aggiungi il titolo prima del corpo del widget

        // Applica il CSS decodificato, scoping con classe univoca
        const styleTag = document.createElement('style');
        styleTag.textContent = this.scopeCSS(decryptedData.css, `.widget-${widget.id}`);
        document.head.appendChild(styleTag);

        // Inserisci l'HTML decriptato (con il titolo) nel contenitore
        const widgetBody = document.createElement('div');
        widgetBody.className = 'widget-body';
        widgetBody.innerHTML = decryptedData.html;
        contentDiv.appendChild(widgetBody);

        // Esegui il codice JS del widget, se esiste
        if (decryptedData.js) {
          // Modifica nella sezione di creazione dello script
          const scriptTag = document.createElement('script');
          scriptTag.textContent = `(function() { ${decryptedData.js} })();`;
          contentDiv.appendChild(scriptTag);
        }

        // Aggiungi tutto al contenitore del widget
        widgetElement.appendChild(contentDiv);

        //check if we have stored layout
        let storedDashData = JSON.parse(localStorage.getItem(this.dashboard?.name!)!)

        if(storedDashData){
          //layout already saved
          let widgetStored = storedDashData.gridItems.find((gridItem:any) => gridItem.id == widget.id);


          this.gridstackComponent.grid?.makeWidget(widgetElement, {
            w: widgetStored.w || 2,
            h: widgetStored.h || 2,
            id: widgetStored.id,
            x: widgetStored.x,
            y: widgetStored.y,
          });
        }else {
          // Aggiungi il widget alla griglia con opzioni di auto-posizionamento
          this.gridstackComponent.grid?.makeWidget(widgetElement, {
            w: widget.width || 2,
            h: widget.height || 2,
            id: widget.id,
            autoPosition: true,
          });
        }

        // Aggiungi l'evento per l'icona di aiuto
        const helpButton = contentDiv.querySelector('.widget-help-btn');
        if (helpButton) {
          helpButton.addEventListener('click', () => this.openHelpModal(widget.helpDocUrl));
        }

      } else {

        console.error(`Failed to decrypt content for widget ${widget.id}`);
      }
    });

    this.gridstackComponent.grid?.on('change',() =>{
      if(this.saveLayoutEnabled){
        this.saveGridStateToLocalStorage(this.gridstackComponent.grid?.getGridItems() || [])
      }
    })

  }


  /**
   * Scoping del CSS per renderlo univoco.
   * @param css - Il CSS originale
   * @param scope - La classe o selettore di scoping
   * @returns Il CSS con scoping applicato
   */
  private scopeCSS(css: string, scope: string): string {
    return css
      .split('}')
      .map(rule => {
        const [selectors, declarations] = rule.split('{');
        if (!selectors || !declarations) return '';
        const scopedSelectors = selectors
          .split(',')
          .map(selector => `${scope} ${selector.trim()}`)
          .join(',');
        return `${scopedSelectors} {${declarations}`;
      })
      .join('}');
  }


  // Funzione per aprire il documento di aiuto nel modal
  openHelpModal(helpDocUrl: string): void {
    const modal = document.getElementById('helpModal');
    const overlay = document.getElementById('helpModalOverlay') as HTMLElement;
    const iframe = document.getElementById('helpDocIframe') as HTMLIFrameElement;

    // Verifica che il modal, l'overlay e l'iframe esistano
    if (modal && iframe && overlay) {
      iframe.src = helpDocUrl; // Imposta l'URL nel iframe
      modal.style.display = 'block'; // Mostra il modal
      overlay.style.display = 'block'; // Mostra l'overlay
    }

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
      closeModal.onclick = () => {
        this.closeHelpModal(); // Chiama la funzione per chiudere il modal
      };
    }

    // Gestione della chiusura cliccando sull'overlay
    window.onclick = (event: any) => {
      if (modal && event.target === overlay) {
        this.closeHelpModal(); // Chiama la funzione per chiudere il modal
      }
    };
  }

  // Funzione per chiudere il modal
  closeHelpModal(): void {
    const modal = document.getElementById('helpModal');
    const overlay = document.getElementById('helpModalOverlay');
    const iframe = document.getElementById('helpDocIframe') as HTMLIFrameElement;

    if (modal && overlay) {
      modal.style.display = 'none'; // Nasconde il modal
      overlay.style.display = 'none'; // Nasconde l'overlay
      if (iframe) {
        iframe.src = ''; // Rimuove l'URL dall'iframe
      }
    }
  }


  handleIframeError(): void {
    console.error('Failed to load the help document. Falling back to default URL.');
    this.safeHelpDocUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.defaultHelpDocUrl);
  }

  openHelpDoc(): void {
    this.showHelpDoc = true;
  }


  closeHelpDoc(): void {
    this.showHelpDoc = false;
  }

  private saveGridStateToLocalStorage(gridItemHTMLElements: GridItemHTMLElement[]) {
    const gridState = gridItemHTMLElements.map((gridItemHTMLElement) =>({
      x: gridItemHTMLElement.gridstackNode?.x,
      y:  gridItemHTMLElement.gridstackNode?.y,
      w:  gridItemHTMLElement.gridstackNode?.w,
      h:  gridItemHTMLElement.gridstackNode?.h,
      id: gridItemHTMLElement.gridstackNode?.id,
    }));
    let data = {isEnabled: this.saveLayoutEnabled,date:this.dashboard?.lastModified,gridItems: gridState};
    localStorage.setItem(this.dashboard?.name!, JSON.stringify(data));
  }
}
