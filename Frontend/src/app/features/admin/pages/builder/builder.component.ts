import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from '../../../../core/services/page.service';
import grapesjs, { Editor } from 'grapesjs';

@Component({
  selector: 'app-builder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-[calc(100vh-64px)] w-full flex flex-col bg-gray-900 text-white overflow-hidden -m-6" style="width: calc(100% + 3rem); height: calc(100vh - 64px);">
      <!-- Topbar -->
      <div class="h-14 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-4 shadow-sm z-10 shrink-0">
        <div class="flex items-center space-x-4">
          <button (click)="goBack()" class="text-gray-400 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <span class="font-semibold text-lg text-gray-200" *ngIf="pageData">Editing: {{ pageData.title }}</span>
          <span class="font-semibold text-lg text-gray-500 animate-pulse" *ngIf="!pageData">Loading...</span>
        </div>
        
        <div class="flex items-center space-x-3">
          <span *ngIf="saveStatus" class="text-sm text-green-400 font-medium mr-2">{{ saveStatus }}</span>
          
          <button (click)="saveContent()" [disabled]="isSaving || !pageData" class="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg shadow-md transition-all disabled:opacity-50">
            <svg *ngIf="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg *ngIf="!isSaving" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
      
      <!-- Editor Container -->
      <div class="flex-1 relative w-full h-full">
         <div #gjs id="gjs" class="absolute inset-0"></div>
      </div>
    </div>
  `,
  styles: [`
    /* Override GrapesJS default theme a bit for a premium look */
    :host ::ng-deep .gjs-cv-canvas {
      background-color: #f3f4f6;
    }
    :host ::ng-deep .gjs-one-bg {
      background-color: #111827;
    }
    :host ::ng-deep .gjs-two-color {
      color: #9ca3af;
    }
    :host ::ng-deep .gjs-three-bg {
      background-color: #1f2937;
      color: white;
    }
    :host ::ng-deep .gjs-four-color,
    :host ::ng-deep .gjs-four-color-h:hover {
      color: #60a5fa;
    }
  `]
})
export class BuilderComponent implements OnInit, OnDestroy {
  @ViewChild('gjs', { static: true }) gjsContainer!: ElementRef;
  
  editor!: Editor;
  pageId: string = '';
  pageData: any = null;
  isSaving = false;
  saveStatus = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pageService: PageService
  ) {}

  ngOnInit() {
    this.pageId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.pageId) {
      this.router.navigate(['/admin/pages']);
      return;
    }

    this.initEditor();
    this.loadPageContent();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.destroy();
    }
  }

  initEditor() {
    this.editor = grapesjs.init({
      container: this.gjsContainer.nativeElement,
      height: '100%',
      width: '100%',
      storageManager: false,
      panels: { defaults: [] },
      blockManager: {
        appendTo: '#blocks',
        blocks: [
          {
            id: 'section',
            label: '<b>Section</b>',
            attributes: { class: 'gjs-block-section' },
            content: `<section style="min-height: 50px; padding: 2rem; background: #fff;">
                        <h1>Insert Content Here</h1>
                      </section>`,
          },
          {
            id: 'text',
            label: 'Text',
            content: '<div data-gjs-type="text">Insert your text here</div>',
          },
          {
            id: 'image',
            label: 'Image',
            select: true,
            content: { type: 'image' },
            activate: true,
          },
          {
             id: 'grid-2',
             label: '2 Columns',
             content: `
               <div style="display: flex; flex-wrap: wrap;">
                 <div style="flex: 1; padding: 1rem; min-height: 50px; border: 1px dashed #ccc;">Column 1</div>
                 <div style="flex: 1; padding: 1rem; min-height: 50px; border: 1px dashed #ccc;">Column 2</div>
               </div>
             `
          }
        ]
      }
    });
  }

  loadPageContent() {
    this.pageService.getPageById(this.pageId).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.pageData = res.data;
          if (this.pageData.bodyHtml) {
            this.editor.setComponents(this.pageData.bodyHtml);
          }
        }
      },
      error: (err) => {
        console.error('Error loading page content', err);
        alert('Failed to load page content. Make sure the ID is correct.');
        this.router.navigate(['/admin/pages']);
      }
    });
  }

  saveContent() {
    if (!this.pageData) return;
    
    this.isSaving = true;
    this.saveStatus = '';

    const html = this.editor.getHtml();
    const css = this.editor.getCss();
    const fullHtml = `<style>${css}</style>\n${html}`;

    const payload = {
      title: this.pageData.title,
      bodyHtml: fullHtml,
      status: this.pageData.status || 'Published'
    };

    this.pageService.updatePage(this.pageId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveStatus = 'Saved successfully!';
        setTimeout(() => this.saveStatus = '', 3000);
      },
      error: (err) => {
        console.error('Save error', err);
        this.isSaving = false;
        this.saveStatus = 'Failed to save';
        setTimeout(() => this.saveStatus = '', 3000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/pages']);
  }
}
