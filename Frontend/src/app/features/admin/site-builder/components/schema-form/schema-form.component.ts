import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateSchema, TemplateSection, TemplateField } from '../../../../../core/constants/template-schemas';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-schema-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full overflow-y-auto bg-white p-6 shadow-xl border-r border-gray-100">
      <div class="mb-8 pb-6 border-b border-gray-100">
        <h2 class="text-2xl font-extrabold text-gray-900">{{ schema?.name }}</h2>
        <p class="text-gray-500 mt-2 text-sm">{{ schema?.description }}</p>
      </div>

      <div class="space-y-10">
        <!-- Sections -->
        <div *ngFor="let section of schema?.sections" class="bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 class="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <span class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">#</span>
            {{ section.label }}
          </h3>
          
          <div class="space-y-6">
            <!-- Fields -->
            <div *ngFor="let field of section.fields" class="space-y-2">
              <label class="block text-sm font-semibold text-gray-700">
                {{ field.label }}
                <span *ngIf="field.required" class="text-red-500">*</span>
              </label>
              
              <!-- Text Input -->
              <input *ngIf="field.type === 'text' || field.type === 'url' || field.type === 'email'"
                     [type]="field.type"
                     [(ngModel)]="formData[section.key][field.key]"
                     (ngModelChange)="onDataChange()"
                     [placeholder]="field.placeholder || 'Enter ' + field.label"
                     class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-gray-900" />
              
              <!-- Textarea -->
              <textarea *ngIf="field.type === 'textarea'"
                        [(ngModel)]="formData[section.key][field.key]"
                        (ngModelChange)="onDataChange()"
                        rows="3"
                        [placeholder]="field.placeholder || 'Enter ' + field.label"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-gray-900"></textarea>
              
              <!-- Rich Text (Simplified as textarea for now) -->
              <textarea *ngIf="field.type === 'richtext'"
                        [(ngModel)]="formData[section.key][field.key]"
                        (ngModelChange)="onDataChange()"
                        rows="5"
                        [placeholder]="field.placeholder || 'Enter rich text content'"
                        class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow font-mono text-sm text-gray-800 bg-gray-50"></textarea>
                        
              <!-- Image URL -->
              <div *ngIf="field.type === 'image'" class="flex gap-3">
                <input type="text"
                       [(ngModel)]="formData[section.key][field.key]"
                       (ngModelChange)="onDataChange()"
                       placeholder="https://..."
                       class="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-gray-900" />
                <div class="w-11 h-11 rounded-lg border border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  <img *ngIf="formData[section.key][field.key]" [src]="formData[section.key][field.key]" class="w-full h-full object-cover" />
                  <svg *ngIf="!formData[section.key][field.key]" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>

              <!-- Array Field (Dynamic Lists) -->
              <div *ngIf="field.type === 'array'" class="mt-4">
                <div *ngFor="let item of formData[section.key][field.key]; let i = index" class="bg-white p-4 rounded-lg border border-gray-200 mb-4 relative shadow-sm">
                  <button (click)="removeArrayItem(section.key, field.key, i)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  
                  <div class="space-y-4 pr-6">
                    <div *ngFor="let subField of field.arrayFields" class="space-y-1">
                      <label class="block text-xs font-semibold text-gray-600">{{ subField.label }}</label>
                      <input *ngIf="subField.type === 'text' || subField.type === 'url'"
                             [type]="subField.type"
                             [(ngModel)]="item[subField.key]"
                             (ngModelChange)="onDataChange()"
                             class="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                      <textarea *ngIf="subField.type === 'textarea'"
                                [(ngModel)]="item[subField.key]"
                                (ngModelChange)="onDataChange()"
                                rows="2"
                                class="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                       <input *ngIf="subField.type === 'image'"
                             type="url"
                             [(ngModel)]="item[subField.key]"
                             (ngModelChange)="onDataChange()"
                             placeholder="Image URL"
                             class="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                </div>
                
                <button (click)="addArrayItem(section.key, field.key, field.arrayFields)" class="w-full py-2.5 border-2 border-dashed border-indigo-200 rounded-lg text-indigo-600 font-semibold text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  Add {{ field.label }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SchemaFormComponent implements OnInit, OnDestroy {
  @Input() schema: TemplateSchema | null = null;
  @Input() formData: any = {};
  @Output() dataChanged = new EventEmitter<any>();

  private changeSubject = new Subject<void>();

  ngOnInit() {
    this.changeSubject.pipe(
      debounceTime(300) // debounce changes to avoid freezing the UI on every keystroke
    ).subscribe(() => {
      this.dataChanged.emit(this.formData);
    });
  }

  ngOnDestroy() {
    this.changeSubject.complete();
  }

  onDataChange() {
    this.changeSubject.next();
  }

  addArrayItem(sectionKey: string, fieldKey: string, arrayFields: TemplateField[] | undefined) {
    if (!this.formData[sectionKey][fieldKey]) {
      this.formData[sectionKey][fieldKey] = [];
    }
    
    const newItem: any = {};
    if (arrayFields) {
      arrayFields.forEach(f => {
        if (f.type === 'array') {
            newItem[f.key] = [];
        } else {
            newItem[f.key] = '';
        }
      });
    }
    
    this.formData[sectionKey][fieldKey].push(newItem);
    this.onDataChange();
  }

  removeArrayItem(sectionKey: string, fieldKey: string, index: number) {
    this.formData[sectionKey][fieldKey].splice(index, 1);
    this.onDataChange();
  }
}
