import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HtmlcontextService } from '../../../services/htmlcontent/htmlcontext.service'; // Adjust the import path

@Component({
  selector: 'app-widget-preview',
  templateUrl: './widget-preview.component.html',
  styleUrls: ['./widget-preview.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ]
})
export class WidgetPreviewComponent {
  @Output() outputData = new EventEmitter<string>();
  @Input() set inputData(data: string) {
    if (data) {
      try {
        const decryptedData = this.htmlContextService.decryptAndSplit(data);
        if (decryptedData) {
          this.htmlCode = decryptedData.html || '';
          this.cssCode = decryptedData.css || '';
          this.jsCode = decryptedData.js || '';
          this.generatePreview(); // Generate the preview whenever the data changes
        } else {
          console.error('Invalid data format');
        }
      } catch (error) {
        console.error('Error decrypting input data:', error);
      }
    }
  }



  htmlCode: string = '';
  cssCode: string = '';
  jsCode: string = '';
  previewSrc: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer, private htmlContextService: HtmlcontextService) {}

  generatePreview(): void {
    if (this.htmlCode.trim() || this.cssCode.trim() || this.jsCode.trim()) {
      const blob = new Blob([`
        <html>
          <head>
            <style>${this.cssCode}</style>
          </head>
          <body>
            ${this.htmlCode}
            <script>${this.jsCode}</script>
          </body>
        </html>
      `], { type: 'text/html' });

      const url = URL.createObjectURL(blob);
      this.previewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.previewSrc = null;
    }
  }

  save(): void {
    const combinedData = this.htmlContextService.combineAndEncrypt(this.htmlCode, this.cssCode, this.jsCode);
    this.outputData.emit(combinedData);
  }
}
