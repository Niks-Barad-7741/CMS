import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-live-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-gray-100 rounded-l-2xl shadow-inner border-l border-gray-200 overflow-hidden">
      <!-- Browser Mockup Header -->
      <div class="bg-gray-200 px-4 py-3 flex items-center border-b border-gray-300">
        <div class="flex space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div class="mx-auto bg-white rounded-md text-xs text-gray-500 px-8 py-1 flex items-center shadow-sm w-1/2 justify-center">
          <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg>
          yoursite.com
        </div>
      </div>
      
      <!-- Iframe Container -->
      <div class="flex-1 bg-white relative w-full h-full overflow-hidden">
        <iframe #previewFrame class="w-full h-full border-none" title="Live Preview"></iframe>
      </div>
    </div>
  `
})
export class LivePreviewComponent implements OnChanges, AfterViewInit {
  @Input() htmlContent: string = '';
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['htmlContent'] && !changes['htmlContent'].firstChange) {
      this.updateIframe();
    }
  }

  ngAfterViewInit(): void {
    this.updateIframe();
  }

  private updateIframe(): void {
    if (this.previewFrame && this.previewFrame.nativeElement) {
      const doc = this.previewFrame.nativeElement.contentDocument || this.previewFrame.nativeElement.contentWindow?.document;
      
      if (doc) {
        // Wrap the content with Tailwind CDN for styling inside the iframe
        const fullHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 0; }
                /* Custom scrollbar for iframe */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #f1f1f1; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              </style>
            </head>
            <body>
              ${this.htmlContent || '<div class="flex items-center justify-center h-screen text-gray-400">Loading preview...</div>'}
            </body>
          </html>
        `;

        doc.open();
        doc.write(fullHtml);
        doc.close();
      }
    }
  }
}
