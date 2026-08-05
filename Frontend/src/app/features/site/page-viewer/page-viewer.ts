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

    if (title.includes('home') || slug.includes('home')) {
        if (data.blocks && Array.isArray(data.blocks)) {
          return data.blocks.map((block: any) => {
            switch (block.type) {
              case 'hero-banner': {
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
              case 'cta-banner': {
                return `
                  <section class="py-20" style="background: #002855;">
                    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                      <h2 class="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider mb-8">${block.data.title || ''}</h2>
                      ${block.data.buttonText ? `<a href="${block.data.buttonLink || '#'}" class="inline-block px-12 py-4 bg-transparent hover:bg-white hover:text-[#002855] text-white font-semibold text-sm uppercase tracking-widest border-2 border-white rounded transition-all duration-300">${block.data.buttonText}</a>` : ''}
                    </div>
                  </section>
                `;
              }
              default:
                return '';
            }
          }).join('');
        }

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

      // Render the new dynamic Section & Block layout
      let html = '';
      
      // Sort sections by sortOrder
      const sortedSections = [...data.sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const primaryColor = data.globalTheme?.primaryColor || '#6366F1';
      
      for (const section of sortedSections) {
        const bgType = section.style?.backgroundType || 'color';
        const bgCol = section.style?.backgroundColor || '#ffffff';
        const bgImg = section.style?.backgroundImageUrl || '';
        const bgSize = section.style?.backgroundSize || 'cover';
        const bgOpacity = section.style?.overlayOpacity !== undefined ? section.style?.overlayOpacity : 0;
        const textCol = section.style?.textColor || '#1f2937';
        const padding = section.style?.paddingY || 'py-16';
        
        let sectionStyle = '';
        if (bgType === 'image' && bgImg) {
          const repeatStyle = bgSize === 'repeat' ? 'repeat' : 'no-repeat';
          sectionStyle = `background-image: url('${bgImg}'); background-size: ${bgSize}; background-position: center; background-repeat: ${repeatStyle}; position: relative; color: ${textCol};`;
        } else {
          sectionStyle = `background-color: ${bgCol}; color: ${textCol}; position: relative;`;
        }
        
        html += `
          <div class="w-full ${padding}" style="${sectionStyle}">
            ${bgType === 'image' && bgImg ? `<div class="absolute inset-0 bg-black pointer-events-none" style="opacity: ${bgOpacity / 100};"></div>` : ''}
            <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
          } else if (block.type === 'image') {
            const displayMode = blockStyle.displayMode || 'inline';
            const objectFit = blockStyle.objectFit || 'cover';
            const aspect = blockStyle.aspectRatio || 'auto';
            const url = blockContent.url || '';
            const caption = blockContent.caption || '';
            const alt = blockContent.alt || '';
            
            let aspectClass = '';
            if (aspect === '16:9') aspectClass = 'aspect-video';
            else if (aspect === '1:1') aspectClass = 'aspect-square';
            else if (aspect === '4:3') aspectClass = 'aspect-[4/3]';
            
            let displayClass = '';
            if (displayMode === 'full-screen') {
              displayClass = 'w-full h-[70vh] md:h-[80vh] object-cover rounded-none max-w-none';
            } else if (displayMode === 'full-width') {
              displayClass = 'w-full max-w-none rounded-none object-cover';
            } else {
              displayClass = 'max-w-4xl mx-auto rounded-2xl shadow-lg border border-gray-150 block object-cover';
            }
            
            html += `
              <div class="mb-8 w-full text-center">
                <img src="${url}" alt="${alt}" class="${displayClass} ${aspectClass}" style="object-fit: ${objectFit};">
                ${caption ? `<div class="mt-2 text-xs text-gray-500 font-medium italic">${caption}</div>` : ''}
              </div>
            `;
          } else if (block.type === 'hero') {
            const bg = blockContent.bgImageUrl || '';
            const heading = blockContent.heading || '';
            const subtext = blockContent.subtext || '';
            const cta = blockContent.ctaText || '';
            const ctaUrl = blockContent.ctaUrl || '';
            const opacity = blockContent.overlayOpacity !== undefined ? blockContent.overlayOpacity : 50;
            
            html += `
              <div class="relative w-full rounded-3xl overflow-hidden min-h-[450px] flex items-center justify-center text-center p-8 md:p-16 mb-8 bg-cover bg-center bg-no-repeat shadow-xl" style="background-image: url('${bg}');">
                <div class="absolute inset-0 bg-slate-950" style="opacity: ${opacity / 100};"></div>
                <div class="relative z-10 max-w-3xl text-white">
                  <h1 class="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">${heading}</h1>
                  <p class="text-sm md:text-lg text-slate-200 mb-8 max-w-2xl mx-auto font-light leading-relaxed">${subtext}</p>
                  ${cta ? `
                    <a href="${ctaUrl}" class="inline-block px-8 py-3.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm rounded-xl transition-all duration-300 shadow-lg hover:scale-105">
                      ${cta}
                    </a>
                  ` : ''}
                </div>
              </div>
            `;
          } else if (block.type === 'button') {
            const label = blockContent.label || '';
            const url = blockContent.url || '#';
            const style = blockContent.style || 'primary';
            const align = blockContent.align || 'left';
            
            let btnClass = '';
            if (style === 'primary') {
              btnClass = `inline-block px-8 py-3.5 text-white font-bold text-sm rounded-xl transition-all duration-300 shadow-md hover:opacity-90`;
            } else {
              btnClass = `inline-block px-8 py-3.5 text-xs font-bold rounded-xl transition-all duration-300 border-2`;
            }
            
            const customStyle = style === 'primary' 
              ? `background-color: ${primaryColor};` 
              : `border-color: ${primaryColor}; color: ${primaryColor}; background-color: transparent;`;
              
            html += `
              <div class="text-${align} mb-6 w-full">
                <a href="${url}" class="${btnClass}" style="${customStyle}">
                  ${label}
                </a>
              </div>
            `;
          } else if (block.type === 'divider') {
            const height = blockContent.height || 40;
            html += `
              <div style="height: ${height}px;" class="w-full flex items-center">
                <hr class="w-full border-t border-gray-200/50">
              </div>
            `;
          } else if (block.type === 'columns') {
            const gridCols = blockStyle.gridCols || 'grid-cols-2';
            const columns = blockContent.columns || [];
            
            html += `
              <div class="grid grid-cols-1 md:${gridCols} gap-8 mb-8 w-full">
            `;
            for (const col of columns) {
              html += `
                <div class="flex flex-col bg-white/40 backdrop-blur-[2px] p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                  ${col.imageUrl ? `<img src="${col.imageUrl}" class="w-full h-44 object-cover rounded-xl mb-4 shadow-sm">` : ''}
                  ${col.title ? `<h4 class="text-lg font-bold text-gray-900 mb-2">${col.title}</h4>` : ''}
                  ${col.text ? `<p class="text-sm text-gray-600 leading-relaxed font-light">${col.text}</p>` : ''}
                </div>
              `;
            }
            html += `
              </div>
            `;
          } else if (block.type === 'quote') {
            const text = blockContent.text || '';
            const author = blockContent.author || '';
            const avatar = blockContent.avatarUrl || '';
            
            html += `
              <div class="max-w-4xl mx-auto my-8 p-6 md:p-8 bg-slate-50/50 rounded-2xl border-l-4 border-slate-700 shadow-sm">
                <p class="text-base md:text-lg italic font-medium leading-relaxed mb-4 text-slate-800">"${text}"</p>
                <div class="flex items-center gap-3">
                  ${avatar ? `<img src="${avatar}" class="w-10 h-10 rounded-full object-cover">` : ''}
                  <div>
                    <span class="text-xs md:text-sm font-bold text-slate-900">${author}</span>
                  </div>
                </div>
              </div>
            `;
          } else if (block.type === 'video') {
            const embedUrl = blockContent.embedUrl || '';
            html += `
              <div class="aspect-video w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-lg mb-8 bg-slate-950">
                <iframe src="${embedUrl}" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
              </div>
            `;
          }
        }
        
        html += `
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
