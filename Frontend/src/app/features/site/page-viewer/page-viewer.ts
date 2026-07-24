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
    if (page.bodyHtml) return page.bodyHtml;
    if (!page.contentJson) return '';

    try {
      const data = typeof page.contentJson === 'string' ? JSON.parse(page.contentJson) : page.contentJson;
      const title = (page.title || this.pageSlug || '').toLowerCase();

      if (title.includes('home')) {
        return `
          <div class="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-white p-12 md:p-20 text-center rounded-3xl mb-12 shadow-2xl">
            <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">${data.homeHeroTitle || data.companyName || 'Welcome'}</h1>
            <p class="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">${data.homeHeroSubtitle || data.tagline || ''}</p>
            <div class="flex items-center justify-center gap-4">
              <a href="#" class="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg">${data.homeCtaText || 'Get Started'}</a>
              ${data.homeSecondaryCtaText ? `<a href="#" class="border-2 border-white/40 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">${data.homeSecondaryCtaText}</a>` : ''}
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">🚀</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.homeFeature1Title || 'Feature 1'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.homeFeature1Desc || ''}</p>
            </div>
            <div class="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">🛡️</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.homeFeature2Title || 'Feature 2'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.homeFeature2Desc || ''}</p>
            </div>
            <div class="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">⚡</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.homeFeature3Title || 'Feature 3'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.homeFeature3Desc || ''}</p>
            </div>
          </div>
        `;
      }

      if (title.includes('about')) {
        return `
          <div class="text-center mb-16">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${data.aboutTitle || 'About Us'}</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">${data.aboutSubtitle || ''}</p>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <img src="${data.aboutImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop'}" alt="About" class="w-full rounded-3xl shadow-xl">
            <div class="space-y-6">
              <p class="text-gray-700 text-lg leading-relaxed">${data.aboutStory1 || ''}</p>
              <p class="text-gray-600 leading-relaxed">${data.aboutStory2 || ''}</p>
              <ul class="space-y-4 pt-4">
                ${data.aboutPoint1 ? `<li class="flex items-center text-gray-800 font-semibold"><span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm mr-3">✓</span> ${data.aboutPoint1}</li>` : ''}
                ${data.aboutPoint2 ? `<li class="flex items-center text-gray-800 font-semibold"><span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm mr-3">✓</span> ${data.aboutPoint2}</li>` : ''}
                ${data.aboutPoint3 ? `<li class="flex items-center text-gray-800 font-semibold"><span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm mr-3">✓</span> ${data.aboutPoint3}</li>` : ''}
              </ul>
            </div>
          </div>
        `;
      }

      if (title.includes('service')) {
        return `
          <div class="text-center mb-16">
            <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${data.servicesTitle || 'Our Services'}</h1>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">${data.servicesSubtitle || ''}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all text-center">
              <div class="text-4xl mb-4">💻</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.service1Title || 'Service 1'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.service1Desc || ''}</p>
            </div>
            <div class="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all text-center">
              <div class="text-4xl mb-4">📱</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.service2Title || 'Service 2'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.service2Desc || ''}</p>
            </div>
            <div class="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl transition-all text-center">
              <div class="text-4xl mb-4">📈</div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">${data.service3Title || 'Service 3'}</h3>
              <p class="text-gray-600 leading-relaxed">${data.service3Desc || ''}</p>
            </div>
          </div>
        `;
      }

      if (title.includes('contact')) {
        return `
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 class="text-4xl font-extrabold text-gray-900 mb-4">${data.contactTitle || 'Get in Touch'}</h1>
              <p class="text-xl text-gray-600 mb-8 leading-relaxed">${data.contactSubtitle || ''}</p>
              <div class="space-y-4 text-gray-700">
                <p class="flex items-center"><span class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">📍</span> ${data.address || ''}</p>
                <p class="flex items-center"><span class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">✉️</span> ${data.email || ''}</p>
                <p class="flex items-center"><span class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-4">📞</span> ${data.phone || ''}</p>
              </div>
            </div>
            <div class="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <input type="text" placeholder="Your Name" class="w-full p-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500">
              <input type="email" placeholder="Your Email" class="w-full p-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500">
              <textarea placeholder="Your Message" rows="4" class="w-full p-4 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
              <button class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all">Send Message</button>
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.error('Error parsing contentJson in page viewer:', e);
    }
    return '';
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
