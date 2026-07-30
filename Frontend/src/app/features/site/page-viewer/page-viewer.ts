import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PageService, PageContent } from '../../../core/services/page.service';
import { TenantService } from '../../../core/services/tenant.service';
import { resolveOrgSlug } from '../../../core/utils/tenant-route.util';
import { getStaticSitePage } from '../../../core/constants/static-site.data';

@Component({
  selector: 'app-page-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-viewer.html'
})
export class PageViewerComponent implements OnInit {
  pageSlug: string = '';
  orgSlug: string = '';

  pageContent: PageContent | null = null;
  safeBodyHtml: SafeHtml | null = null;

  isLoading = true;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    private tenantService: TenantService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageSlug = params.get('pageSlug') || 'home';
      this.orgSlug = resolveOrgSlug(this.route, this.tenantService.getTenantSlug()) || 'site';
      this.loadContent();
    });
  }

  loadContent() {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.detectChanges();

    this.pageService.getPublicPage(this.orgSlug, this.pageSlug).subscribe({
      next: (res: any) => {
        const page = res?.data || res;
        if (page && (page.bodyHtml || page.contentJson)) {
          this.pageContent = page;
          let cleanedHtml = this.renderHtmlFromContentJson(page);

          // Strip standalone header, nav, and footer elements to prevent overlaying the site layout navbar
          if (cleanedHtml.includes('<header') || cleanedHtml.includes('<nav') || cleanedHtml.includes('<footer') || cleanedHtml.includes('<!DOCTYPE') || cleanedHtml.includes('<html')) {
            try {
              const parser = new DOMParser();
              const doc = parser.parseFromString(cleanedHtml, 'text/html');
              doc.querySelectorAll('header, nav, footer').forEach(el => el.remove());
              cleanedHtml = doc.body ? doc.body.innerHTML : cleanedHtml;
            } catch (e) {
              console.error('Error stripping layout elements:', e);
            }
          }

          this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(cleanedHtml);
          this.isLoading = false;
          this.hasError = false;
          this.cdr.detectChanges();
        } else {
          this.pageContent = null;
          this.safeBodyHtml = null;
          this.isLoading = false;
          this.hasError = true;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.pageContent = null;
        this.safeBodyHtml = null;
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    });
  }

  private renderHtmlFromContentJson(page: any): string {
    if (!page.contentJson && page.bodyHtml) {
      return page.bodyHtml;
    }

    try {
      const data = page.contentJson 
        ? (typeof page.contentJson === 'string' ? JSON.parse(page.contentJson) : page.contentJson)
        : null;

      // Fallback: If page has no contentJson configuration, generate a default fallback layout based on pageSlug/title
      if (!data || (!data.sections && !data.companyName)) {
        return this.renderDefaultFallbackPage(page);
      }

      // If it is the legacy key-value template configuration, map to legacy template renderer
      if (!data.sections || !Array.isArray(data.sections)) {
        return this.renderLegacyTemplate(page, data);
      }

      // Render the new dynamic Section & Block layout
      let html = '';
      
      // Sort sections by sortOrder
      const sortedSections = [...data.sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      
      for (const section of sortedSections) {
        const bg = section.style?.backgroundColor || '#ffffff';
        const textCol = section.style?.textColor || '#1f2937';
        const padding = section.style?.paddingY || 'py-16';
        
        html += `
          <div class="w-full ${padding}" style="background-color: ${bg}; color: ${textCol};">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        `;
        
        // Sort blocks inside section by sortOrder
        const sortedBlocks = [...(section.blocks || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        for (const block of sortedBlocks) {
          const blockStyle = block.style || {};
          const blockContent = block.content || {};
          
          if (block.type === 'heading') {
            const level = blockContent.level || 2;
            const align = blockContent.align || 'left';
            const size = blockStyle.fontSize || 'text-3xl';
            const color = blockStyle.textColor || textCol;
            
            html += `
              <h${level} class="${size} font-black tracking-tight mb-6 text-${align}" style="color: ${color};">
                ${blockContent.text || ''}
              </h${level}>
            `;
          } else if (block.type === 'paragraph') {
            const align = blockContent.align || 'left';
            const size = blockStyle.fontSize || 'text-base';
            const color = blockStyle.textColor || textCol;
            
            html += `
              <p class="${size} leading-relaxed mb-6 text-${align}" style="color: ${color};">
                ${blockContent.text || ''}
              </p>
            `;
          } else if (block.type === 'gallery') {
            const gridCols = blockStyle.gridCols || 'grid-cols-2';
            const images = blockContent.images || [];
            
            html += `
              <div class="grid ${gridCols} gap-6 mb-8 w-full">
            `;
            for (const img of images) {
              html += `
                <div class="group relative overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100 hover:shadow-lg transition-shadow">
                  <img src="${img.url || ''}" alt="${img.caption || ''}" class="w-full h-64 object-cover">
                  ${img.caption ? `
                    <div class="p-4 bg-slate-900/80 backdrop-blur-[2px] absolute bottom-0 inset-x-0 text-white text-xs font-bold text-center">
                      ${img.caption}
                    </div>
                  ` : ''}
                </div>
              `;
            }
            html += `
              </div>
            `;
          }
        }
        
        html += `
            </div>
          </div>
        `;
      }
      
      return html;
    } catch (e) {
      console.error('Error rendering dynamic page content:', e);
      return `<p class="p-8 text-center text-red-500">Error rendering page content.</p>`;
    }
  }

  private renderDefaultFallbackPage(page: any): string {
    const title = page.title || 'Welcome';
    return `
      <div class="w-full py-24 bg-slate-50 text-slate-800 text-center">
        <div class="max-w-4xl mx-auto px-4">
          <h1 class="text-5xl font-black mb-6 tracking-tight text-slate-900">${title}</h1>
          <p class="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            This page content has been initialized. You can edit this page dynamically from the admin panel to add headers, text paragraphs, customize colors, and create galleries.
          </p>
        </div>
      </div>
    `;
  }

  private renderLegacyTemplate(page: any, data: any): string {
    const title = (page.title || '').toLowerCase();
    const slug = (this.pageSlug || '').toLowerCase();

    if (title.includes('home') || slug === 'home') {
      const bgStyle = data.homeBackgroundImage ? `style="background-image: url('${data.homeBackgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;"` : 'style="background-color: #0A0F1A;"';
      return `
        <div class="relative w-full min-h-[600px] flex flex-col justify-center -mt-[1px] mb-12 pt-20 pb-20" ${bgStyle}>
          <div class="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>
          <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div class="max-w-3xl">
              <h4 class="text-cyan-700 font-bold text-sm tracking-widest uppercase mb-4">
                ${data.homeSubtitle || 'WELCOME TO ' + (data.companyName || 'OUR PLATFORM').toUpperCase()}
              </h4>
              <h1 class="text-5xl md:text-[3.5rem] font-black text-[#111827] mb-6 leading-[1.1] tracking-tight">
                ${data.homeHeroTitle || 'How Velvix Technology fulfills American Dreams?'}
              </h1>
              <p class="text-lg text-gray-700 mb-10 leading-relaxed font-medium max-w-2xl">
                ${data.homeHeroSubtitle || data.tagline || 'By practicing the time-tested formula and our very own service techniques.'}
              </p>
              <div class="flex flex-col sm:flex-row items-center gap-4">
                <a href="#" class="w-full sm:w-auto px-8 py-3.5 bg-[#0891b2] hover:bg-[#06b6d4] text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30">
                  ${data.homeCtaText || 'Book A Consultation'}
                </a>
                <a href="#" class="w-full sm:w-auto px-8 py-3.5 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-900/30">
                  ${data.homeSecondaryCtaText || 'Explore Services'}
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    if (title.includes('about') || slug.includes('about')) {
      return `
        <div class="max-w-6xl mx-auto pt-8">
          <div class="text-center mb-20 relative">
            <h1 class="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">${data.aboutTitle || 'Our Story'}</h1>
            <p class="text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">${data.aboutSubtitle || 'Discover the passion and purpose driving our mission forward.'}</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20">
            <img src="${data.aboutImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop'}" alt="About" class="w-full rounded-3xl shadow-2xl object-cover h-[500px]">
            <div class="space-y-8">
              <p class="text-xl text-slate-800 font-medium mb-6">${data.aboutStory1 || 'We started with a simple idea.'}</p>
              <p>${data.aboutStory2 || 'Over the years, our team has grown.'}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (title.includes('service') || slug.includes('service')) {
      return `
        <div class="pt-8">
          <div class="text-center mb-20 max-w-3xl mx-auto">
            <h1 class="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">${data.servicesTitle || 'Our Services'}</h1>
            <p class="text-xl text-slate-500 font-light leading-relaxed">${data.servicesSubtitle || 'Discover how we can help elevate your organization.'}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="group bg-white rounded-[2rem] p-10 shadow-md border border-slate-100">
              <h3 class="text-2xl font-bold mb-4">${data.service1Title || 'Web Development'}</h3>
              <p class="text-slate-500 font-light mb-8">${data.service1Desc || 'Crafting responsive, high-performance websites.'}</p>
            </div>
            <div class="group bg-white rounded-[2rem] p-10 shadow-md border border-slate-100">
              <h3 class="text-2xl font-bold mb-4">${data.service2Title || 'App Design'}</h3>
              <p class="text-slate-500 font-light mb-8">${data.service2Desc || 'Designing intuitive mobile applications.'}</p>
            </div>
            <div class="group bg-white rounded-[2rem] p-10 shadow-md border border-slate-100">
              <h3 class="text-2xl font-bold mb-4">${data.service3Title || 'Digital Marketing'}</h3>
              <p class="text-slate-500 font-light mb-8">${data.service3Desc || 'Data-driven marketing strategies.'}</p>
            </div>
          </div>
        </div>
      `;
    }

    if (title.includes('contact') || slug.includes('contact')) {
      return `
        <div class="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-5">
            <div class="lg:col-span-2 bg-[#0A0F1A] text-white p-12">
              <h2 class="text-4xl font-black mb-4">${data.contactTitle || "Let's Talk"}</h2>
              <p class="text-indigo-200 mb-12">${data.contactSubtitle || 'We would love to hear from you.'}</p>
              <div class="space-y-8">
                <div>📍 ${data.address || 'Office Address'}</div>
                <div>✉️ ${data.email || 'hello@company.com'}</div>
                <div>📞 ${data.phone || '+1 (555) 123-4567'}</div>
              </div>
            </div>
            <div class="lg:col-span-3 p-12">
              <h3 class="text-2xl font-bold mb-8">Send a Message</h3>
              <form class="space-y-6">
                <input type="text" placeholder="Your Name" class="w-full p-4 bg-slate-50 border rounded-2xl">
                <input type="email" placeholder="Your Email" class="w-full p-4 bg-slate-50 border rounded-2xl">
                <textarea placeholder="Message" rows="5" class="w-full p-4 bg-slate-50 border rounded-2xl"></textarea>
                <button type="button" class="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">Send</button>
              </form>
            </div>
          </div>
        </div>
      `;
    }

    return page.bodyHtml || '';
  }

  private loadStaticContent() {
    const page = getStaticSitePage(this.orgSlug, this.pageSlug);
    let staticHtml = page ? page.bodyHtml : '';

    if (staticHtml.includes('<header') || staticHtml.includes('<nav') || staticHtml.includes('<footer') || staticHtml.includes('<!DOCTYPE') || staticHtml.includes('<html')) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(staticHtml, 'text/html');
        doc.querySelectorAll('header, nav, footer').forEach(el => el.remove());
        staticHtml = doc.body ? doc.body.innerHTML : staticHtml;
      } catch (e) {}
    }

    this.pageContent = {
      id: 'static',
      organizationId: this.orgSlug,
      menuItemId: 'static',
      title: page ? page.title : 'Page',
      bodyHtml: staticHtml,
      status: 'Published'
    };
    this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(staticHtml);
    this.isLoading = false;
    this.hasError = false;
    this.cdr.detectChanges();
  }
}
