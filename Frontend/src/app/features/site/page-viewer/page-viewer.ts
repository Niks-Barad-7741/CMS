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
  isHomePage = false;

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
      this.isHomePage = this.pageSlug.toLowerCase() === 'home';
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
        if (page && page.contentJson) {
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
          this.loadStaticContent();
        }
      },
      error: (err) => {
        console.error('Failed to load dynamic page content:', err);
        this.loadStaticContent();
      }
    });
  }

  private renderHtmlFromContentJson(page: any): string {
    const title = (page.title || '').toLowerCase();
    const slug = (this.pageSlug || '').toLowerCase();
    let data: any = {};
    
    if (page.contentJson) {
      try {
        data = typeof page.contentJson === 'string' ? JSON.parse(page.contentJson) : page.contentJson;
      } catch (e) {
        console.error('Error rendering HTML from content JSON:', e);
      }
    }

    // Helper to resolve relative /uploads/ paths to the backend server
    const resolveImageUrl = (url: any) => {
      if (typeof url !== 'string') return '';
      return url && url.startsWith('/uploads/') ? `https://localhost:7170${url}` : url;
    };

    if (data.blocks && Array.isArray(data.blocks) && data.blocks.length > 0) {
      return data.blocks.map((block: any) => {
        switch (block.type) {
          case 'hero-banner':
          case 'hero': {
            const bUrl = resolveImageUrl(block.data.bgImage);
            const bg = bUrl
              ? `style="background-image: url('${bUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"`
              : 'style="background: linear-gradient(135deg, #002855 0%, #0A192F 100%);"';
            return `
              <div class="relative w-full min-h-[70vh] flex items-center justify-center" ${bg}>
                <div class="absolute inset-0" style="background: rgba(0, 40, 85, 0.55);"></div>
                <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-24">
                  <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-wider mb-6 leading-tight">${block.data.title || ''}</h1>
                  <p class="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed font-light">${block.data.subtitle || ''}</p>
                  ${block.data.ctaText ? `<a href="${block.data.ctaLink || '#'}" class="inline-block px-10 py-4 bg-white/10 hover:bg-white hover:text-[#002855] text-white font-semibold text-sm uppercase tracking-widest border-2 border-white rounded transition-all duration-300">${block.data.ctaText}</a>` : ''}
                </div>
              </div>
            `;
          }
          case 'solutions-grid': {
            const cardsHtml = (block.data.cards || []).map((card: any) => {
              const img = resolveImageUrl(card.image);
              const imgTag = img ? `<img src="${img}" alt="${card.title || ''}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">` : `<div class="absolute inset-0 w-full h-full bg-[#002855]"></div>`;
              return `
                <a href="${card.link || '#'}" class="group relative block overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1" style="aspect-ratio: 3/4;">
                  ${imgTag}
                  <div class="absolute inset-0 bg-gradient-to-t from-[#002855]/80 via-[#002855]/30 to-transparent group-hover:from-[#0056B3]/90 transition-all duration-500"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-6">
                    <h3 class="text-white text-lg font-bold tracking-wide text-center">${card.title || ''}</h3>
                  </div>
                </a>
              `;
            }).join('');
            return `
              <section class="py-20 bg-white">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  ${block.data.sectionTitle ? `<h2 class="text-3xl md:text-4xl font-extrabold text-[#002855] text-center uppercase tracking-wider mb-16">${block.data.sectionTitle}</h2>` : ''}
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">${cardsHtml}</div>
                </div>
              </section>
            `;
          }
          case 'features-row': {
            const featsHtml = (block.data.items || []).map((item: any) => `
              <div class="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 relative overflow-hidden">
                <div class="absolute top-0 left-0 right-0 h-1 bg-[#0056B3]"></div>
                <div class="w-16 h-16 mx-auto mb-6 flex items-center justify-center text-4xl">${item.icon || '⭐'}</div>
                <p class="text-gray-600 text-center leading-relaxed text-sm">${item.desc || ''}</p>
              </div>
            `).join('');
            return `
              <section class="py-20" style="background: #F8F9FA;">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div class="text-center mb-16">
                    ${block.data.sectionTitle ? `<h2 class="text-3xl md:text-4xl font-extrabold text-[#002855] uppercase tracking-wider mb-4">${block.data.sectionTitle}</h2>` : ''}
                    ${block.data.subtitle ? `<p class="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">${block.data.subtitle}</p>` : ''}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">${featsHtml}</div>
                </div>
              </section>
            `;
          }
          case 'cta-banner':
          case 'cta': {
            return `
              <section class="py-20" style="background: #002855;">
                <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 class="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider mb-8">${block.data.title || ''}</h2>
                  ${block.data.buttonText ? `<a href="${block.data.buttonLink || '#'}" class="inline-block px-12 py-4 bg-transparent hover:bg-white hover:text-[#002855] text-white font-semibold text-sm uppercase tracking-widest border-2 border-white rounded transition-all duration-300">${block.data.buttonText}</a>` : ''}
                </div>
              </section>
            `;
          }
          case 'heading': {
            const align = (block.data.alignment || 'Center').toLowerCase();
            const color = block.data.color || '#002855';
            const level = (block.data.level || 'H2').toLowerCase();
            let sizeClass = 'text-xl md:text-2xl lg:text-3xl';
            if (block.data.size === 'Extra Large') sizeClass = 'text-5xl md:text-6xl lg:text-7xl';
            else if (block.data.size === 'Large') sizeClass = 'text-3xl md:text-4xl lg:text-5xl';
            else if (block.data.size === 'Small') sizeClass = 'text-lg md:text-xl';
            
            return `
              <div class="py-4 text-${align}" style="color: ${color};">
                <${level} class="font-extrabold tracking-tight ${sizeClass}">${block.data.text || ''}</${level}>
              </div>
            `;
          }
          case 'paragraph': {
            const align = (block.data.alignment || 'Left').toLowerCase();
            const color = block.data.color || '#4b5563';
            let sizeClass = 'text-sm md:text-base';
            if (block.data.size === 'Large') sizeClass = 'text-lg md:text-xl';
            else if (block.data.size === 'Small') sizeClass = 'text-xs md:text-sm';
            
            return `
              <div class="py-2 text-${align}" style="color: ${color};">
                <p class="leading-relaxed ${sizeClass}">${block.data.text || ''}</p>
              </div>
            `;
          }
          case 'gallery': {
            const cols = block.data.columns || 3;
            const imagesHtml = (block.data.images || []).map((img: any) => {
              const url = resolveImageUrl(img.url);
              return `
                <div class="group overflow-hidden rounded-lg shadow-sm border border-gray-150">
                  <img src="${url || 'https://images.unsplash.com/photo-1504917595217-d4dc5ede4c21?q=80&w=400'}" alt="${img.caption || ''}" class="w-full h-64 object-cover">
                  ${img.caption ? `<div class="p-2 text-center text-xs text-gray-500 font-medium">${img.caption}</div>` : ''}
                </div>
              `;
            }).join('');
            return `
              <section class="py-10 bg-white">
                <div class="max-w-7xl mx-auto px-4">
                  <div class="grid grid-cols-1 sm:grid-cols-${cols} gap-4">${imagesHtml}</div>
                </div>
              </section>
            `;
          }
          case 'image': {
            const align = (block.data.alignment || 'Center').toLowerCase();
            const url = resolveImageUrl(block.data.url);
            const w = block.data.width || 'auto';
            const h = block.data.height || 'auto';
            const flexAlign = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center';
            return `
              <div class="py-6 flex justify-${flexAlign}">
                <img src="${url || 'https://images.unsplash.com/photo-1504917595217-d4dc5ede4c21?q=80&w=400'}" alt="${block.data.alt || ''}" style="width: ${w}; height: ${h};" class="rounded-lg shadow-sm object-cover max-w-full">
              </div>
            `;
          }
          case 'divider': {
            const h = block.data.height === 'Large' ? '48px' : block.data.height === 'Small' ? '8px' : '24px';
            const style = block.data.borderStyle || 'solid';
            const color = block.data.color || '#e5e7eb';
            return `
              <div style="padding-top: ${h}; padding-bottom: ${h};">
                ${style !== 'spacer' ? `<hr style="border-top: 1px ${style} ${color}; border-bottom: none; border-left: none; border-right: none;">` : ''}
              </div>
            `;
          }
          case 'grid': {
            const cols = block.data.columns || [];
            const colsHtml = cols.map((col: any) => {
              const img = resolveImageUrl(col.image);
              return `
                <div class="flex-grow p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                  ${img ? `<img src="${img}" class="w-full h-48 object-cover rounded-lg mb-4">` : ''}
                  ${col.title ? `<h3 class="text-lg font-bold text-[#002855] mb-2">${col.title}</h3>` : ''}
                  ${col.content ? `<p class="text-sm text-gray-600 leading-relaxed">${col.content}</p>` : ''}
                </div>
              `;
            }).join('');
            return `
              <section class="py-10 bg-white">
                <div class="max-w-7xl mx-auto px-4">
                  <div class="grid grid-cols-1 md:grid-cols-${cols.length || 2} gap-6">${colsHtml}</div>
                </div>
              </section>
            `;
          }
          case 'testimonial': {
            const avatar = resolveImageUrl(block.data.avatar);
            return `
              <section class="py-12 bg-gray-50">
                <div class="max-w-4xl mx-auto px-4 text-center">
                  <div class="text-4xl text-indigo-500 mb-4">“</div>
                  <blockquote class="text-lg md:text-xl font-medium text-gray-800 italic mb-6">
                    ${block.data.quote || ''}
                  </blockquote>
                  <div class="flex items-center justify-center gap-3">
                    ${avatar ? `<img src="${avatar}" class="w-12 h-12 rounded-full object-cover">` : ''}
                    <div class="text-left">
                      <div class="font-bold text-gray-900">${block.data.author || ''}</div>
                      <div class="text-xs text-gray-500">${block.data.role || ''}</div>
                    </div>
                  </div>
                </div>
              </section>
            `;
          }
          case 'video': {
            const url = block.data.url || '';
            const ratio = block.data.aspectRatio === '4:3' ? '4/3' : '16/9';
            let embedUrl = url;
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              if (!url.includes('embed')) {
                const vid = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
                embedUrl = 'https://www.youtube.com/embed/' + vid;
              }
            } else if (url.includes('vimeo.com')) {
              if (!url.includes('player.vimeo.com')) {
                const vid = url.split('/').pop();
                embedUrl = 'https://player.vimeo.com/video/' + vid;
              }
            }
            return `
              <div class="py-6 flex justify-center">
                <div class="w-full max-w-4xl" style="aspect-ratio: ${ratio};">
                  <iframe src="${embedUrl || 'about:blank'}" class="w-full h-full rounded-lg shadow-md border-0" allowfullscreen></iframe>
                </div>
              </div>
            `;
          }
          default:
            return '';
        }
      }).join('');
    }

    if (title.includes('home') || slug.includes('home')) {
        // Fallback for old data without blocks
        const bgStyle = data.homeBackgroundImage ? `style="background-image: url('${resolveImageUrl(data.homeBackgroundImage)}'); background-size: cover; background-position: center; background-repeat: no-repeat;"` : 'style="background-color: #0A0F1A;"';

        return `
          <!-- HERO -->
          <div class="relative w-full h-[600px] flex items-center justify-center overflow-hidden"
               ${bgStyle}>
            
            <!-- Overlay to ensure text readability -->
            <div class="absolute inset-0 bg-white/30 backdrop-blur-[1px]"></div>

            <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div class="max-w-3xl">
                <h1 class="text-5xl sm:text-6xl lg:text-7xl font-black text-[#002855] uppercase tracking-tighter mb-6 leading-[1.1]">
                  ${data.homeHeroTitle || data.companyName || 'Welcome'}
                </h1>
                <p class="text-xl sm:text-2xl text-[#0056B3] font-medium max-w-2xl leading-snug mb-10">
                  ${data.homeHeroSubtitle || data.tagline || ''}
                </p>
                <div class="flex gap-4">
                  <a href="/site/${slug}/about" class="px-8 py-4 bg-[#002855] hover:bg-[#0056B3] text-white font-bold text-sm uppercase tracking-widest rounded-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    ${data.homeCtaText || 'Learn More'}
                  </a>
                  <a href="/site/${slug}/contact" class="px-8 py-4 bg-white hover:bg-gray-50 text-[#002855] font-bold text-sm uppercase tracking-widest rounded-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                    Contact Us
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
              <div class="inline-block relative">
                <h1 class="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight relative z-10">${data.aboutTitle || 'Our Story'}</h1>
                <div class="absolute -bottom-2 -right-4 w-24 h-6 bg-indigo-200 -z-10 -rotate-2"></div>
              </div>
              <p class="text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed">${data.aboutSubtitle || 'Discover the passion and purpose driving our mission forward.'}</p>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20">
              <div class="relative group">
                <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 -z-10"></div>
                <img src="${data.aboutImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop'}" alt="About" class="w-full rounded-3xl shadow-2xl object-cover h-[500px] group-hover:scale-[1.02] transition-transform duration-700">
                <div class="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs animate-bounce" style="animation-duration: 3s;">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-bold">✓</div>
                    <div>
                      <div class="font-bold text-slate-900">Trusted by many</div>
                      <div class="text-sm text-slate-500">Years of excellence</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="space-y-8">
                <div class="prose prose-lg text-slate-600 font-light leading-relaxed">
                  <p class="text-xl text-slate-800 font-medium mb-6">${data.aboutStory1 || 'We started with a simple idea: to make complex systems beautiful and intuitive.'}</p>
                  <p>${data.aboutStory2 || 'Over the years, our team has grown, but our core philosophy remains unchanged. We believe in crafting digital experiences that empower organizations to reach their full potential.'}</p>
                </div>
                
                <div class="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h3 class="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Why choose us</h3>
                  <ul class="space-y-5">
                    ${data.aboutPoint1 ? `
                      <li class="flex items-start group">
                        <span class="w-8 h-8 rounded-xl bg-white shadow-sm text-indigo-600 flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">✓</span>
                        <span class="text-slate-700 font-medium mt-1">${data.aboutPoint1}</span>
                      </li>
                    ` : ''}
                    ${data.aboutPoint2 ? `
                      <li class="flex items-start group">
                        <span class="w-8 h-8 rounded-xl bg-white shadow-sm text-indigo-600 flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">✓</span>
                        <span class="text-slate-700 font-medium mt-1">${data.aboutPoint2}</span>
                      </li>
                    ` : ''}
                    ${data.aboutPoint3 ? `
                      <li class="flex items-start group">
                        <span class="w-8 h-8 rounded-xl bg-white shadow-sm text-indigo-600 flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">✓</span>
                        <span class="text-slate-700 font-medium mt-1">${data.aboutPoint3}</span>
                      </li>
                    ` : ''}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      if (title.includes('service') || slug.includes('service')) {
        return `
          <div class="pt-8">
            <div class="text-center mb-20 max-w-3xl mx-auto">
              <h2 class="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4">What we do</h2>
              <h1 class="text-5xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">${data.servicesTitle || 'Premium Services'}</h1>
              <p class="text-xl text-slate-500 font-light leading-relaxed">${data.servicesSubtitle || 'Discover how we can help elevate your organization to new heights with our specialized offerings.'}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Service 1 -->
              <div class="group bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:border-indigo-100 transition-all duration-500 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div class="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">💻</div>
                <h3 class="text-2xl font-bold text-slate-900 mb-4">${data.service1Title || 'Digital Transformation'}</h3>
                <p class="text-slate-500 font-light leading-relaxed mb-8">${data.service1Desc || 'Modernize your infrastructure with cutting edge technologies tailored to your specific needs.'}</p>
                <a href="#" class="inline-flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
                  Learn more
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>
              
              <!-- Service 2 -->
              <div class="group bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(168,85,247,0.1)] hover:border-purple-100 transition-all duration-500 relative overflow-hidden mt-0 md:mt-12">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div class="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:-rotate-12">📱</div>
                <h3 class="text-2xl font-bold text-slate-900 mb-4">${data.service2Title || 'Mobile Experiences'}</h3>
                <p class="text-slate-500 font-light leading-relaxed mb-8">${data.service2Desc || 'Engaging mobile applications that deliver intuitive functionality right to your users fingertips.'}</p>
                <a href="#" class="inline-flex items-center text-purple-600 font-semibold group-hover:text-purple-700">
                  Learn more
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>
              
              <!-- Service 3 -->
              <div class="group bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(14,165,233,0.1)] hover:border-sky-100 transition-all duration-500 relative overflow-hidden mt-0 md:mt-24">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-sky-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div class="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">📈</div>
                <h3 class="text-2xl font-bold text-slate-900 mb-4">${data.service3Title || 'Data Analytics'}</h3>
                <p class="text-slate-500 font-light leading-relaxed mb-8">${data.service3Desc || 'Actionable insights derived from complex data to help you make informed business decisions.'}</p>
                <a href="#" class="inline-flex items-center text-sky-600 font-semibold group-hover:text-sky-700">
                  Learn more
                  <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </a>
              </div>
            </div>
          </div>
        `;
      }

      if (title.includes('contact') || slug.includes('contact')) {
        return `
          <div class="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden relative">
            <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full pointer-events-none"></div>
            
            <div class="grid grid-cols-1 lg:grid-cols-5 h-full">
              <!-- Info Side -->
              <div class="lg:col-span-2 bg-[#0A0F1A] text-white p-12 lg:p-16 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
                <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/30 blur-[60px] rounded-full"></div>
                
                <div class="relative z-10 h-full flex flex-col">
                  <div>
                    <h2 class="text-4xl font-black mb-4 tracking-tight">${data.contactTitle || "Let's Talk"}</h2>
                    <p class="text-indigo-200 font-light text-lg mb-12">${data.contactSubtitle || 'We would love to hear from you. Reach out and we will respond as soon as possible.'}</p>
                  </div>
                  
                  <div class="space-y-8 mt-auto">
                    <div class="flex items-start gap-5 group">
                      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-500 group-hover:scale-110 transition-all">📍</div>
                      <div>
                        <div class="text-sm text-indigo-300 mb-1 uppercase tracking-wider font-bold">Visit Us</div>
                        <div class="font-light">${data.address || '123 Innovation Drive<br>Tech City, TC 90210'}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start gap-5 group">
                      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-500 group-hover:scale-110 transition-all">✉️</div>
                      <div>
                        <div class="text-sm text-indigo-300 mb-1 uppercase tracking-wider font-bold">Email Us</div>
                        <div class="font-light">${data.email || 'hello@company.com'}</div>
                      </div>
                    </div>
                    
                    <div class="flex items-start gap-5 group">
                      <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0 group-hover:bg-indigo-500 group-hover:scale-110 transition-all">📞</div>
                      <div>
                        <div class="text-sm text-indigo-300 mb-1 uppercase tracking-wider font-bold">Call Us</div>
                        <div class="font-light">${data.phone || '+1 (555) 123-4567'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Form Side -->
              <div class="lg:col-span-3 p-12 lg:p-20 relative z-10">
                <h3 class="text-2xl font-bold text-slate-900 mb-8">Send a Message</h3>
                
                <form class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700">First Name</label>
                      <input type="text" placeholder="John" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    </div>
                    <div class="space-y-2">
                      <label class="text-sm font-medium text-slate-700">Last Name</label>
                      <input type="text" placeholder="Doe" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                    </div>
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700">Email Address</label>
                    <input type="email" placeholder="john@example.com" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  </div>
                  
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-slate-700">Your Message</label>
                    <textarea placeholder="How can we help you?" rows="5" class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"></textarea>
                  </div>
                  
                  <button type="button" class="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1 transition-all duration-300">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        `;
      }
    if (page.bodyHtml) return page.bodyHtml;
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
