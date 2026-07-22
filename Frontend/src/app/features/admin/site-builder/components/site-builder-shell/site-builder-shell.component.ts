import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PageService } from '../../../../../core/services/page.service';
import { TemplateSchema } from '../../../../../core/constants/template-schemas';
import { SiteBuilderService } from '../../services/site-builder.service';
import { TemplateGalleryComponent } from '../template-gallery/template-gallery.component';
import { SiteBuilderEditorComponent } from '../site-builder-editor/site-builder-editor.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-site-builder-shell',
  standalone: true,
  imports: [CommonModule, TemplateGalleryComponent, SiteBuilderEditorComponent],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col bg-gray-50 font-sans">
      <!-- Header -->
      <header class="bg-white px-8 py-5 border-b border-gray-200 flex items-center justify-between shadow-sm z-20">
        <div class="flex items-center space-x-6">
          <button (click)="goBack()" class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center">
              Website Builder
              <span *ngIf="currentTemplate" class="ml-4 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-full border border-indigo-100">
                {{ currentTemplate.name }}
              </span>
            </h1>
            <p class="text-sm text-gray-500 mt-1" *ngIf="!currentTemplate">Select a template to get started</p>
            <p class="text-sm text-gray-500 mt-1" *ngIf="currentTemplate">Customize your content and publish</p>
          </div>
        </div>
        
        <div class="flex items-center space-x-4" *ngIf="currentTemplate">
          <button (click)="changeTemplate()" class="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            Change Template
          </button>
          <button (click)="saveAsDraft()" class="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm flex items-center" [disabled]="isSaving">
            <svg *ngIf="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Save Draft
          </button>
          <button (click)="publishSite()" class="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg flex items-center" [disabled]="isSaving">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Publish Site
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-hidden relative">
        <ng-container *ngIf="!currentTemplate">
          <div class="h-full overflow-y-auto">
            <app-template-gallery (templateSelected)="onTemplateSelected($event)"></app-template-gallery>
          </div>
        </ng-container>
        
        <ng-container *ngIf="currentTemplate">
          <app-site-builder-editor 
            [template]="currentTemplate"
            (formDataChange)="onFormDataChange($event)"
            (previewHtmlChange)="onPreviewHtmlChange($event)">
          </app-site-builder-editor>
        </ng-container>
      </main>
    </div>
  `
})
export class SiteBuilderShellComponent implements OnInit, OnDestroy {
  currentTemplate: TemplateSchema | null = null;
  formData: any = {};
  previewHtml: string = '';
  isSaving = false;
  pageId: string | null = null;
  orgId: string | null = null;

  private sub = new Subscription();

  constructor(
    private siteBuilderService: SiteBuilderService,
    private pageService: PageService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageId = params.get('pageId');
      this.orgId = params.get('orgId');
      
      if (this.pageId) {
        this.loadExistingPage(this.pageId);
      }
    });

    this.sub.add(
      this.siteBuilderService.currentTemplate$.subscribe(template => {
        this.currentTemplate = template;
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.siteBuilderService.setCurrentTemplate(null);
  }

  loadExistingPage(pageId: string) {
    this.pageService.getPageById(pageId).subscribe({
      next: (res) => {
        const data = res.data;
        if (data.templateId) {
          const template = this.siteBuilderService.getTemplateById(data.templateId);
          if (template) {
            this.siteBuilderService.setCurrentTemplate(template);
            if (data.contentJson) {
              try {
                const parsedData = JSON.parse(data.contentJson);
                this.siteBuilderService.updateFormData(parsedData);
              } catch (e) {
                console.error('Error parsing contentJson', e);
              }
            }
          }
        }
      },
      error: (err) => console.error('Error loading page', err)
    });
  }

  onTemplateSelected(template: TemplateSchema) {
    this.siteBuilderService.setCurrentTemplate(template);
  }

  changeTemplate() {
    if (confirm('Are you sure you want to change the template? This will reset your current form data.')) {
      this.siteBuilderService.setCurrentTemplate(null);
    }
  }

  onFormDataChange(data: any) {
    this.formData = data;
  }

  onPreviewHtmlChange(html: string) {
    this.previewHtml = html;
  }

  goBack() {
    this.location.back();
  }

  saveAsDraft() {
    this.savePage('Draft');
  }

  publishSite() {
    this.savePage('Published');
  }

  private savePage(status: string) {
    if (!this.pageId) return;

    this.isSaving = true;
    const payload = {
      title: 'Site Builder Page', // Typically this would be editable or loaded from the page metadata
      bodyHtml: this.previewHtml,
      status: status,
      templateId: this.currentTemplate?.id,
      contentJson: JSON.stringify(this.siteBuilderService.getFormData())
    };

    this.pageService.updatePage(this.pageId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        alert(`Site successfully saved as ${status}!`);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error saving site', err);
        alert('Failed to save site.');
      }
    });
  }
}
