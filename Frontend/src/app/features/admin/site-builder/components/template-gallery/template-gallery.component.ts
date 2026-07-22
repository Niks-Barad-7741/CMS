import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateSchema } from '../../../../../core/constants/template-schemas';
import { SiteBuilderService } from '../../services/site-builder.service';

@Component({
  selector: 'app-template-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Choose a Template</h2>
        <p class="text-lg text-gray-600">Select a beautifully designed template to start building your website.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div *ngFor="let template of templates" 
             class="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
             (click)="selectTemplate(template)">
          
          <div class="relative h-48 overflow-hidden">
            <img [src]="template.thumbnail" [alt]="template.name" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button class="opacity-0 group-hover:opacity-100 bg-white text-gray-900 font-semibold py-2 px-6 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                Use Template
              </button>
            </div>
          </div>
          
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-2">{{ template.name }}</h3>
            <p class="text-gray-500 line-clamp-2">{{ template.description }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TemplateGalleryComponent {
  templates: TemplateSchema[] = [];
  @Output() templateSelected = new EventEmitter<TemplateSchema>();

  constructor(private siteBuilderService: SiteBuilderService) {
    this.templates = this.siteBuilderService.getTemplates();
  }

  selectTemplate(template: TemplateSchema) {
    this.templateSelected.emit(template);
  }
}
