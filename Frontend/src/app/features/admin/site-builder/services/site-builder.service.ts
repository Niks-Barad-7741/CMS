import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SITE_BUILDER_TEMPLATES, TemplateSchema } from '../../../../core/constants/template-schemas';

@Injectable({
  providedIn: 'root'
})
export class SiteBuilderService {
  private currentTemplateSubject = new BehaviorSubject<TemplateSchema | null>(null);
  currentTemplate$ = this.currentTemplateSubject.asObservable();

  private formDataSubject = new BehaviorSubject<any>({});
  formData$ = this.formDataSubject.asObservable();

  constructor() {}

  getTemplates(): TemplateSchema[] {
    return SITE_BUILDER_TEMPLATES;
  }

  getTemplateById(id: string): TemplateSchema | undefined {
    return SITE_BUILDER_TEMPLATES.find(t => t.id === id);
  }

  setCurrentTemplate(template: TemplateSchema | null) {
    this.currentTemplateSubject.next(template);
    if (template) {
      // Initialize form data structure based on template sections
      const initialData: any = {};
      template.sections.forEach(section => {
        initialData[section.key] = {};
        section.fields.forEach(field => {
          if (field.type === 'array') {
            initialData[section.key][field.key] = [];
          } else {
            initialData[section.key][field.key] = '';
          }
        });
      });
      this.formDataSubject.next(initialData);
    } else {
      this.formDataSubject.next({});
    }
  }

  updateFormData(data: any) {
    this.formDataSubject.next({ ...this.formDataSubject.value, ...data });
  }
  
  getFormData(): any {
    return this.formDataSubject.value;
  }

  // Generate HTML from template and form data
  generateHtml(template: TemplateSchema, data: any): string {
    // This is a basic implementation. Ideally, use a template engine like Handlebars or EJS, 
    // or string interpolation specific to each template.
    // For now we'll do a simple switch based on template id
    
    let html = `<div class="font-sans text-gray-900 bg-white min-h-screen">`;
    
    switch (template.id) {
      case 'business-corporate':
        html += this.renderBusinessTemplate(data);
        break;
      case 'restaurant':
        html += this.renderRestaurantTemplate(data);
        break;
      case 'portfolio':
        html += this.renderPortfolioTemplate(data);
        break;
      case 'blog':
        html += this.renderBlogTemplate(data);
        break;
      default:
        html += `<div>Template not implemented.</div>`;
    }
    
    html += `</div>`;
    return html;
  }
  
  private renderBusinessTemplate(data: any): string {
    const hero = data.hero || {};
    const about = data.about || {};
    const services = data.services || {};
    
    let servicesHtml = '';
    if (services.items && Array.isArray(services.items)) {
      servicesHtml = services.items.map((item: any) => `
        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          ${item.iconUrl ? `<img src="${item.iconUrl}" alt="icon" class="w-12 h-12 mb-4" />` : ''}
          <h3 class="text-xl font-bold mb-2">${item.title || 'Service'}</h3>
          <p class="text-gray-600">${item.description || 'Description'}</p>
        </div>
      `).join('');
    }
    
    return `
      <!-- Hero Section -->
      <header class="relative bg-gray-900 text-white min-h-[500px] flex items-center justify-center bg-cover bg-center" style="background-image: url('${hero.backgroundImage || ''}')">
        <div class="absolute inset-0 bg-black opacity-50"></div>
        <div class="relative z-10 text-center px-4 max-w-4xl mx-auto py-20">
          <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">${hero.headline || 'Your Headline Here'}</h1>
          <p class="text-xl md:text-2xl mb-10 text-gray-200">${hero.subheadline || 'Your subheadline text goes here.'}</p>
          ${hero.ctaText ? `<a href="${hero.ctaLink || '#'}" class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300 shadow-lg">${hero.ctaText}</a>` : ''}
        </div>
      </header>

      <!-- About Section -->
      <section class="py-20 px-4 bg-gray-50">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div class="md:w-1/2">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">${about.heading || 'About Us'}</h2>
            <div class="prose prose-lg text-gray-600">${about.content || 'Share something about your company here.'}</div>
          </div>
          ${about.image ? `
          <div class="md:w-1/2">
            <img src="${about.image}" alt="About" class="rounded-xl shadow-2xl w-full object-cover" />
          </div>
          ` : ''}
        </div>
      </section>

      <!-- Services Section -->
      <section class="py-20 px-4 bg-white">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900">${services.heading || 'Our Services'}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${servicesHtml}
          </div>
        </div>
      </section>
    `;
  }
  
  private renderRestaurantTemplate(data: any): string {
    const hero = data.hero || {};
    const menu = data.menu || {};
    const contact = data.contact || {};
    
    let categoriesHtml = '';
    if (menu.categories && Array.isArray(menu.categories)) {
      categoriesHtml = menu.categories.map((cat: any) => {
        let itemsHtml = '';
        if (cat.items && Array.isArray(cat.items)) {
          itemsHtml = cat.items.map((item: any) => `
            <div class="flex justify-between items-baseline mb-4 border-b border-gray-200 border-dashed pb-4">
              <div>
                <h4 class="text-lg font-bold text-gray-900">${item.name || 'Dish Name'}</h4>
                <p class="text-gray-500 text-sm mt-1">${item.description || 'Description'}</p>
              </div>
              <div class="text-lg font-bold text-orange-600">${item.price || '$0.00'}</div>
            </div>
          `).join('');
        }
        
        return `
          <div class="mb-12">
            <h3 class="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-orange-500 inline-block">${cat.categoryName || 'Category'}</h3>
            <div>${itemsHtml}</div>
          </div>
        `;
      }).join('');
    }

    return `
      <!-- Hero -->
      <header class="relative bg-gray-900 text-white min-h-[60vh] flex items-center justify-center bg-cover bg-center" style="background-image: url('${hero.heroImage || ''}')">
        <div class="absolute inset-0 bg-black opacity-60"></div>
        <div class="relative z-10 text-center px-4 py-20">
          <h1 class="text-6xl md:text-7xl font-extrabold tracking-tight mb-4 font-serif">${hero.restaurantName || 'Restaurant Name'}</h1>
          <p class="text-xl md:text-2xl text-orange-400 italic font-serif">${hero.tagline || 'Your tagline here'}</p>
        </div>
      </header>
      
      <!-- Menu -->
      <section class="py-20 px-4 bg-orange-50">
        <div class="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-gray-900 font-serif">${menu.heading || 'Our Menu'}</h2>
          </div>
          ${categoriesHtml}
        </div>
      </section>
      
      <!-- Contact -->
      <section class="py-16 bg-gray-900 text-white px-4 text-center">
        <div class="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-2xl font-bold text-orange-400 mb-4 font-serif">Visit Us</h3>
            <p class="whitespace-pre-line text-gray-300 text-lg">${contact.address || 'Your address here'}</p>
            <p class="mt-4 text-xl">${contact.phone || 'Phone Number'}</p>
          </div>
          <div>
            <h3 class="text-2xl font-bold text-orange-400 mb-4 font-serif">Hours</h3>
            <div class="text-gray-300 prose prose-invert mx-auto">${contact.hours || 'Hours of operation'}</div>
          </div>
        </div>
      </section>
    `;
  }
  
  private renderPortfolioTemplate(data: any): string {
    const intro = data.intro || {};
    const projects = data.projects || {};
    const contact = data.contact || {};
    
    let projectsHtml = '';
    if (projects.items && Array.isArray(projects.items)) {
      projectsHtml = projects.items.map((item: any) => `
        <a ${item.link ? `href="${item.link}" target="_blank"` : ''} class="group block bg-gray-50 rounded-2xl overflow-hidden hover:shadow-2xl transition duration-300 border border-gray-100">
          ${item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />` : '<div class="w-full h-64 bg-gray-200"></div>'}
          <div class="p-8">
            <h3 class="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition">${item.title || 'Project Name'}</h3>
            <p class="text-gray-600 leading-relaxed">${item.description || 'Project description goes here.'}</p>
          </div>
        </a>
      `).join('');
    }
    
    return `
      <!-- Intro -->
      <section class="pt-32 pb-20 px-4 bg-white text-center">
        <div class="max-w-3xl mx-auto">
          ${intro.profilePicture ? `<img src="${intro.profilePicture}" alt="Profile" class="w-32 h-32 rounded-full mx-auto object-cover mb-8 shadow-xl border-4 border-white" />` : ''}
          <h1 class="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">${intro.name || 'Your Name'}</h1>
          <p class="text-2xl text-blue-600 font-medium mb-8">${intro.role || 'Your Role'}</p>
          <p class="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">${intro.bio || 'Your bio here'}</p>
        </div>
      </section>
      
      <!-- Projects -->
      <section class="py-20 px-4 bg-gray-100">
        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            ${projectsHtml}
          </div>
        </div>
      </section>
      
      <!-- Contact Footer -->
      <footer class="py-16 px-4 bg-white border-t border-gray-200 text-center">
        <div class="flex justify-center gap-6 mb-8">
          ${contact.email ? `<a href="mailto:${contact.email}" class="text-gray-500 hover:text-blue-600 transition"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></a>` : ''}
          ${contact.linkedin ? `<a href="${contact.linkedin}" target="_blank" class="text-gray-500 hover:text-blue-600 transition"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>` : ''}
          ${contact.github ? `<a href="${contact.github}" target="_blank" class="text-gray-500 hover:text-gray-900 transition"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
        </div>
      </footer>
    `;
  }
  
  private renderBlogTemplate(data: any): string {
    const header = data.header || {};
    const content = data.content || {};
    
    return `
      <article class="bg-white">
        <header class="pt-24 pb-12 px-4 text-center max-w-4xl mx-auto">
          <p class="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-4">${header.category || 'Category'}</p>
          <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">${header.title || 'Article Title'}</h1>
          <div class="flex items-center justify-center gap-4 text-gray-600">
            <span class="font-medium text-gray-900">${header.authorName || 'Author Name'}</span>
            <span>&bull;</span>
            <span>${header.publishDate || 'Date'}</span>
          </div>
        </header>
        
        ${header.coverImage ? `
        <div class="max-w-5xl mx-auto px-4 mb-16">
          <img src="${header.coverImage}" alt="Cover" class="w-full rounded-2xl shadow-lg object-cover h-[50vh]" />
        </div>
        ` : ''}
        
        <div class="max-w-3xl mx-auto px-4 pb-24">
          <div class="prose prose-lg prose-indigo md:prose-xl mx-auto">
            ${content.body || '<p>Write your amazing story here...</p>'}
          </div>
        </div>
      </article>
    `;
  }
}
