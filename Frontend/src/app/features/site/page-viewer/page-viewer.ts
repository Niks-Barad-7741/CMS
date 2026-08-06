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

    // If it is the new section-based builder content, render sections dynamically
    if (data && data.sections && Array.isArray(data.sections)) {
      return data.sections.map((section: any) => {
        let isImageBg = section.style.backgroundType === 'image';
        let secStyle = '';
        if (section.style.backgroundType === 'color') {
          secStyle += `background-color: ${section.style.backgroundColor || '#ffffff'}; `;
        } else if (isImageBg && section.style.backgroundImageUrl) {
          let sizeStyle = `background-image: url('${resolveImageUrl(section.style.backgroundImageUrl)}'); background-position: center; `;
          if (section.style.backgroundSize === 'contain') {
            sizeStyle += 'background-size: contain; background-repeat: no-repeat; ';
          } else if (section.style.backgroundSize === 'repeat') {
            sizeStyle += 'background-size: auto; background-repeat: repeat; ';
          } else {
            sizeStyle += 'background-size: cover; background-repeat: no-repeat; ';
          }
          secStyle += `${sizeStyle} min-height: 480px; display: flex; align-items: center; `;
        }
        
        let defaultTextColor = isImageBg ? '#ffffff' : '#1f2937';
        let textColor = section.style.textColor || defaultTextColor;
        secStyle += `color: ${textColor}; `;
        
        const paddingClass = section.style.paddingY || 'py-16';
        let overlayOpacity = section.style.overlayOpacity !== undefined ? section.style.overlayOpacity / 100 : 0;

        let blocksHtml = (section.blocks || []).map((block: any) => {
          switch (block.type) {
            case 'heading': {
              const level = block.content.level || 2;
              const Tag = `h${level}`;
              const align = block.content.align || 'left';
              const size = block.style.fontSize || 'text-3xl';
              let textShadow = isImageBg ? 'text-shadow: 0 2px 4px rgba(0,0,0,0.8);' : '';
              let style = `color: ${block.style.textColor || textColor}; ${textShadow}`;
              return `<div class="py-4 text-${align}"><${Tag} class="${size} font-black tracking-tight leading-tight" style="${style}">${block.content.text || ''}</${Tag}></div>`;
            }
            case 'paragraph': {
              const align = block.content.align || 'left';
              const size = block.style.fontSize || 'text-base';
              let textShadow = isImageBg ? 'text-shadow: 0 1px 3px rgba(0,0,0,0.8);' : '';
              let style = `color: ${block.style.textColor || textColor}; ${textShadow}`;
              return `<div class="py-2 text-${align}"><p class="${size} leading-relaxed opacity-95" style="${style}">${block.content.text || ''}</p></div>`;
            }
            case 'hero': {
              const bUrl = resolveImageUrl(block.content.bgImageUrl);
              const bg = bUrl
                ? `style="background-image: url('${bUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"`
                : 'style="background: linear-gradient(135deg, #002855 0%, #0A192F 100%);"';
              const opacity = block.content.overlayOpacity !== undefined ? block.content.overlayOpacity / 100 : 0.55;
              return `
                <div class="relative w-full min-h-[50vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-lg my-6" ${bg}>
                  <div class="absolute inset-0 bg-black" style="opacity: ${opacity};"></div>
                  <div class="relative z-10 text-center px-6 max-w-4xl mx-auto py-16">
                    <h1 class="text-3xl md:text-5xl font-extrabold text-white uppercase tracking-wider mb-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${block.content.heading || ''}</h1>
                    <p class="text-base md:text-lg text-gray-200 max-w-3xl mx-auto mb-8 font-light" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${block.content.subtext || ''}</p>
                    ${block.content.ctaText ? `<a href="${block.content.ctaUrl || '#'}" class="inline-block px-8 py-3 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-semibold text-sm uppercase tracking-widest border-2 border-white rounded transition-all duration-300">${block.content.ctaText}</a>` : ''}
                  </div>
                </div>
              `;
            }
            case 'image': {
              const url = resolveImageUrl(block.content.url);
              const displayMode = block.style.displayMode || 'inline';
              const objectFit = block.style.objectFit || 'cover';
              const aspectRatio = block.style.aspectRatio || 'auto';
              const isFullWidth = displayMode === 'full-width' || displayMode === 'full-screen';
              const imgClass = isFullWidth ? 'w-full' : 'max-w-full rounded-lg shadow-md';
              
              let wrapperStyle = '';
              if (aspectRatio !== 'auto') {
                wrapperStyle += `aspect-ratio: ${aspectRatio.replace(':', '/')}; `;
              }

              return `<div class="py-4 flex justify-center">
                        <div class="w-full overflow-hidden" style="${wrapperStyle}">
                          <img src="${url}" alt="${block.content.alt || ''}" style="object-fit: ${objectFit}; width: 100%; height: 100%;" class="${imgClass}" />
                        </div>
                      </div>`;
            }
            case 'button': {
              const align = block.content.align || 'left';
              const style = block.content.style === 'outline' 
                ? 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg';
              let flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
              return `<div class="py-6 flex ${flexAlign}">
                        <a href="${block.content.url || '#'}" class="inline-block px-6 py-3 rounded-xl font-bold transition-all ${style}">${block.content.label || 'Click Here'}</a>
                      </div>`;
            }
            case 'divider': {
              const height = block.content.height || 40;
              return `<div style="height: ${height}px;" class="w-full"></div>`;
            }
            case 'gallery': {
              const cols = block.style.gridCols || 'grid-cols-2';
              const imagesHtml = (block.content.images || []).map((img: any) => {
                const url = resolveImageUrl(img.url);
                return `<div class="overflow-hidden rounded-lg shadow-sm bg-gray-50">
                          <img src="${url}" alt="Gallery Image" class="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500" />
                          ${img.caption ? `<p class="p-2 text-center text-xs text-gray-500">${img.caption}</p>` : ''}
                        </div>`;
              }).join('');
              return `<div class="py-6 grid ${cols} gap-4">${imagesHtml}</div>`;
            }
            case 'columns': {
              const cols = block.style.gridCols || 'grid-cols-2';
              const colsHtml = (block.content.columns || []).map((col: any) => {
                const imgUrl = resolveImageUrl(col.imageUrl);
                return `<div class="p-6 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/10 dark:border-white/10 flex flex-col items-center text-center">
                          ${imgUrl ? `<img src="${imgUrl}" alt="Column Image" class="w-16 h-16 rounded-full object-cover mb-4" />` : ''}
                          <h3 class="text-lg font-bold mb-2">${col.title || ''}</h3>
                          <p class="text-sm opacity-80 leading-relaxed">${col.text || ''}</p>
                        </div>`;
              }).join('');
              return `<div class="py-6 grid grid-cols-1 md:${cols} gap-6">${colsHtml}</div>`;
            }
            case 'quote': {
               const avatar = resolveImageUrl(block.content.avatarUrl);
               return `
                 <div class="max-w-4xl mx-auto py-12 text-center">
                   <svg class="w-10 h-10 mx-auto text-indigo-200 mb-4" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path></svg>
                   <p class="text-xl font-medium italic mb-6">"${block.content.text || ''}"</p>
                   <footer class="flex items-center justify-center gap-3">
                     ${avatar ? `<img src="${avatar}" class="w-8 h-8 rounded-full object-cover" alt="Author avatar">` : ''}
                     <span class="font-bold">${block.content.author || ''}</span>
                   </footer>
                 </div>
               `;
            }
            case 'video': {
               const url = block.content.embedUrl;
               return `<div class="max-w-5xl mx-auto py-8">
                         <div class="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                           ${url ? `<iframe src="${url}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : '<div class="w-full h-full flex items-center justify-center text-gray-400">No Video URL</div>'}
                         </div>
                       </div>`;
            }
            default:
              return '';
          }
        }).join('');

        return `
          <section class="relative ${paddingClass} overflow-hidden" style="${secStyle}">
            ${isImageBg && overlayOpacity > 0 ? `
              <div class="absolute inset-0 bg-black" style="opacity: ${overlayOpacity}; pointer-events: none; z-index: 1;"></div>
            ` : ''}
            <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              ${blocksHtml}
            </div>
          </section>
        `;
      }).join('');
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
