import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateSchema } from '../../../../../core/constants/template-schemas';
import { SiteBuilderService } from '../../services/site-builder.service';
import { SchemaFormComponent } from '../schema-form/schema-form.component';
import { LivePreviewComponent } from '../live-preview/live-preview.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-site-builder-editor',
  standalone: true,
  imports: [CommonModule, SchemaFormComponent, LivePreviewComponent],
  template: `
    <div class="flex h-[calc(100vh-12rem)] bg-gray-50 border-t border-gray-200">
      <!-- Left Panel: Form -->
      <div class="w-1/3 min-w-[400px] h-full z-10">
        <app-schema-form 
          [schema]="template" 
          [formData]="formData"
          (dataChanged)="onDataChanged($event)">
        </app-schema-form>
      </div>
      
      <!-- Right Panel: Preview -->
      <div class="flex-1 h-full p-4 pl-0">
        <div class="h-full rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
          <app-live-preview [htmlContent]="previewHtml"></app-live-preview>
        </div>
      </div>
    </div>
  `
})
export class SiteBuilderEditorComponent implements OnInit, OnDestroy {
  @Input() template!: TemplateSchema;
  @Output() formDataChange = new EventEmitter<any>();
  @Output() previewHtmlChange = new EventEmitter<string>();

  formData: any = {};
  previewHtml: string = '';
  
  private sub = new Subscription();

  constructor(private siteBuilderService: SiteBuilderService) {}

  ngOnInit() {
    this.sub.add(
      this.siteBuilderService.formData$.subscribe(data => {
        this.formData = data;
        this.updatePreview();
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onDataChanged(newData: any) {
    this.siteBuilderService.updateFormData(newData);
    this.formDataChange.emit(newData);
  }

  private updatePreview() {
    if (this.template && this.formData) {
      this.previewHtml = this.siteBuilderService.generateHtml(this.template, this.formData);
      this.previewHtmlChange.emit(this.previewHtml);
    }
  }
}
