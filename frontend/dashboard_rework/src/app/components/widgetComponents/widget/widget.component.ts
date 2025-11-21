import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WidgetService } from '../../../services/widget/widget.service';
import { HtmlcontextService } from '../../../services/htmlcontent/htmlcontext.service';
import { Widget_interface } from '../../../interfaces/widget_interface';
import { MenuWidgetComponent} from '../../common/menu-widget/menu-widget.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css'],
  standalone: true,
  imports: [
    MenuWidgetComponent,
    NgIf
  ]
})
export class WidgetComponent implements OnInit, OnDestroy {
  widgetId: string | null = null;
  widget: Widget_interface | null = null;
  protected isEditable: boolean = false;

  widgetBlobUrl: SafeResourceUrl | null = null; // URL del Blob HTML
  private blobUrl: string | null = null; // Per tracciare l'URL generato

  constructor(
    private activatedRoute: ActivatedRoute,
    private widgetService: WidgetService,
    private htmlContextService: HtmlcontextService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.isEditable = params['isEditable'] === 'true';
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.widgetId = params.get('id');
      if (this.widgetId) {
        this.fetchWidgetData(this.widgetId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl); // Libera il Blob URL
    }
  }

  fetchWidgetData(id: string): void {
    this.widgetService.getWidgetByName(id).then(widget => {
      if (widget) {
        this.widget = widget;

        const decryptedContent = this.htmlContextService.decryptAndSplit(widget.contentHTML);
        if (decryptedContent) {
          this.generateBlobHtml(decryptedContent.html, decryptedContent.css, decryptedContent.js);
        }
      } else {
        console.error('Widget not found.');
      }
    }).catch(error => {
      console.error('Error fetching widget:', error);
    });
  }

  generateBlobHtml(html: string, css: string, js: string): void {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl); // Libera l'URL precedente
    }

    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Widget Preview</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `;

    const blob = new Blob([content], { type: 'text/html' });
    this.blobUrl = URL.createObjectURL(blob);
    this.widgetBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.blobUrl);
  }
}
