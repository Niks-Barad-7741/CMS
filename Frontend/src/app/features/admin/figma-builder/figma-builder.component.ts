import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageService } from '../../../core/services/page.service';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FigmaWireframeForm {
  companyName: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryBtn: string;
  heroSecondaryBtn: string;
  
  featureTitle: string;
  featureSubtitle: string;
  features: FeatureItem[];
  
  contentHeading: string;
  contentBody1: string;
  contentBody2: string;
  contentBtn: string;
  
  footerAddress: string;
  footerEmail: string;
  footerPhone: string;
}

@Component({
  selector: 'app-figma-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './figma-builder.component.html'
})
export class FigmaBuilderComponent implements OnInit {
  pageId: string | null = null;
  orgId: string | null = null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';

  form: FigmaWireframeForm = {
    companyName: 'CorporateLogo',
    heroHeadline: 'Strategic solutions for your business growth',
    heroSubheadline: 'We provide innovative strategies and execution to help you scale efficiently and securely in the modern digital landscape.',
    heroPrimaryBtn: 'Get Started',
    heroSecondaryBtn: 'Learn More',
    
    featureTitle: 'Our Core Capabilities',
    featureSubtitle: 'Everything you need to manage your enterprise operations seamlessly.',
    features: [
      { icon: '▢', title: 'Data Analytics', description: 'Transform raw data into actionable insights with our advanced processing engine.' },
      { icon: '△', title: 'Cloud Integration', description: 'Seamlessly connect your existing infrastructure with scalable cloud solutions.' },
      { icon: '◯', title: 'Security First', description: 'Enterprise-grade security protocols ensuring your data remains protected.' }
    ],
    
    contentHeading: 'Transforming the way you work',
    contentBody1: 'Our platform integrates with all your favorite tools to provide a seamless workflow experience. No more context switching or lost data.',
    contentBody2: 'With real-time collaboration and automated reporting, your team can focus on what actually matters instead of tedious manual tasks.',
    contentBtn: 'Read our story',
    
    footerAddress: '123 Business Avenue, Suite 400',
    footerEmail: 'contact@corporate.com',
    footerPhone: '+1 (555) 123-4567'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private pageService: PageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageId = params.get('pageId');
      this.orgId = params.get('orgId');
    });
  }

  generateHtml(): string {
    const featuresHtml = this.form.features.map(f => `
      <div class="feature-card">
        <div class="feature-icon">${f.icon}</div>
        <h3 class="feature-title">${f.title || 'Feature Title'}</h3>
        <div class="wire-line"></div>
        <div class="wire-line"></div>
        <p class="feature-desc">${f.description || 'Feature description placeholder.'}</p>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${this.form.companyName}</title>
<style>
  /* Grayscale Wireframe Styles */
  :root {
    --bg-main: #ffffff;
    --bg-alt: #f9fafb;
    --border: #e5e7eb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-800: #1f2937;
    --gray-900: #111827;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  body { background-color: var(--bg-main); color: var(--gray-900); line-height: 1.5; }
  
  /* Header */
  .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid var(--border); }
  .logo { font-size: 1.25rem; font-weight: 800; color: var(--gray-900); padding: 8px 16px; background: var(--gray-200); border-radius: 4px; display: inline-block; }
  .nav { display: flex; gap: 24px; }
  .nav-item { width: 64px; height: 12px; background: var(--gray-200); border-radius: 4px; }
  .header-btn { padding: 10px 24px; background: var(--gray-800); color: white; border-radius: 6px; font-weight: 600; font-size: 0.9rem; border: none; }

  /* Hero */
  .hero { padding: 100px 40px; text-align: center; background: var(--bg-alt); }
  .hero-inner { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
  .hero h1 { font-size: 3rem; font-weight: 800; line-height: 1.2; margin-bottom: 24px; color: var(--gray-900); }
  .hero p { font-size: 1.25rem; color: var(--gray-400); margin-bottom: 40px; max-width: 600px; }
  .hero-btns { display: flex; gap: 16px; justify-content: center; }
  .btn-primary { background: var(--gray-800); color: white; padding: 14px 32px; border-radius: 6px; font-weight: 600; }
  .btn-secondary { background: var(--gray-200); color: var(--gray-800); padding: 14px 32px; border-radius: 6px; font-weight: 600; }

  /* Features */
  .features { padding: 80px 40px; }
  .features-header { text-align: center; margin-bottom: 64px; }
  .features-header h2 { font-size: 2rem; font-weight: 700; background: var(--gray-200); display: inline-block; padding: 8px 24px; border-radius: 4px; margin-bottom: 16px; color: var(--gray-800); }
  .features-header p { font-size: 1.1rem; color: var(--gray-400); max-width: 500px; margin: 0 auto; }
  
  .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 32px; max-width: 1000px; margin: 0 auto; }
  .feature-card { border: 1px solid var(--border); padding: 32px; border-radius: 12px; text-align: center; background: white; }
  .feature-icon { width: 64px; height: 64px; background: var(--gray-200); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--gray-400); }
  .feature-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: var(--gray-800); }
  .feature-desc { color: var(--gray-400); font-size: 0.95rem; line-height: 1.6; }
  .wire-line { height: 8px; background: var(--gray-100); margin-bottom: 8px; border-radius: 4px; }

  /* Content Block */
  .content-block { padding: 80px 40px; background: var(--bg-alt); }
  .content-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
  .content-image { width: 100%; height: 400px; background: var(--gray-300); border-radius: 12px; }
  .content-text h2 { font-size: 2rem; font-weight: 800; margin-bottom: 24px; color: var(--gray-900); }
  .content-text p { color: var(--gray-400); margin-bottom: 16px; font-size: 1.1rem; }
  .content-text .btn-primary { margin-top: 16px; display: inline-block; }

  /* Footer */
  .footer { background: var(--gray-900); color: white; padding: 64px 40px; }
  .footer-inner { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 40px; }
  .footer-col h4 { font-size: 1.1rem; margin-bottom: 24px; color: var(--gray-300); background: var(--gray-800); display: inline-block; padding: 4px 12px; border-radius: 4px; }
  .footer-col p { color: var(--gray-400); margin-bottom: 8px; font-size: 0.9rem; }
  .footer-wire { height: 8px; background: var(--gray-800); margin-bottom: 12px; border-radius: 4px; width: 80%; }
</style>
</head>
<body>

  <header class="header">
    <div class="logo">${this.form.companyName || 'Logo'}</div>
    <div class="nav">
      <div class="nav-item"></div>
      <div class="nav-item"></div>
      <div class="nav-item"></div>
      <div class="nav-item"></div>
    </div>
    <button class="header-btn">CTA Button</button>
  </header>

  <section class="hero">
    <div class="hero-inner">
      <h1>${this.form.heroHeadline || 'Hero Headline'}</h1>
      <p>${this.form.heroSubheadline || 'Subtitle text goes here'}</p>
      <div class="hero-btns">
        <div class="btn-primary">${this.form.heroPrimaryBtn || 'Button'}</div>
        <div class="btn-secondary">${this.form.heroSecondaryBtn || 'Button'}</div>
      </div>
    </div>
  </section>

  <section class="features">
    <div class="features-header">
      <h2>${this.form.featureTitle || 'Features'}</h2>
      <p>${this.form.featureSubtitle || 'Feature subheadline'}</p>
    </div>
    <div class="features-grid">
      ${featuresHtml}
    </div>
  </section>

  <section class="content-block">
    <div class="content-inner">
      <div class="content-image"></div>
      <div class="content-text">
        <h2>${this.form.contentHeading || 'Content Heading'}</h2>
        <p>${this.form.contentBody1 || 'Content body paragraph 1'}</p>
        <p>${this.form.contentBody2 || 'Content body paragraph 2'}</p>
        <div class="btn-primary">${this.form.contentBtn || 'Action'}</div>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-col">
        <h4>${this.form.companyName || 'Company'}</h4>
        <p>${this.form.footerAddress}</p>
        <p>${this.form.footerEmail}</p>
        <p>${this.form.footerPhone}</p>
      </div>
      <div class="footer-col">
        <div class="footer-wire" style="width: 60%"></div>
        <div class="footer-wire" style="width: 80%"></div>
        <div class="footer-wire" style="width: 50%"></div>
        <div class="footer-wire" style="width: 70%"></div>
      </div>
      <div class="footer-col">
        <div class="footer-wire" style="width: 90%"></div>
        <div class="footer-wire" style="width: 40%"></div>
        <div class="footer-wire" style="width: 60%"></div>
        <div class="footer-wire" style="width: 80%"></div>
      </div>
      <div class="footer-col">
        <div class="footer-wire" style="width: 50%"></div>
        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <div style="width: 32px; height: 32px; background: var(--gray-800); border-radius: 50%;"></div>
          <div style="width: 32px; height: 32px; background: var(--gray-800); border-radius: 50%;"></div>
          <div style="width: 32px; height: 32px; background: var(--gray-800); border-radius: 50%;"></div>
        </div>
      </div>
    </div>
  </footer>

</body>
</html>`;
  }

  get previewHtml(): string {
    return this.generateHtml();
  }

  updatePreviewIframe() {
    const iframe = document.getElementById('figma-preview') as HTMLIFrameElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(this.generateHtml());
        doc.close();
      }
    }
  }

  save() {
    if (!this.pageId) return;

    this.saveStatus = 'saving';
    const payload = {
      title: this.form.companyName + ' Wireframe',
      bodyHtml: this.generateHtml(),
      status: 'Published'
    };

    this.pageService.updatePage(this.pageId, payload).subscribe({
      next: () => {
        this.saveStatus = 'saved';
        this.cdr.detectChanges();
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.saveStatus = 'error';
        console.error(err);
        this.cdr.detectChanges();
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000);
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
