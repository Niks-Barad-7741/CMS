import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { PageService } from '../../../core/services/page.service';

// ─── Page Data Interfaces ─────────────────────────────────────────────────────

interface Stat { value: string; label: string; }
interface Feature { icon: string; title: string; description: string; }
interface TeamMember { name: string; role: string; image: string; bio: string; }
interface FaqItem { question: string; answer: string; }
interface ServiceItem { icon: string; title: string; description: string; }

interface HomeData {
  heroTitle: string; heroSubtitle: string; heroDescription: string;
  heroCtaText: string; heroCtaLink: string; heroBgImage: string;
  features: Feature[];
  stat1: Stat; stat2: Stat; stat3: Stat;
}

interface AboutData {
  pageTitle: string; subtitle: string; description: string; image: string;
  missionTitle: string; missionText: string;
  stat1: Stat; stat2: Stat; stat3: Stat;
  team: TeamMember[];
}

interface ServicesData {
  pageTitle: string; subtitle: string; description: string;
  services: ServiceItem[];
}

interface ContactData {
  pageTitle: string; subtitle: string; description: string;
  address: string; phone: string; email: string;
  mapEmbed: string; workingHours: string;
}

interface FaqData {
  pageTitle: string; subtitle: string;
  faqs: FaqItem[];
}

export type PageType = 'home' | 'about' | 'services' | 'contact' | 'faq';

export const PAGE_TYPES: { key: PageType; label: string; icon: string; description: string }[] = [
  { key: 'home',     label: 'Home',     icon: '🏠', description: 'Main landing page with hero, features & stats' },
  { key: 'about',    label: 'About Us', icon: '👥', description: 'Company story, mission, team & achievements' },
  { key: 'services', label: 'Services', icon: '⚙️', description: 'Service offerings with icons & descriptions' },
  { key: 'contact',  label: 'Contact',  icon: '📬', description: 'Contact info, address & enquiry form' },
  { key: 'faq',      label: 'FAQ',      icon: '❓', description: 'Frequently asked questions accordion' },
];

@Component({
  selector: 'app-page-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './page-editor.component.html'
})
export class PageEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  pageId: string | null = null;
  orgId: string | null = null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  selectedPageType: PageType = 'about';
  pageTypeOptions = PAGE_TYPES;

  // ── Form Data per page type ──────────────────────────────────────────────────
  homeData: HomeData = {
    heroTitle: 'Welcome to Our Platform',
    heroSubtitle: 'Safe, Comprehensive and Fast',
    heroDescription: 'The world\'s leading platform for seamless digital experiences. We bring together innovation and reliability to power your growth.',
    heroCtaText: 'Get Started',
    heroCtaLink: '#contact',
    heroBgImage: '',
    features: [
      { icon: '🚀', title: 'Lightning Fast', description: 'Experience blazing-fast performance with our optimized infrastructure.' },
      { icon: '🔒', title: 'Fully Secure', description: 'Enterprise-grade security protecting your data at every layer.' },
      { icon: '📊', title: 'Data Insights', description: 'Real-time analytics and reporting to drive smarter decisions.' },
    ],
    stat1: { value: '20,123', label: 'Number of Transactions' },
    stat2: { value: '1,400', label: 'Established Year' },
    stat3: { value: '13,560', label: 'Number of Users' },
  };

  aboutData: AboutData = {
    pageTitle: 'About Us',
    subtitle: 'Safe, comprehensive and fast platform',
    description: 'The world\'s financial industry is changing from an opaque, traditional and centralized state to a transparent, technology-based and decentralized one. We believe that with the advent of blockchain technology, the fourth industrial revolution is taking place and we should seek to create a fundamental and key role in this technology.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    missionTitle: 'Our Mission',
    missionText: 'To democratize access to financial technology and empower individuals and businesses worldwide to participate in the digital economy.',
    stat1: { value: '20,123', label: 'Number of Transactions' },
    stat2: { value: '1,400', label: 'Established Year' },
    stat3: { value: '13,560', label: 'Number of Users' },
    team: [
      { name: 'Alex Johnson', role: 'CEO & Founder', image: 'https://randomuser.me/api/portraits/men/32.jpg', bio: 'Visionary leader with 15+ years in fintech.' },
      { name: 'Sarah Williams', role: 'CTO', image: 'https://randomuser.me/api/portraits/women/44.jpg', bio: 'Tech innovator and blockchain enthusiast.' },
    ]
  };

  servicesData: ServicesData = {
    pageTitle: 'Our Services',
    subtitle: 'Everything you need to succeed',
    description: 'We provide a comprehensive suite of services designed to help your business grow and thrive in the digital age.',
    services: [
      { icon: '💹', title: 'Trading Platform', description: 'Advanced tools for seamless digital asset trading with real-time market data.' },
      { icon: '🔐', title: 'Secure Wallet', description: 'Multi-signature wallet with enterprise-grade security for your digital assets.' },
      { icon: '📈', title: 'Portfolio Analytics', description: 'AI-powered insights and analytics to optimize your investment strategy.' },
      { icon: '🌐', title: 'Global Access', description: '24/7 access to global markets from any device, anywhere in the world.' },
    ]
  };

  contactData: ContactData = {
    pageTitle: 'Contact Us',
    subtitle: 'We\'d love to hear from you',
    description: 'Have a question or want to work together? Send us a message and we\'ll get back to you within 24 hours.',
    address: '123 Blockchain Avenue, Suite 400\nNew York, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'hello@platform.com',
    mapEmbed: '',
    workingHours: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat: 10:00 AM - 4:00 PM',
  };

  faqData: FaqData = {
    pageTitle: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions',
    faqs: [
      { question: 'How do I get started?', answer: 'Simply create an account, complete the verification process, and you\'re ready to go. The entire process takes less than 5 minutes.' },
      { question: 'Is my data secure?', answer: 'Absolutely. We use military-grade encryption and multi-factor authentication to ensure your data is always protected.' },
      { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, bank transfers, and popular cryptocurrencies including Bitcoin and Ethereum.' },
      { question: 'How can I contact support?', answer: 'Our support team is available 24/7 via live chat, email, and phone. Response times are typically under 2 hours.' },
    ]
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
      const type = params.get('pageType') as PageType;
      if (type && PAGE_TYPES.find(p => p.key === type)) {
        this.selectedPageType = type;
      }
      this.loadPageData();
    });
  }

  loadPageData() {
    if (!this.pageId) return;
    this.pageService.getPageById(this.pageId).subscribe({
      next: (res: any) => {
        const page = res?.data || res;
        if (page && page.contentJson) {
          try {
            const parsed = JSON.parse(page.contentJson);
            if (parsed.selectedPageType) this.selectedPageType = parsed.selectedPageType;
            if (parsed.homeData) this.homeData = parsed.homeData;
            if (parsed.aboutData) this.aboutData = parsed.aboutData;
            if (parsed.servicesData) this.servicesData = parsed.servicesData;
            if (parsed.contactData) this.contactData = parsed.contactData;
            if (parsed.faqData) this.faqData = parsed.faqData;
            this.renderPreview();
          } catch (e) {
            console.error('Error parsing ContentJson', e);
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderPreview(), 100);
  }

  onPageTypeChange() {
    this.renderPreview();
  }

  addFeature() { this.homeData.features.push({ icon: '✨', title: 'New Feature', description: 'Feature description here.' }); this.renderPreview(); }
  removeFeature(i: number) { this.homeData.features.splice(i, 1); this.renderPreview(); }

  addService() { this.servicesData.services.push({ icon: '🔧', title: 'New Service', description: 'Service description.' }); this.renderPreview(); }
  removeService(i: number) { this.servicesData.services.splice(i, 1); this.renderPreview(); }

  addTeamMember() { this.aboutData.team.push({ name: 'New Member', role: 'Role', image: '', bio: 'Bio here.' }); this.renderPreview(); }
  removeTeamMember(i: number) { this.aboutData.team.splice(i, 1); this.renderPreview(); }

  addFaq() { this.faqData.faqs.push({ question: 'New Question?', answer: 'Answer here.' }); this.renderPreview(); }
  removeFaq(i: number) { this.faqData.faqs.splice(i, 1); this.renderPreview(); }

  renderPreview() {
    const html = this.generateHtml();
    if (this.previewFrame?.nativeElement) {
      const doc = this.previewFrame.nativeElement.contentDocument || this.previewFrame.nativeElement.contentWindow?.document;
      if (doc) { doc.open(); doc.write(html); doc.close(); }
    }
    this.cdr.detectChanges();
  }

  save(status: string) {
    if (!this.pageId) { alert('No page ID. Go back and select a page.'); return; }
    this.saveStatus = 'saving';

    const jsonPayload = JSON.stringify({
      selectedPageType: this.selectedPageType,
      homeData: this.homeData,
      aboutData: this.aboutData,
      servicesData: this.servicesData,
      contactData: this.contactData,
      faqData: this.faqData
    });

    const payload = {
      title: (this.getPageTitle() || '').trim(),
      bodyHtml: this.generateHtml().trim(),
      status: status || 'Published',
      contentJson: jsonPayload
    };

    this.pageService.updatePage(this.pageId, payload).subscribe({
      next: () => { 
        this.saveStatus = 'saved'; 
        this.cdr.detectChanges(); 
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000); 
      },
      error: (err: any) => { 
        this.saveStatus = 'error'; 
        console.error('Save failed:', err); 
        this.cdr.detectChanges(); 
        setTimeout(() => { this.saveStatus = 'idle'; this.cdr.detectChanges(); }, 3000); 
      }
    });
  }

  goBack() { this.location.back(); }

  getPageTitle(): string {
    switch (this.selectedPageType) {
      case 'home': return this.homeData.heroTitle;
      case 'about': return this.aboutData.pageTitle;
      case 'services': return this.servicesData.pageTitle;
      case 'contact': return this.contactData.pageTitle;
      case 'faq': return this.faqData.pageTitle;
    }
  }

  getCurrentPageIcon(): string {
    return PAGE_TYPES.find(p => p.key === this.selectedPageType)?.icon ?? '📄';
  }

  getCurrentPageLabel(): string {
    return PAGE_TYPES.find(p => p.key === this.selectedPageType)?.label ?? 'Page';
  }

  // ─── HTML Generation ─────────────────────────────────────────────────────────

  private baseStyles = `
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', sans-serif; background: #0d0d1a; color: #fff; }
      a { text-decoration: none; color: inherit; }
      .nav { background: rgba(13,13,26,0.95); backdrop-filter: blur(12px); padding: 18px 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 100; }
      .nav-logo { width: 40px; height: 40px; background: #f5c518; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
      .nav-links { display: flex; gap: 32px; align-items: center; }
      .nav-links a { color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
      .nav-links a:hover { color: #f5c518; }
      .nav-actions { display: flex; gap: 12px; align-items: center; }
      .btn-login { color: #fff; font-weight: 600; font-size: 0.9rem; }
      .btn-signup { background: #f5c518; color: #0d0d1a; padding: 10px 24px; border-radius: 6px; font-weight: 700; font-size: 0.9rem; transition: opacity 0.2s; }
      .btn-signup:hover { opacity: 0.85; }
      .section-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #f5c518; margin-bottom: 12px; }
      .yellow { color: #f5c518; }
      .stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; padding: 60px; border-top: 1px solid rgba(255,255,255,0.08); }
      .stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px; font-weight: 500; }
      .stat-value { font-size: 2.8rem; font-weight: 900; color: #f5c518; letter-spacing: -0.02em; }
    </style>`;

  generateHtml(): string {
    switch (this.selectedPageType) {
      case 'home':     return this.genHome();
      case 'about':    return this.genAbout();
      case 'services': return this.genServices();
      case 'contact':  return this.genContact();
      case 'faq':      return this.genFaq();
    }
  }

  private genHome(): string {
    const d = this.homeData;
    const bgStyle = d.heroBgImage
      ? `background: linear-gradient(rgba(13,13,26,0.85),rgba(13,13,26,0.9)), url('${d.heroBgImage}') center/cover;`
      : `background: radial-gradient(ellipse at top left, #1a1a3e 0%, #0d0d1a 60%);`;

    const featuresHtml = d.features.map(f => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:16px;">${f.icon}</div>
        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:10px;">${f.title}</h3>
        <p style="color:rgba(255,255,255,0.55);font-size:0.9rem;line-height:1.6;">${f.description}</p>
      </div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${d.heroTitle}</title>${this.baseStyles}</head><body>
      <nav class="nav">
        <div class="nav-logo">★</div>
        <div class="nav-links"><a href="#">Our Pages ▾</a><a href="#">Trade ▾</a><a href="#">Contact</a></div>
        <div class="nav-actions"><a class="btn-login" href="#">Login</a><a class="btn-signup" href="${d.heroCtaLink}">${d.heroCtaText}</a></div>
      </nav>
      <section style="${bgStyle}min-height:70vh;display:flex;align-items:center;padding:80px 60px;">
        <div style="max-width:700px;">
          <div style="font-size:0.8rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f5c518;margin-bottom:16px;">✦ Welcome</div>
          <h1 style="font-size:3.5rem;font-weight:900;line-height:1.1;margin-bottom:20px;letter-spacing:-0.03em;">${d.heroTitle}</h1>
          <p style="font-size:1.2rem;color:#f5c518;font-weight:600;margin-bottom:20px;">${d.heroSubtitle}</p>
          <p style="color:rgba(255,255,255,0.65);line-height:1.8;font-size:1rem;max-width:560px;margin-bottom:36px;">${d.heroDescription}</p>
          <a href="${d.heroCtaLink}" style="background:#f5c518;color:#0d0d1a;padding:16px 36px;border-radius:8px;font-weight:800;font-size:1rem;display:inline-block;">${d.heroCtaText} →</a>
        </div>
      </section>
      <section style="padding:80px 60px;">
        <div style="text-align:center;margin-bottom:60px;">
          <p class="section-label">What We Offer</p>
          <h2 style="font-size:2.2rem;font-weight:800;">Everything You Need</h2>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">${featuresHtml}</div>
      </section>
      <div class="stats-bar">
        <div><div class="stat-label">${d.stat1.label}</div><div class="stat-value">${d.stat1.value}</div></div>
        <div><div class="stat-label">${d.stat2.label}</div><div class="stat-value">${d.stat2.value}</div></div>
        <div><div class="stat-label">${d.stat3.label}</div><div class="stat-value">${d.stat3.value}</div></div>
      </div>
      <footer style="padding:32px 60px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;">© ${new Date().getFullYear()} All rights reserved.</footer>
    </body></html>`;
  }

  private genAbout(): string {
    const d = this.aboutData;
    const teamHtml = d.team.map(m => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px;display:flex;gap:20px;align-items:center;">
        ${m.image ? `<img src="${m.image}" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:2px solid #f5c518;" alt="${m.name}">` : `<div style="width:70px;height:70px;border-radius:50%;background:#f5c518;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#0d0d1a;font-weight:900;flex-shrink:0;">${m.name[0]}</div>`}
        <div><h4 style="font-weight:700;margin-bottom:4px;">${m.name}</h4><p style="color:#f5c518;font-size:0.85rem;margin-bottom:6px;">${m.role}</p><p style="color:rgba(255,255,255,0.55);font-size:0.85rem;">${m.bio}</p></div>
      </div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${d.pageTitle}</title>${this.baseStyles}</head><body>
      <nav class="nav">
        <div class="nav-logo">★</div>
        <div class="nav-links"><a href="#">Our Pages ▾</a><a href="#">Trade ▾</a><a href="#">Contact</a></div>
        <div class="nav-actions"><a class="btn-login" href="#">Login</a><a class="btn-signup" href="#">Sign up</a></div>
      </nav>
      <section style="padding:80px 60px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;min-height:70vh;">
        <div>
          <h1 style="font-size:3.5rem;font-weight:900;margin-bottom:20px;">${d.pageTitle}</h1>
          <p style="font-size:1.1rem;color:#f5c518;font-weight:600;margin-bottom:24px;">${d.subtitle}</p>
          <p style="color:rgba(255,255,255,0.65);line-height:1.8;font-size:0.95rem;">${d.description}</p>
          ${d.missionText ? `<div style="margin-top:32px;padding:24px;background:rgba(245,197,24,0.08);border-left:3px solid #f5c518;border-radius:0 12px 12px 0;"><h4 style="color:#f5c518;font-weight:700;margin-bottom:8px;">${d.missionTitle}</h4><p style="color:rgba(255,255,255,0.65);line-height:1.7;font-size:0.9rem;">${d.missionText}</p></div>` : ''}
        </div>
        <div>
          ${d.image ? `<img src="${d.image}" style="width:100%;border-radius:20px;object-fit:cover;max-height:420px;border:1px solid rgba(255,255,255,0.1);" alt="About">` : '<div style="width:100%;height:340px;background:rgba(255,255,255,0.05);border-radius:20px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);">No image added</div>'}
        </div>
      </section>
      <div class="stats-bar">
        <div><div class="stat-label">${d.stat1.label}</div><div class="stat-value">${d.stat1.value}</div></div>
        <div><div class="stat-label">${d.stat2.label}</div><div class="stat-value">${d.stat2.value}</div></div>
        <div><div class="stat-label">${d.stat3.label}</div><div class="stat-value">${d.stat3.value}</div></div>
      </div>
      ${d.team.length ? `<section style="padding:80px 60px;"><div style="margin-bottom:48px;"><p class="section-label">Meet The Team</p><h2 style="font-size:2rem;font-weight:800;">Our People</h2></div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px;">${teamHtml}</div></section>` : ''}
      <footer style="padding:32px 60px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;">© ${new Date().getFullYear()} All rights reserved.</footer>
    </body></html>`;
  }

  private genServices(): string {
    const d = this.servicesData;
    const svcsHtml = d.services.map(s => `
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:36px;transition:border-color 0.2s;">
        <div style="font-size:2.5rem;margin-bottom:20px;">${s.icon}</div>
        <h3 style="font-size:1.2rem;font-weight:700;margin-bottom:12px;">${s.title}</h3>
        <p style="color:rgba(255,255,255,0.55);line-height:1.7;font-size:0.9rem;">${s.description}</p>
      </div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${d.pageTitle}</title>${this.baseStyles}</head><body>
      <nav class="nav">
        <div class="nav-logo">★</div>
        <div class="nav-links"><a href="#">Our Pages ▾</a><a href="#">Trade ▾</a><a href="#">Contact</a></div>
        <div class="nav-actions"><a class="btn-login" href="#">Login</a><a class="btn-signup" href="#">Sign up</a></div>
      </nav>
      <section style="padding:100px 60px 60px;text-align:center;">
        <p class="section-label">What We Offer</p>
        <h1 style="font-size:3rem;font-weight:900;margin-bottom:20px;">${d.pageTitle}</h1>
        <p style="color:#f5c518;font-size:1.1rem;font-weight:600;margin-bottom:16px;">${d.subtitle}</p>
        <p style="color:rgba(255,255,255,0.55);max-width:600px;margin:0 auto;line-height:1.8;">${d.description}</p>
      </section>
      <section style="padding:20px 60px 100px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">${svcsHtml}</div>
      </section>
      <footer style="padding:32px 60px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;">© ${new Date().getFullYear()} All rights reserved.</footer>
    </body></html>`;
  }

  private genContact(): string {
    const d = this.contactData;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${d.pageTitle}</title>${this.baseStyles}
    <style>
      .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;padding:80px 60px;align-items:start;}
      .info-item{display:flex;gap:16px;margin-bottom:32px;}
      .info-icon{width:52px;height:52px;background:rgba(245,197,24,0.12);border:1px solid rgba(245,197,24,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
      .form-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px;}
      .form-group{margin-bottom:20px;}
      .form-group label{display:block;font-size:0.85rem;font-weight:600;color:rgba(255,255,255,0.6);margin-bottom:8px;}
      .form-group input,.form-group textarea{width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:14px 16px;color:#fff;font-family:inherit;font-size:0.9rem;outline:none;}
      .form-group textarea{height:120px;resize:none;}
      .form-submit{background:#f5c518;color:#0d0d1a;border:none;padding:14px;width:100%;border-radius:10px;font-size:1rem;font-weight:800;cursor:pointer;font-family:inherit;}
    </style></head><body>
      <nav class="nav">
        <div class="nav-logo">★</div>
        <div class="nav-links"><a href="#">Our Pages ▾</a><a href="#">Trade ▾</a><a href="#">Contact</a></div>
        <div class="nav-actions"><a class="btn-login" href="#">Login</a><a class="btn-signup" href="#">Sign up</a></div>
      </nav>
      <section style="padding:80px 60px 40px;">
        <p class="section-label">Get In Touch</p>
        <h1 style="font-size:3rem;font-weight:900;margin-bottom:16px;">${d.pageTitle}</h1>
        <p style="color:#f5c518;font-size:1.05rem;font-weight:600;margin-bottom:12px;">${d.subtitle}</p>
        <p style="color:rgba(255,255,255,0.55);max-width:500px;line-height:1.8;">${d.description}</p>
      </section>
      <div class="contact-grid">
        <div>
          <div class="info-item"><div class="info-icon">📍</div><div><h4 style="font-weight:700;margin-bottom:6px;">Address</h4><p style="color:rgba(255,255,255,0.55);line-height:1.6;font-size:0.9rem;">${d.address.replace(/\n/g,'<br>')}</p></div></div>
          <div class="info-item"><div class="info-icon">📞</div><div><h4 style="font-weight:700;margin-bottom:6px;">Phone</h4><p style="color:rgba(255,255,255,0.55);font-size:0.9rem;">${d.phone}</p></div></div>
          <div class="info-item"><div class="info-icon">✉️</div><div><h4 style="font-weight:700;margin-bottom:6px;">Email</h4><p style="color:rgba(255,255,255,0.55);font-size:0.9rem;">${d.email}</p></div></div>
          ${d.workingHours ? `<div class="info-item"><div class="info-icon">🕐</div><div><h4 style="font-weight:700;margin-bottom:6px;">Working Hours</h4><p style="color:rgba(255,255,255,0.55);line-height:1.6;font-size:0.9rem;">${d.workingHours.replace(/\n/g,'<br>')}</p></div></div>` : ''}
        </div>
        <div class="form-card">
          <h3 style="font-size:1.4rem;font-weight:800;margin-bottom:28px;">Send a Message</h3>
          <div class="form-group"><label>Your Name</label><input type="text" placeholder="John Doe"></div>
          <div class="form-group"><label>Email Address</label><input type="email" placeholder="john@example.com"></div>
          <div class="form-group"><label>Subject</label><input type="text" placeholder="How can we help?"></div>
          <div class="form-group"><label>Message</label><textarea placeholder="Tell us more..."></textarea></div>
          <button class="form-submit">Send Message →</button>
        </div>
      </div>
      <footer style="padding:32px 60px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;">© ${new Date().getFullYear()} All rights reserved.</footer>
    </body></html>`;
  }

  private genFaq(): string {
    const d = this.faqData;
    const faqsHtml = d.faqs.map((f, i) => `
      <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:28px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="font-size:1rem;font-weight:700;">${f.question}</h3>
          <span style="color:#f5c518;font-size:1.2rem;font-weight:900;">+</span>
        </div>
        <p style="color:rgba(255,255,255,0.55);margin-top:16px;line-height:1.7;font-size:0.9rem;">${f.answer}</p>
      </div>`).join('');

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${d.pageTitle}</title>${this.baseStyles}</head><body>
      <nav class="nav">
        <div class="nav-logo">★</div>
        <div class="nav-links"><a href="#">Our Pages ▾</a><a href="#">Trade ▾</a><a href="#">Contact</a></div>
        <div class="nav-actions"><a class="btn-login" href="#">Login</a><a class="btn-signup" href="#">Sign up</a></div>
      </nav>
      <section style="padding:100px 60px 60px;text-align:center;">
        <p class="section-label">FAQ</p>
        <h1 style="font-size:3rem;font-weight:900;margin-bottom:16px;">${d.pageTitle}</h1>
        <p style="color:rgba(255,255,255,0.55);font-size:1.05rem;">${d.subtitle}</p>
      </section>
      <section style="padding:0 60px 100px;max-width:900px;margin:0 auto;">${faqsHtml}</section>
      <footer style="padding:32px 60px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;color:rgba(255,255,255,0.3);font-size:0.85rem;">© ${new Date().getFullYear()} All rights reserved.</footer>
    </body></html>`;
  }
}
