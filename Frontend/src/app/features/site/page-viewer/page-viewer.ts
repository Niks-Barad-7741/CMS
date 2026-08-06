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
        let isVideoBg = section.style.backgroundType === 'video';
        let isGradientBg = section.style.backgroundType === 'gradient';
        
        let secStyle = '';
        if (section.style.backgroundType === 'color') {
          secStyle += `background-color: ${section.style.backgroundColor || '#ffffff'}; `;
        } else if (isGradientBg) {
          const c1 = section.style.gradientColor1 || '#4f46e5';
          const c2 = section.style.gradientColor2 || '#9333ea';
          const angle = section.style.gradientAngle || 135;
          secStyle += `background: linear-gradient(${angle}deg, ${c1}, ${c2}); `;
        } else if (isImageBg && section.style.backgroundImageUrl) {
          let sizeStyle = `background-image: url('${resolveImageUrl(section.style.backgroundImageUrl)}'); background-position: center; `;
          if (section.style.backgroundSize === 'contain') {
            sizeStyle += 'background-size: contain; background-repeat: no-repeat; ';
          } else if (section.style.backgroundSize === 'center') {
            sizeStyle += 'background-size: auto; background-repeat: no-repeat; ';
          } else {
            sizeStyle += 'background-size: cover; background-repeat: no-repeat; ';
          }
          if (section.style.backgroundAttachment === 'fixed') {
            sizeStyle += 'background-attachment: fixed; ';
          }
          secStyle += sizeStyle;
        }
        
        let defaultTextColor = (isImageBg || isVideoBg || isGradientBg) ? '#ffffff' : '#1f2937';
        let textColor = section.style.textColor || defaultTextColor;
        secStyle += `color: ${textColor}; `;
        
        let minHeightStyle = '';
        if (section.style.minHeightType === '50vh') {
          minHeightStyle = 'min-height: 50vh; display: flex; align-items: center; ';
        } else if (section.style.minHeightType === '100vh') {
          minHeightStyle = 'min-height: 100vh; display: flex; align-items: center; ';
        } else if (section.style.minHeightType === 'custom') {
          minHeightStyle = `min-height: ${section.style.minHeightValue || 500}px; display: flex; align-items: center; `;
        } else if (isImageBg || isVideoBg) {
          minHeightStyle = 'min-height: 480px; display: flex; align-items: center; ';
        }
        secStyle += minHeightStyle;

        let videoHtml = '';
        if (isVideoBg && section.style.videoUrl) {
          const autoplay = section.style.videoAutoplay !== false ? 'autoplay' : '';
          const muted = section.style.videoMuted !== false ? 'muted' : '';
          videoHtml = `
            <video ${autoplay} ${muted} loop playsinline class="absolute inset-0 w-full h-full object-cover pointer-events-none" style="z-index: 0;">
              <source src="${resolveImageUrl(section.style.videoUrl)}" type="video/mp4">
            </video>
          `;
        }
        
        const ptClass = section.style.paddingTop || 'pt-16';
        const pbClass = section.style.paddingBottom || 'pb-16';
        let overlayColor = section.style.overlayColor || '#000000';
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
              
              // Max Width preset mapping
              let maxWidthClass = 'max-w-none';
              if (block.style.maxWidth === 'Medium') maxWidthClass = 'max-w-[65ch] mx-auto';
              else if (block.style.maxWidth === 'Narrow') maxWidthClass = 'max-w-[45ch] mx-auto';
              
              // Line Height preset mapping
              let lhClass = 'leading-normal';
              if (block.style.lineHeight === 'Tight') lhClass = 'leading-snug';
              else if (block.style.lineHeight === 'Relaxed') lhClass = 'leading-relaxed';
              
              // Column Layout mapping
              let colClass = '';
              if (block.style.columnLayout === '2 Columns') colClass = 'md:columns-2 gap-8';
              
              // Highlight background styling
              let highlightStyle = '';
              if (block.style.highlightBg) {
                highlightStyle = `background-color: ${block.style.highlightBg}; padding: 1.5rem; border-radius: 1rem; `;
              }
              
              let textShadow = isImageBg ? 'text-shadow: 0 1px 3px rgba(0,0,0,0.8);' : '';
              let style = `color: ${block.style.textColor || textColor}; ${textShadow} ${highlightStyle}`;
              const animClass = block.content.animation === 'Fade In' ? 'transition-all duration-700' : '';

              return `<div class="py-2 text-${align} ${maxWidthClass} ${animClass}">
                        <div class="${size} ${lhClass} ${colClass}" style="${style}">${block.content.text || ''}</div>
                      </div>`;
            }
            case 'hero': {
              const bgType = block.content.bgType || 'image';
              const bUrl = resolveImageUrl(block.content.bgImageUrl);
              const mobBUrl = resolveImageUrl(block.content.mobileBgImageUrl);
              
              // Build background styles
              let styleRules = '';
              if (bgType === 'image' && bUrl) {
                const focal = block.content.bgFocalPoint || 'center';
                styleRules += `background-image: url('${bUrl}'); background-size: cover; background-position: ${focal}; background-repeat: no-repeat; `;
              } else if (bgType === 'color') {
                styleRules += `background-color: ${block.content.bgColor || '#1e1b4b'}; `;
              } else if (bgType === 'gradient') {
                const c1 = block.content.gradientColor1 || '#1e1b4b';
                const c2 = block.content.gradientColor2 || '#312e81';
                const angle = block.content.gradientAngle || 135;
                styleRules += `background: linear-gradient(${angle}deg, ${c1}, ${c2}); `;
              } else if (bgType === 'video' && block.content.videoUrl) {
                styleRules += 'background-color: #000000; ';
              } else {
                styleRules += `background: linear-gradient(135deg, #002855 0%, #0A192F 100%); `;
              }
              
              // Overlay settings
              const opacity = block.content.overlayOpacity !== undefined ? block.content.overlayOpacity / 100 : 0.55;
              const overlayColor = block.content.overlayColor || '#000000';
              
              // Min Height setting
              let minHeightVal = '50vh';
              if (block.style.minHeightType === 'auto') minHeightVal = 'auto';
              else if (block.style.minHeightType === '100vh') minHeightVal = '100vh';
              else if (block.style.minHeightType === 'custom') minHeightVal = `${block.style.minHeightValue || 500}px`;
              styleRules += `min-height: ${minHeightVal}; `;
              
              // Text color override
              const textColorOverride = block.style.textColor || '';
              if (textColorOverride) {
                styleRules += `color: ${textColorOverride}; `;
              }
              
              const bgStyleStr = `style="${styleRules}"`;
              const hTag = block.content.headingTag || 'h1';
              
              // Content Max Width
              let maxWClass = 'max-w-[900px] mx-auto';
              if (block.style.contentMaxWidth === 'Full') maxWClass = 'max-w-none';
              else if (block.style.contentMaxWidth === 'Medium') maxWClass = 'max-w-[700px] mx-auto';

              // Heading size
              let headingSizeClass = 'text-3xl md:text-5xl';
              if (block.style.headingFontSize === 'Small') headingSizeClass = 'text-2xl md:text-3xl';
              else if (block.style.headingFontSize === 'Medium') headingSizeClass = 'text-3xl md:text-4xl';
              else if (block.style.headingFontSize === 'Large') headingSizeClass = 'text-4xl md:text-5xl';
              else if (block.style.headingFontSize === 'X-Large') headingSizeClass = 'text-5xl md:text-7xl';
              
              // Button size & class helper
              const btnSize = block.content.ctaSize || 'Medium';
              const getBtnClass = (btnStyle: string) => {
                let sizeClass = 'px-6 py-3 text-sm rounded-lg';
                if (btnSize === 'Small') sizeClass = 'px-4 py-2 text-xs rounded-md';
                else if (btnSize === 'Large') sizeClass = 'px-8 py-4 text-base rounded-xl';
                
                if (btnStyle === 'primary') return `bg-white hover:bg-gray-100 text-gray-900 font-bold ${sizeClass} shadow-md transition-all inline-block`;
                if (btnStyle === 'secondary') return `bg-indigo-600 hover:bg-indigo-700 text-white font-bold ${sizeClass} shadow-md transition-all inline-block`;
                return `border-2 border-white hover:bg-white hover:text-gray-900 text-white font-bold ${sizeClass} transition-all inline-block`;
              };

              const cStyle = block.content.ctaStyle || 'primary';
              const ctaNewTabAttr = block.content.ctaNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
              const secCtaNewTabAttr = block.content.secCtaNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
              
              const align = block.content.align || 'center';
              const alignClass = `text-${align}`;
              const valign = block.content.valign || 'middle';
              const valignClass = valign === 'top' ? 'items-start' : (valign === 'bottom' ? 'items-end' : 'items-center');
              const flexAlignClass = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
              
              // Animation & stagger
              const anim = block.content.animation || 'None';
              let animClass = '';
              if (anim === 'Fade In') animClass = 'animate-fade-in';
              else if (anim === 'Slide Up') animClass = 'animate-slide-up';
              else if (anim === 'Zoom In') animClass = 'animate-zoom-in';
              
              const delayStyle = block.content.animationDelay ? `style="animation-delay: ${block.content.animationDelay}ms;"` : '';

              // Video HTML
              let videoHtml = '';
              if (bgType === 'video' && block.content.videoUrl) {
                const autoplay = block.content.videoAutoplay !== false ? 'autoplay' : '';
                const muted = block.content.videoMuted !== false ? 'muted' : '';
                videoHtml = `
                  <video ${autoplay} ${muted} loop playsinline class="absolute inset-0 w-full h-full object-cover pointer-events-none z-0">
                    <source src="${resolveImageUrl(block.content.videoUrl)}" type="video/mp4">
                  </video>
                `;
              }

              // Divider HTML
              let dividerHtml = '';
              if (block.style.dividerShape === 'Wave') {
                dividerHtml = `
                  <div class="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block">
                      <path d="M0 32L120 42.7C240 53 480 75 720 74.7C960 75 1200 53 1320 42.7L1440 32V120H1320C1200 120 960 120 720 120C480 120 240 120 120 120H0V32Z" fill="currentColor" class="text-white dark:text-gray-900"></path>
                    </svg>
                  </div>
                `;
              } else if (block.style.dividerShape === 'Angled') {
                dividerHtml = `
                  <div class="absolute bottom-0 inset-x-0 z-20 pointer-events-none">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block">
                      <path d="M0 120L1440 30V120H0Z" fill="currentColor" class="text-white dark:text-gray-900"></path>
                    </svg>
                  </div>
                `;
              }

              // Responsive media support
              let mobileStyleHtml = '';
              if (bgType === 'image' && mobBUrl) {
                const focal = block.content.bgFocalPoint || 'center';
                mobileStyleHtml = `
                  <style>
                    @media (max-width: 640px) {
                      .hero-block-${block.id || 'dynamic'} {
                        background-image: url('${mobBUrl}') !important;
                        background-position: ${focal} !important;
                      }
                    }
                  </style>
                `;
              }

              return `
                ${mobileStyleHtml}
                <div class="hero-block-${block.id || 'dynamic'} relative w-full flex ${valignClass} justify-center rounded-2xl overflow-hidden shadow-lg my-6 ${animClass}" ${bgStyleStr} ${delayStyle}>
                  ${videoHtml}
                  ${(bgType === 'image' || bgType === 'video') ? `<div class="absolute inset-0 z-0 pointer-events-none" style="background-color: ${overlayColor}; opacity: ${opacity};"></div>` : ''}
                  <div class="relative z-10 ${alignClass} px-6 ${maxWClass} py-16 w-full">
                    ${block.content.eyebrow ? `<span class="block text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">${block.content.eyebrow}</span>` : ''}
                    <${hTag} class="${headingSizeClass} font-black uppercase tracking-wider mb-4" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${block.content.heading || ''}</${hTag}>
                    <p class="text-base md:text-lg text-gray-255 max-w-3xl mx-auto mb-8 font-light" style="text-shadow: 0 1px 3px rgba(0,0,0,0.8); opacity: 0.9;">${block.content.subtext || ''}</p>
                    
                    <div class="flex flex-wrap ${flexAlignClass} gap-4">
                      ${block.content.ctaText ? `
                        <a href="${block.content.ctaUrl || '#'}" class="${getBtnClass(cStyle)}" ${ctaNewTabAttr}>
                          ${block.content.ctaText}
                        </a>
                      ` : ''}
                      ${block.content.secCtaText ? `
                        <a href="${block.content.secCtaUrl || '#'}" class="${getBtnClass(block.content.secCtaStyle || 'outline')}" ${secCtaNewTabAttr}>
                          ${block.content.secCtaText}
                        </a>
                      ` : ''}
                    </div>
                  </div>
                  ${dividerHtml}
                </div>
              `;
            }
            case 'image': {
              const url = resolveImageUrl(block.content.url);
              const objectFit = block.style.objectFit || 'cover';
              const aspectRatio = block.style.aspectRatio || 'auto';

              // --- Max Width ---
              let widthClass = 'w-full';
              if (block.style.maxWidth === 'Large') widthClass = 'max-w-4xl';
              else if (block.style.maxWidth === 'Medium') widthClass = 'max-w-2xl';
              else if (block.style.maxWidth === 'Small') widthClass = 'max-w-sm';

              // --- Responsive ---
              if (block.style.responsiveBehavior === 'fixed') {
                widthClass = widthClass.trim();
              }

              // --- Border Radius ---
              let radiusClass = 'rounded-xl';
              if (block.style.borderRadius === 'None') radiusClass = 'rounded-none';
              else if (block.style.borderRadius === 'Small') radiusClass = 'rounded-md';
              else if (block.style.borderRadius === 'Medium') radiusClass = 'rounded-2xl';
              else if (block.style.borderRadius === 'Full-Round') radiusClass = 'rounded-full';

              // --- Shadow ---
              let shadowClass = '';
              const shadowVal = block.style.boxShadow;
              if (shadowVal === true || shadowVal === 'Large') shadowClass = 'shadow-2xl';
              else if (shadowVal === 'Medium') shadowClass = 'shadow-lg';
              else if (shadowVal === 'Small') shadowClass = 'shadow-md';
              else if (shadowVal === false || shadowVal === 'None') shadowClass = '';

              // --- Border ---
              let borderStyle = '';
              if (block.style.border === 'Thin') borderStyle = 'border: 1px solid rgba(0,0,0,0.12); ';
              else if (block.style.border === 'Medium') borderStyle = 'border: 2px solid rgba(0,0,0,0.18); ';
              else if (block.style.border === 'Thick') borderStyle = 'border: 4px solid rgba(0,0,0,0.2); ';

              // --- Filter ---
              let filterClass = '';
              if (block.style.filterEffect === 'Grayscale') filterClass = 'grayscale';
              else if (block.style.filterEffect === 'Duotone') filterClass = 'sepia saturate-[200%] hue-rotate-[200deg]';

              // --- Hover Effect ---
              let hoverClass = '';
              if (block.style.hoverEffect === 'Subtle Zoom') hoverClass = 'hover:scale-[1.04] transition-transform duration-500 ease-out';
              else if (block.style.hoverEffect === 'Brightness') hoverClass = 'hover:brightness-110 transition-all duration-300';
              else if (block.style.hoverEffect === 'Lift') hoverClass = 'hover:-translate-y-1 hover:shadow-2xl transition-all duration-300';

              // --- Animation ---
              let animClass = '';
              if (block.content.animation === 'Fade In') animClass = 'transition-opacity duration-700 animate-fade-in';
              else if (block.content.animation === 'Zoom In') animClass = 'hover:scale-[1.03] transition-transform duration-500';

              // --- Wrapper style ---
              let wrapperStyle = '';
              if (aspectRatio !== 'auto') {
                wrapperStyle += `aspect-ratio: ${aspectRatio.replace(':', '/')}; `;
              }
              if (block.style.backgroundColor) {
                wrapperStyle += `background-color: ${block.style.backgroundColor}; `;
              }
              wrapperStyle += borderStyle;

              // --- Alignment ---
              const alignment = block.style.alignment || 'center';
              const flexAlign = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';

              // --- Padding ---
              let paddingStyle = '';
              if (block.style.padding === 'Small') paddingStyle = 'padding: 0.5rem; ';
              else if (block.style.padding === 'Medium') paddingStyle = 'padding: 1rem; ';
              else if (block.style.padding === 'Large') paddingStyle = 'padding: 2rem; ';

              // --- Margin ---
              let marginStyle = '';
              if (block.style.margin === 'Small') marginStyle = 'margin-top: 0.5rem; margin-bottom: 0.5rem; ';
              else if (block.style.margin === 'Medium') marginStyle = 'margin-top: 1.5rem; margin-bottom: 1.5rem; ';
              else if (block.style.margin === 'Large') marginStyle = 'margin-top: 3rem; margin-bottom: 3rem; ';

              // --- Additional Classes & Custom CSS ---
              const extraClasses = (block.style.additionalClasses || '').trim();
              const blockId = block.id || ('img-' + Math.random().toString(36).slice(2, 8));
              const customCss = (block.content.customCss || '').trim();
              const customCssBlock = customCss ? `<style>#${blockId} img { ${customCss} }</style>` : '';

              // --- Lightbox ---
              const onclickLightbox = block.content.lightbox
                ? `onclick="const m=document.createElement('div');m.className='fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] cursor-zoom-out';m.onclick=()=>m.remove();const i=document.createElement('img');i.src='${url}';i.className='max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl';m.appendChild(i);document.body.appendChild(m);"`
                : '';
              const cursorClass = block.content.lightbox ? 'cursor-zoom-in' : '';

              // --- Build img tag ---
              let imgTag = `<img
                src="${url}"
                alt="${block.content.alt || ''}"
                title="${block.content.title || ''}"
                loading="lazy"
                style="object-fit: ${objectFit}; width: 100%; height: 100%; display: block;"
                class="${radiusClass} ${shadowClass} ${filterClass} ${hoverClass} ${animClass} ${cursorClass} ${extraClasses} overflow-hidden"
                ${onclickLightbox}
              />`;

              if (block.content.linkUrl) {
                const target = block.content.linkNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';
                imgTag = `<a href="${block.content.linkUrl}" ${target} class="block w-full h-full">${imgTag}</a>`;
              }

              const captionHtml = block.content.caption
                ? `<p class="mt-2 text-center text-xs text-gray-500 italic">${block.content.caption}</p>`
                : '';

              return `${customCssBlock}
                      <div class="py-4 flex ${flexAlign} w-full" style="${marginStyle}">
                        <div id="${blockId}" class="${widthClass} overflow-hidden" style="${wrapperStyle}${paddingStyle}">
                          ${imgTag}
                          ${captionHtml}
                        </div>
                      </div>`;
            }
            case 'button': {
              const align = block.content.align || 'left';
              const flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
              const anim = block.content.animation || 'None';
              const animClass = anim === 'Fade In' ? 'transition-all duration-700 animate-fade-in' : '';

              const renderSingleBtn = (prefix: string, label: string, btnStyle: string, type: string, urlVal: string, anchor: string, popupText: string, size: string, iconName: string, iconPos: string, isNewTab: boolean, customBg: string, customText: string, radius: string, hover: string, fullWidth: boolean) => {
                if (!label) return '';
                
                let hrefAttr = '#';
                let onclickAttr = '';
                let targetAttr = '';

                if (type === 'Scroll to Section') {
                  hrefAttr = `#${anchor || ''}`;
                } else if (type === 'Trigger Popup') {
                  hrefAttr = 'javascript:void(0)';
                  onclickAttr = `onclick="const p=document.createElement('div');p.className='fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]';p.onclick=(e)=>{if(e.target===p)p.remove()};const c=document.createElement('div');c.className='bg-white p-8 rounded-2xl max-w-md w-full relative mx-4 text-gray-900 shadow-2xl';c.innerHTML='<button class=&quot;absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg font-bold&quot; onclick=&quot;this.closest(\\\'div\\\').parentElement.remove()&quot;>&times;</button><p class=&quot;text-base leading-relaxed&quot;>${(popupText || '').replace(/'/g, "\\'")}</p>';p.appendChild(c);document.body.appendChild(p);"`;
                } else {
                  hrefAttr = urlVal || '#';
                  if (isNewTab) targetAttr = 'target="_blank" rel="noopener noreferrer"';
                }

                let sizeClass = 'px-6 py-3 text-sm';
                if (size === 'Small') sizeClass = 'px-4 py-2 text-xs';
                else if (size === 'Large') sizeClass = 'px-8 py-4 text-base';

                let styleClass = 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md';
                if (btnStyle === 'secondary') styleClass = 'bg-slate-800 text-white hover:bg-slate-900 shadow-md';
                else if (btnStyle === 'outline') styleClass = 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50';

                let customStyle = '';
                if (customBg) customStyle += `background-color: ${customBg}; `;
                if (customText) customStyle += `color: ${customText}; `;
                if (customBg && btnStyle === 'outline') customStyle += `border-color: ${customBg}; `;
                const styleAttr = customStyle ? `style="${customStyle}"` : '';

                let radiusClass = 'rounded-xl';
                if (radius === 'None') radiusClass = 'rounded-none';
                else if (radius === 'Pill') radiusClass = 'rounded-full';

                let hoverClass = 'transition-all duration-300';
                if (hover === 'Darken') hoverClass += ' hover:brightness-90';
                else if (hover === 'Lift') hoverClass += ' hover:-translate-y-1 hover:shadow-lg';
                else if (hover === 'Scale') hoverClass += ' hover:scale-105';

                const widthClass = fullWidth ? 'w-full sm:w-auto text-center' : 'inline-block';

                let iconSvg = '';
                if (iconName === 'Arrow') {
                  iconSvg = '<svg class="w-4 h-4 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
                } else if (iconName === 'Play') {
                  iconSvg = '<svg class="w-4 h-4 inline-block align-middle" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg>';
                } else if (iconName === 'Envelope') {
                  iconSvg = '<svg class="w-4 h-4 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                } else if (iconName === 'Download') {
                  iconSvg = '<svg class="w-4 h-4 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>';
                } else if (iconName === 'Info') {
                  iconSvg = '<svg class="w-4 h-4 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                }

                let leftIcon = (iconPos === 'Left' && iconSvg) ? `${iconSvg} ` : '';
                let rightIcon = (iconPos === 'Right' && iconSvg) ? ` ${iconSvg}` : '';

                return `<a href="${hrefAttr}" class="${widthClass} ${sizeClass} ${styleClass} ${radiusClass} ${hoverClass} font-bold align-middle items-center justify-center inline-flex gap-2" ${onclickAttr} ${targetAttr} ${styleAttr}>
                          ${leftIcon}${label}${rightIcon}
                        </a>`;
              };

              const btn1Html = renderSingleBtn(
                '',
                block.content.label,
                block.content.style,
                block.content.buttonType,
                block.content.url,
                block.content.scrollToSection,
                block.content.triggerPopup,
                block.content.size,
                block.content.icon,
                block.content.iconPosition,
                block.content.newTab,
                block.content.customBg,
                block.content.customText,
                block.style.borderRadius,
                block.style.hoverEffect,
                block.content.fullWidthMobile
              );

              let btn2Html = '';
              if (block.content.hasSecondButton) {
                btn2Html = renderSingleBtn(
                  'sec',
                  block.content.secLabel,
                  block.content.secStyle,
                  block.content.secButtonType,
                  block.content.secUrl,
                  block.content.secScrollToSection,
                  block.content.secTriggerPopup,
                  block.content.secSize,
                  block.content.secIcon,
                  block.content.secIconPosition,
                  block.content.secNewTab,
                  block.content.secCustomBg,
                  block.content.secCustomText,
                  block.style.secBorderRadius,
                  block.style.secHoverEffect,
                  block.content.fullWidthMobile
                );
              }

              return `<div class="py-6 flex flex-wrap gap-4 ${flexAlign} ${animClass}">
                        ${btn1Html}
                        ${btn2Html}
                      </div>`;
            }
            case 'divider': {
              const height = block.content.height || 40;
              const mobHeight = block.content.mobileHeight !== undefined ? block.content.mobileHeight : 20;
              const divStyle = block.content.dividerStyle || 'Blank Space';
              const lineStyle = block.content.lineStyle || 'Solid';
              const lineColor = block.content.lineColor || '#e2e8f0';
              const lineThickness = block.content.lineThickness || 2;
              const lineWidth = block.content.lineWidth || 'Full';
              const iconName = block.content.dividerIcon || 'None';
              const align = block.content.align || 'center';

              let justifyVal = align === 'left' ? 'flex-start' : (align === 'right' ? 'flex-end' : 'center');
              let flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');

              let widthVal = '100%';
              if (lineWidth === '50%') widthVal = '50%';
              else if (lineWidth === '25%') widthVal = '25%';

              let iconSvg = '';
              if (iconName === 'Arrow') {
                iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
              } else if (iconName === 'Play') {
                iconSvg = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z"></path></svg>';
              } else if (iconName === 'Envelope') {
                iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
              } else if (iconName === 'Download') {
                iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>';
              } else if (iconName === 'Info') {
                iconSvg = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
              }

              let contentHtml = '';
              const borderStyleRule = `border-top: ${lineThickness}px ${lineStyle.toLowerCase()} ${lineColor};`;

              if (divStyle === 'Dots') {
                contentHtml = `<div class="flex gap-2 justify-center items-center">
                                 <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${lineColor}"></span>
                                 <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${lineColor}"></span>
                                 <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${lineColor}"></span>
                               </div>`;
              } else if (divStyle === 'Line') {
                contentHtml = `<div style="${borderStyleRule} width: ${widthVal};"></div>`;
              } else if (divStyle === 'Line with Icon') {
                contentHtml = `
                  <div class="relative w-full flex items-center" style="justify-content: ${justifyVal};">
                    <div class="absolute inset-0 flex items-center" style="justify-content: ${justifyVal}; z-index: 1;">
                      <div style="${borderStyleRule} width: ${widthVal};"></div>
                    </div>
                    <div class="relative z-10 px-4 py-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center border border-gray-100 shadow-sm" style="color: ${lineColor}; margin-left: ${align === 'left' ? '1.5rem' : 'auto'}; margin-right: ${align === 'right' ? '1.5rem' : 'auto'};">
                      ${iconSvg || '<span>◆</span>'}
                    </div>
                  </div>
                `;
              }

              const randId = 'div-' + Math.random().toString(36).substring(2, 9);

              return `<div class="w-full flex ${flexAlign} items-center">
                        <style>
                          @media (max-width: 768px) {
                            #${randId} {
                              height: ${mobHeight}px !important;
                            }
                          }
                        </style>
                        <div id="${randId}" class="w-full flex items-center ${flexAlign}" style="height: ${height}px;">
                          ${contentHtml}
                        </div>
                      </div>`;
            }
            case 'gallery': {
              let gapClass = 'gap-4';
              if (block.style.imageGap === 'None') gapClass = 'gap-0';
              else if (block.style.imageGap === 'Small') gapClass = 'gap-2';
              else if (block.style.imageGap === 'Large') gapClass = 'gap-8';
              
              const onclickLightbox = block.content.lightbox ? `onclick="const m=document.createElement('div');m.className='fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] cursor-zoom-out';m.onclick=()=>m.remove();const i=document.createElement('img');i.src=this.querySelector('img').src;i.className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg';m.appendChild(i);document.body.appendChild(m);"` : '';
              const cursorClass = block.content.lightbox ? 'cursor-zoom-in' : '';
              
              const imagesHtml = (block.content.images || []).map((img: any) => {
                const url = resolveImageUrl(img.url);
                const alt = img.alt || '';
                const lazy = block.content.lazyLoad !== false ? 'loading="lazy"' : '';
                return `
                  <div class="overflow-hidden rounded-lg shadow-sm bg-gray-50 relative group ${cursorClass}" ${onclickLightbox}>
                    <img src="${url}" alt="${alt}" ${lazy} class="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500" />
                    ${img.caption ? `<p class="p-2 text-center text-xs text-gray-500 bg-white border-t">${img.caption}</p>` : ''}
                  </div>
                `;
              }).join('');
              
              if (block.style.galleryStyle === 'Masonry') {
                let masonryCols = 'columns-1 sm:columns-2 lg:columns-3';
                if (block.style.colsDesktop === 'grid-cols-2') masonryCols = 'columns-1 sm:columns-2 lg:columns-2';
                else if (block.style.colsDesktop === 'grid-cols-4') masonryCols = 'columns-1 sm:columns-2 md:columns-3 lg:columns-4';
                return `<div class="py-6 ${masonryCols} ${gapClass} space-y-4">${imagesHtml}</div>`;
              } else if (block.style.galleryStyle === 'Carousel-Slider') {
                return `<div class="py-6 flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-thin">${imagesHtml}</div>`;
              } else {
                const colsDesktop = block.style.colsDesktop || 'grid-cols-3';
                const colsTablet = block.style.colsTablet || 'md:grid-cols-2';
                const colsMobile = block.style.colsMobile || 'grid-cols-1';
                return `<div class="py-6 grid ${colsMobile} ${colsTablet} ${colsDesktop} ${gapClass}">${imagesHtml}</div>`;
              }
            }
            case 'columns': {
              const colsDesktop = block.style.gridCols || 'grid-cols-2';
              const colsTablet = block.style.colsTablet || 'md:grid-cols-2';
              const colsMobile = block.style.colsMobile || 'grid-cols-1';
              const widthRatio = block.style.widthRatio || 'Equal';
              const gapSize = block.style.gapSize || 'Medium';
              const valign = block.style.valign || 'Top';
              
              const anim = block.content.animation || 'None';
              const staggerDelay = block.content.staggerDelay || 0;

              let gapClass = 'gap-6';
              if (gapSize === 'Small') gapClass = 'gap-3';
              else if (gapSize === 'Large') gapClass = 'gap-10';

              let valignClass = valign === 'Middle' ? 'items-center' : 'items-start';

              let gridStyle = '';
              if (colsDesktop === 'grid-cols-2' && widthRatio !== 'Equal') {
                if (widthRatio === '60/40') gridStyle = 'grid-template-columns: 6fr 4fr;';
                else if (widthRatio === '70/30') gridStyle = 'grid-template-columns: 7fr 3fr;';
                else if (widthRatio === '30/70') gridStyle = 'grid-template-columns: 3fr 7fr;';
                else if (widthRatio === '40/60') gridStyle = 'grid-template-columns: 4fr 6fr;';
              }

              const randId = 'grid-' + Math.random().toString(36).substring(2, 9);

              const colsHtml = (block.content.columns || []).map((col: any, colIdx: number) => {
                const imgUrl = resolveImageUrl(col.imageUrl);
                const align = col.align || 'center';
                const alignClass = align === 'left' ? 'text-left items-start' : (align === 'right' ? 'text-end items-end' : 'text-center items-center');
                
                let cardClass = 'p-6 rounded-2xl transition-all duration-300';
                if (col.cardLook) {
                  cardClass += ' border border-black/10 dark:border-white/10 shadow-lg hover:shadow-xl';
                } else {
                  cardClass += ' border border-transparent';
                }

                let colStyle = '';
                if (col.bg) colStyle += `background-color: ${col.bg}; `;
                
                let animClass = '';
                if (anim === 'Fade In') {
                  animClass = 'animate-fade-in opacity-0';
                  colStyle += `animation-delay: ${colIdx * staggerDelay}ms; animation-fill-mode: forwards; `;
                }

                const styleAttr = colStyle ? `style="${colStyle}"` : '';

                // Icon resolution
                let iconSvg = '';
                if (col.icon === 'Arrow') {
                  iconSvg = '<svg class="w-8 h-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>';
                } else if (col.icon === 'Play') {
                  iconSvg = '<svg class="w-8 h-8 text-indigo-600 mb-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>';
                } else if (col.icon === 'Envelope') {
                  iconSvg = '<svg class="w-8 h-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>';
                } else if (col.icon === 'Download') {
                  iconSvg = '<svg class="w-8 h-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>';
                } else if (col.icon === 'Info') {
                  iconSvg = '<svg class="w-8 h-8 text-indigo-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
                }

                return `<div class="flex flex-col ${alignClass} ${cardClass} ${animClass}" ${styleAttr}>
                          ${iconSvg}
                          ${imgUrl ? `<img src="${imgUrl}" alt="${col.title || 'Image'}" class="w-full max-h-48 object-cover rounded-xl mb-4" />` : ''}
                          <h3 class="text-xl font-bold mb-2 leading-snug">${col.title || ''}</h3>
                          <p class="text-sm opacity-80 leading-relaxed">${col.text || ''}</p>
                          ${col.btnText ? `<a href="${col.btnUrl || '#'}" class="mt-4 px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow transition-colors inline-block">${col.btnText}</a>` : ''}
                        </div>`;
              }).join('');

              let styleBlock = '';
              if (gridStyle) {
                styleBlock = `
                  <style>
                    @media (min-width: 1024px) {
                      #${randId} {
                        ${gridStyle}
                      }
                    }
                  </style>
                `;
              }

              let lgGridClass = gridStyle ? '' : `lg:${colsDesktop}`;

              return `${styleBlock}
                      <div id="${randId}" class="py-6 grid ${colsMobile} ${colsTablet} ${lgGridClass} ${gapClass} ${valignClass} w-full">
                        ${colsHtml}
                      </div>`;
            }
            case 'quote': {
              const avatar = resolveImageUrl(block.content.avatarUrl);
              const authorTitle = block.content.authorTitle || '';
              const quoteStyle = block.style.quoteStyle || 'Simple';
              const showIcon = block.content.showQuoteIcon !== false;
              const rating = block.content.rating || 'None';
              const align = block.content.align || 'center';
              const customBg = block.content.customBg || '';
              const avatarPos = block.content.avatarPos || 'Left of Name';
              const fontSize = block.style.fontSize || 'Large';
              const isItalic = block.content.isItalic !== false;
              
              const anim = block.content.animation || 'None';
              const animClass = anim === 'Fade In' ? 'transition-all duration-700 animate-fade-in' : '';

              // Layout alignment mapping
              let alignClass = align === 'left' ? 'text-left' : (align === 'right' ? 'text-right' : 'text-center');
              let flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
              let itemAlign = align === 'left' ? 'items-start' : (align === 'right' ? 'items-end' : 'items-center');

              // Font size mapping
              let sizeClass = 'text-xl';
              if (fontSize === 'Normal') sizeClass = 'text-base';
              else if (fontSize === 'X-Large') sizeClass = 'text-2xl md:text-3xl font-extrabold tracking-tight';

              // Star Rating HTML
              let starsHtml = '';
              if (rating !== 'None') {
                const count = parseInt(rating) || 5;
                let starJustify = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
                starsHtml = `<div class="flex gap-1 mb-4 text-amber-400 ${starJustify}">`;
                for (let i = 0; i < count; i++) {
                  starsHtml += `<svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
                }
                starsHtml += '</div>';
              }

              // Quote Icon HTML
              let quoteIconSvg = '';
              if (showIcon) {
                quoteIconSvg = `<svg class="w-10 h-10 text-indigo-500/10 dark:text-indigo-400/10 shrink-0 mb-4 inline-block" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>`;
              }

              // Avatar Layout HTML
              let avatarHtml = '';
              if (avatar && avatarPos !== 'None') {
                avatarHtml = `<img src="${avatar}" class="w-10 h-10 rounded-full object-cover shadow-sm border border-black/5" alt="${block.content.author || 'Author'}">`;
              }

              let footerHtml = '';
              if (block.content.author) {
                if (avatarPos === 'Left of Name' && avatarHtml) {
                  footerHtml = `
                    <footer class="flex items-center ${flexAlign} gap-3 mt-4">
                      ${avatarHtml}
                      <div class="text-left">
                        <span class="font-bold text-gray-900 dark:text-white block text-sm leading-tight">${block.content.author}</span>
                        ${authorTitle ? `<span class="text-xs text-gray-500 dark:text-gray-400 block">${authorTitle}</span>` : ''}
                      </div>
                    </footer>
                  `;
                } else if (avatarPos === 'Above Name') {
                  footerHtml = `
                    <footer class="flex flex-col ${itemAlign} gap-2 mt-6">
                      ${avatarHtml}
                      <div class="${alignClass}">
                        <span class="font-bold text-gray-900 dark:text-white block text-sm leading-tight">${block.content.author}</span>
                        ${authorTitle ? `<span class="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">${authorTitle}</span>` : ''}
                      </div>
                    </footer>
                  `;
                } else {
                  footerHtml = `
                    <footer class="mt-4">
                      <span class="font-bold text-gray-900 dark:text-white block text-sm leading-tight">${block.content.author}</span>
                      ${authorTitle ? `<span class="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">${authorTitle}</span>` : ''}
                    </footer>
                  `;
                }
              }

              // Main Style Wrapper classes
              let styleClass = 'max-w-4xl mx-auto py-8 relative px-6';
              let styleInline = '';

              if (quoteStyle === 'Card') {
                styleClass += ' bg-slate-50 dark:bg-slate-800/40 p-8 rounded-3xl border border-black/5 shadow-md';
                if (customBg) {
                  styleInline = `background-color: ${customBg};`;
                }
              } else if (quoteStyle === 'Bordered') {
                styleClass += ' border-l-4 border-indigo-600 bg-indigo-50/20 dark:bg-indigo-900/10 p-6 rounded-r-2xl';
              } else if (quoteStyle === 'Large Display') {
                styleClass += ' py-12';
              }

              const styleAttr = styleInline ? `style="${styleInline}"` : '';

              return `
                <div class="${styleClass} ${alignClass} ${animClass}" ${styleAttr}>
                  <div class="relative flex flex-col ${itemAlign}">
                    ${quoteIconSvg}
                    ${starsHtml}
                    <p class="${sizeClass} ${isItalic ? 'italic' : 'not-italic'} font-medium leading-relaxed mb-4 text-gray-800 dark:text-gray-200">
                      "${block.content.text || ''}"
                    </p>
                    ${footerHtml}
                  </div>
                </div>
              `;
            }
            case 'video': {
              const videoSource  = block.content.videoSource || 'Embed';
              const embedUrl     = block.content.embedUrl || '';
              const selfUrl      = resolveImageUrl(block.content.selfHostedUrl || '');
              const caption      = block.content.caption || '';
              const autoplay     = block.content.autoplay ? 1 : 0;
              const loop         = block.content.loop ? 1 : 0;
              const controls     = block.content.showControls !== false ? 1 : 0;
              const posterUrl    = resolveImageUrl(block.content.posterUrl || '');
              const lightbox     = block.content.lightboxMode === true;
              const animation    = block.content.animation || 'None';
              const animClass    = animation === 'Fade In' ? 'transition-all duration-700 animate-fade-in' : '';

              // Aspect ratio class
              const arMap: Record<string,string> = { '16:9': 'aspect-video', '4:3': 'aspect-[4/3]', '1:1': 'aspect-square', '9:16': 'aspect-[9/16]' };
              const arClass = arMap[block.content.aspectRatio || '16:9'] || 'aspect-video';

              // Max width class
              const mwMap: Record<string,string> = { 'Full': 'w-full', 'Large': 'max-w-5xl mx-auto', 'Medium': 'max-w-3xl mx-auto', 'Small': 'max-w-xl mx-auto' };
              const mwClass = mwMap[block.style.maxWidth || 'Large'] || 'max-w-5xl mx-auto';

              // Border radius class
              const brMap: Record<string,string> = { 'None': 'rounded-none', 'Small': 'rounded-lg', 'Medium': 'rounded-2xl' };
              const brClass = brMap[block.style.borderRadius || 'Medium'] || 'rounded-2xl';

              // Build iframe src with params
              let iframeSrc = '';
              if (videoSource === 'Embed' && embedUrl) {
                const sep = embedUrl.includes('?') ? '&' : '?';
                iframeSrc = `${embedUrl}${sep}autoplay=${autoplay}&loop=${loop}&controls=${controls}&mute=${autoplay}`;
              }

              // Build inner media HTML
              let mediaHtml = '';
              if (lightbox) {
                const bgStyle = posterUrl ? `background-image:url('${posterUrl}');background-size:cover;background-position:center;` : 'background:#0f172a;';
                const videoId = `vid-${Math.random().toString(36).slice(2,8)}`;
                const modalId = `modal-${videoId}`;
                mediaHtml = `
                  <div id="${videoId}" class="${arClass} ${brClass} overflow-hidden relative cursor-pointer group shadow-2xl"
                       style="${bgStyle}"
                       onclick="document.getElementById('${modalId}').classList.remove('hidden')">
                    <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div class="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <svg class="w-7 h-7 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
                      </div>
                    </div>
                  </div>
                  <div id="${modalId}" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                       onclick="this.classList.add('hidden')">
                    <div class="relative w-full max-w-4xl" onclick="event.stopPropagation()">
                      <button onclick="document.getElementById('${modalId}').classList.add('hidden')"
                              class="absolute -top-10 right-0 text-white text-2xl font-bold hover:opacity-70">✕</button>
                      <div class="aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                        ${videoSource === 'Embed' && iframeSrc
                          ? `<iframe src="${iframeSrc}&autoplay=1" class="w-full h-full border-0" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                          : videoSource === 'SelfHosted' && selfUrl
                            ? `<video class="w-full h-full" src="${selfUrl}" ${posterUrl ? `poster="${posterUrl}"` : ''} autoplay ${loop ? 'loop' : ''} ${controls ? 'controls' : ''} muted playsinline></video>`
                            : '<div class="w-full h-full flex items-center justify-center text-gray-400">No video source set</div>'
                        }
                      </div>
                    </div>
                  </div>
                `;
              } else if (videoSource === 'SelfHosted' && selfUrl) {
                mediaHtml = `
                  <div class="${arClass} ${brClass} overflow-hidden shadow-2xl bg-gray-100">
                    <video class="w-full h-full object-cover"
                           src="${selfUrl}"
                           ${posterUrl ? `poster="${posterUrl}"` : ''}
                           ${autoplay ? 'autoplay muted' : ''}
                           ${loop ? 'loop' : ''}
                           ${controls ? 'controls' : ''}
                           playsinline>
                    </video>
                  </div>
                `;
              } else {
                mediaHtml = `
                  <div class="${arClass} ${brClass} overflow-hidden shadow-2xl bg-gray-100">
                    ${iframeSrc
                      ? `<iframe src="${iframeSrc}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                      : `<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">No Video URL Set</div>`
                    }
                  </div>
                `;
              }

              const captionHtml = caption ? `<p class="mt-3 text-center text-sm text-gray-500 italic">${caption}</p>` : '';

              return `
                <div class="${mwClass} py-8 ${animClass}">
                  ${mediaHtml}
                  ${captionHtml}
                </div>
              `;
            }
            default:
              return '';
          }
        }).join('');

        const isBoxed = section.style.containerWidth !== 'full';
        const containerClass = isBoxed ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'w-full';

        return `
          <section class="relative ${ptClass} ${pbClass} overflow-hidden" style="${secStyle}">
            ${videoHtml}
            ${(isImageBg || isVideoBg) && overlayOpacity > 0 ? `
              <div class="absolute inset-0" style="background-color: ${overlayColor}; opacity: ${overlayOpacity}; pointer-events: none; z-index: 1;"></div>
            ` : ''}
            <div class="relative z-10 ${containerClass} w-full">
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
