import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PageService } from '../../../core/services/page.service';

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface StaticPageForm {
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroBgImage: string;

  // About
  aboutHeading: string;
  aboutDescription: string;
  aboutImage: string;

  // Services
  servicesHeading: string;
  services: ServiceItem[];

  // Stats
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;

  // CTA Banner
  ctaBannerHeading: string;
  ctaBannerSubtext: string;
  ctaBannerButtonText: string;
  ctaBannerButtonLink: string;

  // Contact
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  companyName: string;
}

@Component({
  selector: 'app-static-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './static-builder.component.html'
})
export class StaticBuilderComponent implements OnInit {
  pageId: string | null = null;
  orgId: string | null = null;
  isSaving = false;
  activeSection = 'hero';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';

  toastMessage: string | null = null;
  errorModalMessage: string | null = null;

  sections = [
    { key: 'hero', label: 'Hero', icon: '🚀' },
    { key: 'about', label: 'About', icon: '🏢' },
    { key: 'services', label: 'Services', icon: '⚙️' },
    { key: 'stats', label: 'Stats', icon: '📊' },
    { key: 'cta', label: 'CTA Banner', icon: '📣' },
    { key: 'contact', label: 'Contact', icon: '📬' }
  ];

  form: StaticPageForm = {
    heroTitle: 'Build Something Amazing',
    heroSubtitle: 'We deliver cutting-edge solutions to help your business grow faster and reach further than ever before.',
    heroCtaText: 'Get Started',
    heroCtaLink: '#contact',
    heroBgImage: '',

    aboutHeading: 'Who We Are',
    aboutDescription: 'We are a team of passionate professionals dedicated to delivering the best possible results for our clients. With years of industry experience, we bring a unique blend of creativity and technical expertise to every project.',
    aboutImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80',

    servicesHeading: 'What We Offer',
    services: [
      { title: 'Web Development', description: 'We build fast, scalable, and beautiful web applications tailored to your business needs.', icon: '💻' },
      { title: 'Digital Marketing', description: 'Grow your online presence with data-driven strategies across all digital channels.', icon: '📈' },
      { title: 'Brand Design', description: 'Create a powerful visual identity that resonates with your target audience.', icon: '🎨' }
    ],

    stat1Value: '500+',
    stat1Label: 'Projects Delivered',
    stat2Value: '98%',
    stat2Label: 'Client Satisfaction',
    stat3Value: '12+',
    stat3Label: 'Years Experience',

    ctaBannerHeading: 'Ready to Transform Your Business?',
    ctaBannerSubtext: 'Let\'s build something extraordinary together. Contact us today.',
    ctaBannerButtonText: 'Contact Us',
    ctaBannerButtonLink: '#contact',

    contactAddress: '123 Business Ave, Suite 100\nNew York, NY 10001',
    contactPhone: '+1 (555) 123-4567',
    contactEmail: 'hello@company.com',
    companyName: 'YourCompany'
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
      if (this.pageId) {
        this.loadPageData(this.pageId);
      }
    });
  }

  loadPageData(pageId: string) {
    this.pageService.getPageById(pageId).subscribe({
      next: (res) => {
        const data = res?.data || res;
        if (data && data.contentJson) {
          try {
            const parsed = JSON.parse(data.contentJson);
            this.form = { ...this.form, ...parsed };
            this.cdr.detectChanges();
          } catch (e) {
            console.error('Error parsing static builder contentJson:', e);
          }
        }
      }
    });
  }

  setSection(key: string) {
    this.activeSection = key;
  }

  addService() {
    this.form.services.push({ title: 'New Service', description: 'Service description here.', icon: '✨' });
  }

  removeService(index: number) {
    this.form.services.splice(index, 1);
  }

  generateHtml(): string {
    const servicesHtml = this.form.services.map(s => `
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size:2.5rem;margin-bottom:16px;">${s.icon}</div>
        <h3 style="font-size:1.25rem;font-weight:700;color:#111827;margin:0 0 12px;">${s.title}</h3>
        <p style="color:#6b7280;line-height:1.6;margin:0;">${s.description}</p>
      </div>
    `).join('');

    const bgStyle = this.form.heroBgImage
      ? `background:linear-gradient(rgba(15,23,42,0.7),rgba(15,23,42,0.8)),url('${this.form.heroBgImage}') center/cover no-repeat;`
      : `background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${this.form.companyName}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;color:#111827;background:#f9fafb;}
  a{text-decoration:none;}
  /* Navbar */
  .nav{background:#fff;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,0.05);}
  .nav-logo{font-size:1.5rem;font-weight:800;color:#4338ca;}
  .nav-links{display:flex;gap:32px;}
  .nav-links a{color:#374151;font-weight:500;font-size:0.95rem;transition:color 0.2s;}
  .nav-links a:hover{color:#4338ca;}
  .nav-cta{background:#4338ca;color:#fff!important;padding:10px 24px;border-radius:8px;font-weight:600;}
  .nav-cta:hover{background:#3730a3!important;}
  /* Hero */
  .hero{${bgStyle}color:#fff;padding:120px 40px;text-align:center;min-height:600px;display:flex;align-items:center;justify-content:center;}
  .hero-inner{max-width:800px;margin:0 auto;}
  .hero-badge{display:inline-block;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);padding:8px 20px;border-radius:50px;font-size:0.85rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;color:#c7d2fe;}
  .hero h1{font-size:3.5rem;font-weight:900;line-height:1.1;margin-bottom:24px;letter-spacing:-0.03em;}
  .hero p{font-size:1.25rem;color:rgba(255,255,255,0.8);line-height:1.7;margin-bottom:40px;max-width:600px;margin-left:auto;margin-right:auto;}
  .hero-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;}
  .btn-primary{background:#4338ca;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:1rem;border:2px solid #4338ca;transition:all 0.3s;display:inline-block;}
  .btn-primary:hover{background:#3730a3;border-color:#3730a3;transform:translateY(-2px);box-shadow:0 8px 24px rgba(67,56,202,0.4);}
  .btn-outline{background:transparent;color:#fff;padding:16px 36px;border-radius:12px;font-weight:700;font-size:1rem;border:2px solid rgba(255,255,255,0.4);transition:all 0.3s;display:inline-block;}
  .btn-outline:hover{background:rgba(255,255,255,0.1);transform:translateY(-2px);}
  /* About */
  .about{padding:100px 40px;background:#fff;}
  .about-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
  .section-label{font-size:0.8rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#4338ca;margin-bottom:16px;}
  .about h2{font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:24px;line-height:1.2;}
  .about p{color:#6b7280;line-height:1.8;font-size:1.05rem;}
  .about img{width:100%;border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.12);object-fit:cover;height:380px;}
  /* Services */
  .services{padding:100px 40px;background:#f9fafb;}
  .services-inner{max-width:1100px;margin:0 auto;}
  .section-header{text-align:center;margin-bottom:64px;}
  .section-header h2{font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:16px;}
  .section-header p{color:#6b7280;font-size:1.1rem;}
  .services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:28px;}
  /* Stats */
  .stats{background:linear-gradient(135deg,#4338ca,#6d28d9);padding:80px 40px;color:#fff;}
  .stats-inner{max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;text-align:center;}
  .stat-value{font-size:3rem;font-weight:900;margin-bottom:8px;}
  .stat-label{font-size:1rem;opacity:0.8;font-weight:500;}
  /* CTA */
  .cta-banner{padding:100px 40px;background:#fff;text-align:center;}
  .cta-banner-inner{max-width:700px;margin:0 auto;}
  .cta-banner h2{font-size:2.75rem;font-weight:800;color:#111827;margin-bottom:20px;line-height:1.2;}
  .cta-banner p{color:#6b7280;font-size:1.1rem;margin-bottom:40px;line-height:1.7;}
  .btn-dark{background:#111827;color:#fff;padding:16px 40px;border-radius:12px;font-weight:700;font-size:1.05rem;transition:all 0.3s;display:inline-block;}
  .btn-dark:hover{background:#1f2937;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}
  /* Contact */
  .contact{padding:100px 40px;background:#f9fafb;}
  .contact-inner{max-width:900px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;}
  .contact h2{font-size:2.5rem;font-weight:800;color:#111827;margin-bottom:32px;}
  .contact-items{display:flex;flex-direction:column;gap:24px;}
  .contact-item{display:flex;align-items:flex-start;gap:16px;}
  .contact-icon{width:48px;height:48px;background:#ede9fe;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;}
  .contact-text h4{font-weight:700;color:#111827;margin-bottom:4px;}
  .contact-text p{color:#6b7280;line-height:1.6;}
  .contact-form{background:#fff;border-radius:20px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);}
  .form-group{margin-bottom:20px;}
  .form-group label{display:block;font-weight:600;font-size:0.9rem;color:#374151;margin-bottom:8px;}
  .form-group input,.form-group textarea{width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:10px;font-family:inherit;font-size:0.95rem;color:#111827;outline:none;transition:border 0.2s;background:#f9fafb;}
  .form-group input:focus,.form-group textarea:focus{border-color:#4338ca;background:#fff;}
  .form-group textarea{height:120px;resize:none;}
  .form-submit{background:#4338ca;color:#fff;border:none;padding:14px;width:100%;border-radius:10px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.2s;}
  .form-submit:hover{background:#3730a3;}
  /* Footer */
  .footer{background:#111827;color:#9ca3af;padding:40px;text-align:center;}
  .footer p{font-size:0.9rem;}
  .footer span{color:#4338ca;font-weight:600;}
  @media(max-width:768px){
    .hero h1{font-size:2.2rem;}
    .about-inner{grid-template-columns:1fr;}
    .stats-inner{grid-template-columns:1fr;}
    .contact-inner{grid-template-columns:1fr;}
    .nav-links{display:none;}
  }
</style>
</head>
<body>

<!-- Navbar -->
<nav class="nav">
  <div class="nav-logo">${this.form.companyName}</div>
  <div class="nav-links">
    <a href="#about">About</a>
    <a href="#services">Services</a>
    <a href="#contact">Contact</a>
    <a href="${this.form.heroCtaLink || '#contact'}" class="nav-cta">${this.form.heroCtaText || 'Get Started'}</a>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge">✦ Welcome to ${this.form.companyName}</div>
    <h1>${this.form.heroTitle}</h1>
    <p>${this.form.heroSubtitle}</p>
    <div class="hero-btns">
      <a href="${this.form.heroCtaLink || '#contact'}" class="btn-primary">${this.form.heroCtaText || 'Get Started'}</a>
      <a href="#about" class="btn-outline">Learn More →</a>
    </div>
  </div>
</section>

<!-- About -->
<section class="about" id="about">
  <div class="about-inner">
    <div>
      <div class="section-label">About Us</div>
      <h2>${this.form.aboutHeading}</h2>
      <p>${this.form.aboutDescription}</p>
    </div>
    ${this.form.aboutImage ? `<img src="${this.form.aboutImage}" alt="About" loading="lazy">` : ''}
  </div>
</section>

<!-- Services -->
<section class="services" id="services">
  <div class="services-inner">
    <div class="section-header">
      <div class="section-label">What We Do</div>
      <h2>${this.form.servicesHeading}</h2>
    </div>
    <div class="services-grid">
      ${servicesHtml}
    </div>
  </div>
</section>

<!-- Stats -->
<section class="stats">
  <div class="stats-inner">
    <div><div class="stat-value">${this.form.stat1Value}</div><div class="stat-label">${this.form.stat1Label}</div></div>
    <div><div class="stat-value">${this.form.stat2Value}</div><div class="stat-label">${this.form.stat2Label}</div></div>
    <div><div class="stat-value">${this.form.stat3Value}</div><div class="stat-label">${this.form.stat3Label}</div></div>
  </div>
</section>

<!-- CTA Banner -->
<section class="cta-banner">
  <div class="cta-banner-inner">
    <h2>${this.form.ctaBannerHeading}</h2>
    <p>${this.form.ctaBannerSubtext}</p>
    <a href="${this.form.ctaBannerButtonLink || '#contact'}" class="btn-dark">${this.form.ctaBannerButtonText} →</a>
  </div>
</section>

<!-- Contact -->
<section class="contact" id="contact">
  <div class="contact-inner">
    <div>
      <h2>Get In Touch</h2>
      <div class="contact-items">
        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div class="contact-text">
            <h4>Address</h4>
            <p>${this.form.contactAddress.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div class="contact-text">
            <h4>Phone</h4>
            <p>${this.form.contactPhone}</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">✉️</div>
          <div class="contact-text">
            <h4>Email</h4>
            <p>${this.form.contactEmail}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="contact-form">
      <div class="form-group">
        <label>Your Name</label>
        <input type="text" placeholder="John Doe">
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" placeholder="john@example.com">
      </div>
      <div class="form-group">
        <label>Message</label>
        <textarea placeholder="Tell us about your project..."></textarea>
      </div>
      <button class="form-submit">Send Message</button>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <p>&copy; ${new Date().getFullYear()} <span>${this.form.companyName}</span>. All rights reserved.</p>
</footer>

</body>
</html>`;
  }

  get previewHtml(): string {
    return this.generateHtml();
  }

  updatePreviewIframe() {
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(this.generateHtml());
        doc.close();
      }
    }
  }

  save(status: string = 'Draft') {
    if (!this.pageId) {
      this.showErrorModal('No page ID found. Please go back and select a page.');
      return;
    }

    this.saveStatus = 'saving';
    const generatedHtml = this.generateHtml();

    const payload = {
      title: this.form.heroTitle || 'Static Template Page',
      bodyHtml: generatedHtml,
      status: status,
      contentJson: JSON.stringify(this.form)
    };

    this.pageService.updatePage(this.pageId, payload).subscribe({
      next: () => {
        this.saveStatus = 'saved';
        this.showToast(`Template successfully saved as ${status}!`);
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000);
      },
      error: (err: any) => {
        this.saveStatus = 'error';
        this.cdr.detectChanges();
        this.showErrorModal('Failed to save template. Check the console for details.');
        console.error('Save failed:', err);
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000);
      }
    });
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  showErrorModal(msg: string) {
    this.errorModalMessage = msg;
  }

  closeErrorModal() {
    this.errorModalMessage = null;
  }

  goBack() {
    this.location.back();
  }
}
