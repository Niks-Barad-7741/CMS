import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Trigger Angular build refresh
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageService, PageContent } from '../../../core/services/page.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { MediaService } from '../../../core/services/media.service';
import { AuthService } from '../../../core/services/auth.service';
import { SITE_TEMPLATES, SiteTemplate } from '../../../core/constants/templates';
import { 
  HOME_TEMPLATE, 
  ABOUT_TEMPLATE, 
  SERVICES_TEMPLATE, 
  CONTACT_TEMPLATE 
} from '../../../core/constants/template-data';

const CORPORATE_WIREFRAME_HTML = `
<div class="font-sans text-gray-900 bg-white">
  <header class="flex items-center justify-between px-8 py-4 border-b border-gray-200">
    <div class="w-32 h-8 bg-gray-300 rounded"></div>
    <nav class="hidden md:flex space-x-6">
      <div class="w-16 h-4 bg-gray-200 rounded"></div>
      <div class="w-16 h-4 bg-gray-200 rounded"></div>
      <div class="w-16 h-4 bg-gray-200 rounded"></div>
    </nav>
    <div class="w-24 h-10 bg-gray-800 rounded"></div>
  </header>
  <section class="flex flex-col items-center justify-center px-8 py-24 text-center bg-gray-50">
    <div class="w-3/4 h-12 bg-gray-300 rounded mb-6 max-w-2xl"></div>
    <div class="w-1/2 h-12 bg-gray-300 rounded mb-8 max-w-xl"></div>
  </section>
</div>
`;

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pages.html'
})
export class PagesComponent implements OnInit {
  role: string | null = '';
  clientOrgId: string | null = null;
  
  organizations: Organization[] = [];
  menus: MenuItem[] = [];
  
  selectedOrgId: string | null = null;
  selectedMenuId: string | null = null;
  
  pageContent: PageContent | null = null;
  
  templates: SiteTemplate[] = SITE_TEMPLATES;
  selectedTemplateId: string = 'blank';
  
  formData: any = { title: '', status: 'Draft' };
  
  // Clean Input Fields for Content Customization
  // Clean Input Fields for Content Customization
  clientData: any = {
    companyName: 'Ayaan Corp',
    tagline: 'Building Next-Gen Platform Solutions',
    description: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
    email: 'hello@ayaan.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Way, Tech City',

    // Home
    homeHeroTitle: 'Build Your Digital Empire',
    homeHeroSubtitle: 'Empower your business with our cutting-edge dynamic platform. Create, manage, and scale with speed and beautiful design.',
    homeBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    stat1Value: '500+',
    stat2Value: '100',
    stat3Value: '50+',
    stat4Value: '12+',
    homeCtaText: 'Get Started Now',
    homeSecondaryCtaText: 'Learn More',
    homeFeature1Title: 'Lightning Fast',
    homeFeature1Desc: 'Optimized for speed, our platform ensures your content loads instantly for users worldwide.',
    homeFeature2Title: 'Bank-Grade Security',
    homeFeature2Desc: 'Rest easy knowing your data is protected by state-of-the-art encryption and security protocols.',
    homeFeature3Title: 'Limitless Scaling',
    homeFeature3Desc: 'Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases.',

    // About
    aboutTitle: 'About Ayaan Corp',
    aboutSubtitle: 'We are on a mission to transform how the world creates and interacts with digital content.',
    aboutStory1: 'Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.',
    aboutStory2: 'We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.',
    aboutImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop',
    aboutPoint1: 'Innovation-driven approach',
    aboutPoint2: 'Customer-centric design',
    aboutPoint3: 'Commitment to excellence',

    // Services
    servicesTitle: 'Our Services',
    servicesSubtitle: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
    service1Title: 'Web Development',
    service1Desc: 'Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences.',
    service2Title: 'App Design',
    service2Desc: 'Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI/UX principles.',
    service3Title: 'Digital Marketing',
    service3Desc: 'Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers.',

    // Contact
    contactTitle: 'Get in Touch',
    contactSubtitle: "Have a question or ready to start a project? We'd love to hear from you."
  };

  isCreating = false;
  isUploadingImage = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private pageService: PageService,
    private orgService: OrganizationService,
    private menuService: MenuService,
    private mediaService: MediaService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.role = this.authService.getRole();
    this.clientOrgId = this.authService.getOrganizationId();
  }

  ngOnInit() {
    this.loadMenus();
    if (this.role === 'Admin') {
      this.route.queryParams.subscribe(params => {
        if (params['orgId']) {
          this.selectedOrgId = params['orgId'];
          this.onSelectionChange();
        }
      });
      this.loadOrganizations();
    } else {
      this.selectedOrgId = this.clientOrgId;
    }
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe(data => {
      this.organizations = data;
      this.cdr.detectChanges();
    });
  }

  loadMenus() {
    this.menuService.getMenus().subscribe(data => {
      const fetched = (data && Array.isArray(data)) ? data : [];
      const defaults: MenuItem[] = [
        { id: 'def-1', title: 'Home', page: 'home', isVisible: true, sortOrder: 1 },
        { id: 'def-2', title: 'About Us', page: 'about-us', isVisible: true, sortOrder: 2 },
        { id: 'def-3', title: 'Services', page: 'services', isVisible: true, sortOrder: 3 },
        { id: 'def-4', title: 'Contact Us', page: 'contact-us', isVisible: true, sortOrder: 4 }
      ];

      const merged = [...defaults];
      fetched.forEach(item => {
        const pageSlug = (item.page || '').toLowerCase();
        const idx = merged.findIndex(m => 
          m.page.toLowerCase() === pageSlug || 
          (pageSlug.includes('about') && m.page.includes('about')) ||
          (pageSlug.includes('service') && m.page.includes('service')) ||
          (pageSlug.includes('contact') && m.page.includes('contact')) ||
          (pageSlug.includes('home') && m.page.includes('home'))
        );
        if (idx !== -1) {
          merged[idx] = item;
        } else {
          merged.push(item);
        }
      });

      this.menus = merged.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      this.cdr.detectChanges();
    });
  }

  getSelectedMenuType(): 'home' | 'about' | 'services' | 'contact' | 'generic' {
    if (!this.selectedMenuId || !this.menus) return 'generic';
    const menu = this.menus.find(m => m.id === this.selectedMenuId);
    if (!menu) return 'generic';
    const title = (menu.title || menu.page || '').toLowerCase();
    if (title.includes('home')) return 'home';
    if (title.includes('about')) return 'about';
    if (title.includes('service')) return 'services';
    if (title.includes('contact')) return 'contact';
    return 'generic';
  }

  onSelectionChange() {
    this.errorMessage = null;
    this.successMessage = null;
    if (this.selectedOrgId && this.selectedMenuId) {
      this.loadPageContent();
    } else {
      this.pageContent = null;
      this.cdr.detectChanges();
    }
  }

  getMenuDefaultSortOrder(menuId: string | null): number {
    if (!menuId || !this.menus || this.menus.length === 0) return 1;
    const idx = this.menus.findIndex(m => m.id === menuId);
    return idx !== -1 ? idx + 1 : 1;
  }

  loadPageContent() {
    this.pageService.getPagesForOrg(this.selectedOrgId!).subscribe({
      next: (pages) => {
        const pageList = pages || [];
        const page = pageList.find(p => p.menuItemId === this.selectedMenuId);
        const defaultOrder = this.getMenuDefaultSortOrder(this.selectedMenuId);

        if (page) {
          this.pageContent = page;
          // If page.sortOrder is 0/1 for a non-first page without unique order, use defaultOrder position
          let order = page.sortOrder && page.sortOrder > 0 ? page.sortOrder : defaultOrder;
          
          // Check for collision with another page in this org
          const conflicting = pageList.find(p => p.id !== page.id && p.sortOrder === order);
          if (conflicting) {
            order = defaultOrder;
          }

          this.formData = { title: page.title, status: page.status, sortOrder: order, bodyHtml: page.bodyHtml };
          if (page.contentJson) {
            try {
              const parsed = JSON.parse(page.contentJson);
              this.clientData = { ...this.resetDefaultDemoData(), ...parsed };
            } catch (e) {
              console.error('Error parsing contentJson:', e);
              this.resetDefaultDemoData();
            }
          } else {
            this.resetDefaultDemoData();
          }
          this.updateGeneratedHtml();
        } else {
          this.pageContent = null;
          this.formData = { title: '', status: 'Draft', sortOrder: defaultOrder, bodyHtml: '' };
          this.resetDefaultDemoData();
          this.updateGeneratedHtml();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.pageContent = null;
        const defaultOrder = this.getMenuDefaultSortOrder(this.selectedMenuId);
        this.formData = { title: '', status: 'Draft', sortOrder: defaultOrder, bodyHtml: '' };
        this.resetDefaultDemoData();
        this.updateGeneratedHtml();
        this.cdr.detectChanges();
      }
    });
  }

  resetDefaultDemoData(): any {
    const demoData = {
      companyName: 'Ayaan Corp',
      tagline: 'Building Next-Gen Platform Solutions',
      description: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
      email: 'hello@ayaan.com',
      phone: '+1 (555) 123-4567',
      address: '123 Innovation Way, Tech City',

      // Home
      homeHeroTitle: 'Build Your Digital Empire',
      homeHeroSubtitle: 'Empower your business with our cutting-edge dynamic platform. Create, manage, and scale with speed and beautiful design.',
      homeBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      stat1Value: '500+',
      stat2Value: '100',
      stat3Value: '50+',
      stat4Value: '12+',
      homeCtaText: 'Get Started Now',
      homeSecondaryCtaText: 'Learn More',
      homeFeature1Title: 'Lightning Fast',
      homeFeature1Desc: 'Optimized for speed, our platform ensures your content loads instantly for users worldwide.',
      homeFeature2Title: 'Bank-Grade Security',
      homeFeature2Desc: 'Rest easy knowing your data is protected by state-of-the-art encryption and security protocols.',
      homeFeature3Title: 'Limitless Scaling',
      homeFeature3Desc: 'Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases.',

      // About
      aboutTitle: 'About Ayaan Corp',
      aboutSubtitle: 'We are on a mission to transform how the world creates and interacts with digital content.',
      aboutStory1: 'Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.',
      aboutStory2: 'We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.',
      aboutImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop',
      aboutPoint1: 'Innovation-driven approach',
      aboutPoint2: 'Customer-centric design',
      aboutPoint3: 'Commitment to excellence',

      // Services
      servicesTitle: 'Our Services',
      servicesSubtitle: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
      service1Title: 'Web Development',
      service1Desc: 'Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences.',
      service2Title: 'App Design',
      service2Desc: 'Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI/UX principles.',
      service3Title: 'Digital Marketing',
      service3Desc: 'Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers.',

      // Contact
      contactTitle: 'Get in Touch',
      contactSubtitle: "Have a question or ready to start a project? We'd love to hear from you."
    };

    this.clientData = { ...demoData };
    return demoData;
  }

  uploadBackgroundImage(event: any) {
    const file = event.target.files[0];
    if (file && this.selectedOrgId) {
      this.isUploadingImage = true;
      this.cdr.detectChanges();
      this.mediaService.uploadMedia(this.selectedOrgId, file).subscribe({
        next: (res: any) => {
          const url = res?.data?.url || res?.url;
          if (url) {
            this.clientData.homeBackgroundImage = url;
            this.updateGeneratedHtml();
          }
          this.isUploadingImage = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Image upload failed', err);
          this.isUploadingImage = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  updateGeneratedHtml(presetType?: 'home' | 'about' | 'services' | 'contact' | 'wireframe') {
    const type = presetType || this.getSelectedMenuType();
    const company = this.clientData.companyName || 'Ayaan Corp';

    let html = '';
    switch (type) {
      case 'home': {
        const title = this.clientData.homeHeroTitle || 'Build Your Digital Empire';
        const subtitle = this.clientData.homeHeroSubtitle || 'Empower your business with our cutting-edge dynamic platform.';
        const cta = this.clientData.homeCtaText || 'Get Started Now';
        const secondaryCta = this.clientData.homeSecondaryCtaText || 'Learn More';

        const f1Title = this.clientData.homeFeature1Title || 'Lightning Fast';
        const f1Desc = this.clientData.homeFeature1Desc || 'Optimized for speed, our platform ensures your content loads instantly for users worldwide.';
        const f2Title = this.clientData.homeFeature2Title || 'Bank-Grade Security';
        const f2Desc = this.clientData.homeFeature2Desc || 'Rest easy knowing your data is protected by state-of-the-art encryption and security protocols.';
        const f3Title = this.clientData.homeFeature3Title || 'Limitless Scaling';
        const f3Desc = this.clientData.homeFeature3Desc || 'Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases.';

        html = HOME_TEMPLATE
          .replace(/Build Your Digital <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Empire<\/span>/g, title)
          .replace(/Empower your business with our cutting-edge dynamic platform\. Create, manage, and scale with unparalleled speed and beautiful design\./g, subtitle)
          .replace(/Get Started Now/g, cta)
          .replace(/Learn More/g, secondaryCta)
          .replace(/Lightning Fast/g, f1Title)
          .replace(/Optimized for speed, our platform ensures your content loads instantly for users worldwide\./g, f1Desc)
          .replace(/Bank-Grade Security/g, f2Title)
          .replace(/Rest easy knowing your data is protected by state-of-the-art encryption and security protocols\./g, f2Desc)
          .replace(/Limitless Scaling/g, f3Title)
          .replace(/Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases\./g, f3Desc);

        if (!this.formData.title) this.formData.title = 'Home - ' + company;
        break;
      }
      case 'about': {
        const pageTitle = this.clientData.aboutTitle || ('About ' + company);
        const sub = this.clientData.aboutSubtitle || 'We are on a mission to transform how the world creates and interacts with digital content.';
        const story1 = this.clientData.aboutStory1 || 'Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.';
        const story2 = this.clientData.aboutStory2 || 'We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.';
        const img = this.clientData.aboutImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop';
        const p1 = this.clientData.aboutPoint1 || 'Innovation-driven approach';
        const p2 = this.clientData.aboutPoint2 || 'Customer-centric design';
        const p3 = this.clientData.aboutPoint3 || 'Commitment to excellence';

        html = ABOUT_TEMPLATE
          .replace(/About Us/g, pageTitle)
          .replace(/We are on a mission to transform how the world creates and interacts with digital content\./g, sub)
          .replace(/Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers\./g, story1)
          .replace(/We set out to bridge that gap\. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility\./g, story2)
          .replace(/https:\/\/images\.unsplash\.com\/photo-1522071820081-009f0129c71c\?q=80&w=2850&auto=format&fit=crop/g, img)
          .replace(/Innovation-driven approach/g, p1)
          .replace(/Customer-centric design/g, p2)
          .replace(/Commitment to excellence/g, p3);

        if (!this.formData.title) this.formData.title = 'About ' + company;
        break;
      }
      case 'services': {
        const title = this.clientData.servicesTitle || 'Our Services';
        const sub = this.clientData.servicesSubtitle || 'Tailored solutions designed to elevate your brand and drive unparalleled growth.';
        const s1Title = this.clientData.service1Title || 'Web Development';
        const s1Desc = this.clientData.service1Desc || 'Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences.';
        const s2Title = this.clientData.service2Title || 'App Design';
        const s2Desc = this.clientData.service2Desc || 'Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI/UX principles.';
        const s3Title = this.clientData.service3Title || 'Digital Marketing';
        const s3Desc = this.clientData.service3Desc || 'Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers.';

        html = SERVICES_TEMPLATE
          .replace(/Our Services/g, title)
          .replace(/Tailored solutions designed to elevate your brand and drive unparalleled growth\./g, sub)
          .replace(/Web Development/g, s1Title)
          .replace(/Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences\./g, s1Desc)
          .replace(/App Design/g, s2Title)
          .replace(/Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI\/UX principles\./g, s2Desc)
          .replace(/Digital Marketing/g, s3Title)
          .replace(/Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers\./g, s3Desc);

        if (!this.formData.title) this.formData.title = 'Services';
        break;
      }
      case 'contact': {
        const title = this.clientData.contactTitle || 'Get in Touch';
        const sub = this.clientData.contactSubtitle || "Have a question or ready to start a project? We'd love to hear from you.";
        const phone = this.clientData.phone || '+1 (555) 123-4567';
        const email = this.clientData.email || 'hello@ayaan.com';
        const address = this.clientData.address || '123 Innovation Way, Tech City';

        html = CONTACT_TEMPLATE
          .replace(/Get in Touch/g, title)
          .replace(/Have a question or ready to start a project\? We'd love to hear from you\./g, sub)
          .replace(/\+1 \(555\) 123-4567/g, phone)
          .replace(/hello@dynamiccms\.com/g, email)
          .replace(/123 Innovation Way, Tech City/g, address);

        if (!this.formData.title) this.formData.title = 'Contact Us';
        break;
      }
      case 'wireframe':
        html = CORPORATE_WIREFRAME_HTML;
        if (!this.formData.title) this.formData.title = 'Corporate Page';
        break;
      default:
        html = HOME_TEMPLATE.replace(/Build Your Digital Empire/g, company);
        if (!this.formData.title) this.formData.title = 'New Page';
        break;
    }

    this.formData.bodyHtml = html;
    this.cdr.detectChanges();
  }

  selectTemplate(id: string) {
    this.selectedTemplateId = id;
  }

  openExistingBuilder() {
    if (this.pageContent && this.pageContent.id) {
      this.router.navigate(['/admin/pages/builder', this.pageContent.id]);
    }
  }

  openTemplateBuilder() {
    if (this.selectedOrgId && this.pageContent && this.pageContent.id) {
      this.router.navigate(['/admin/site-builder', this.selectedOrgId, this.pageContent.id]);
    }
  }

  openStaticBuilder() {
    if (this.selectedOrgId && this.pageContent && this.pageContent.id) {
      this.router.navigate(['/admin/static-builder', this.selectedOrgId, this.pageContent.id]);
    }
  }

  openFigmaBuilder() {
    if (this.selectedOrgId && this.pageContent && this.pageContent.id) {
      this.router.navigate(['/admin/figma-builder', this.selectedOrgId, this.pageContent.id]);
    }
  }

  createAndOpenBuilder() {
    if (!this.selectedOrgId || !this.selectedMenuId || !this.formData.title) return;
    
    this.isCreating = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.formData.bodyHtml || this.formData.bodyHtml.trim() === '') {
      const selectedTemplate = this.templates.find(t => t.id === 'blank');
      this.formData.bodyHtml = selectedTemplate ? selectedTemplate.html : '';
    }

    const payload = {
      organizationId: this.selectedOrgId,
      menuItemId: this.selectedMenuId,
      title: (this.formData.title || '').trim(),
      bodyHtml: (this.formData.bodyHtml || '').trim(),
      status: this.formData.status || 'Draft',
      templateId: this.selectedTemplateId || 'blank',
      contentJson: JSON.stringify(this.clientData)
    };

    const redirectToBuilder = (targetPageId?: string) => {
      this.isCreating = false;
      this.cdr.detectChanges();
      if (targetPageId && this.selectedOrgId) {
        this.router.navigate(['/admin/site-builder', this.selectedOrgId, targetPageId]);
      } else {
        this.loadPageContent();
      }
    };

    // If page already exists, update it
    if (this.pageContent && this.pageContent.id) {
      this.pageService.updatePage(this.pageContent.id, payload).subscribe({
        next: () => redirectToBuilder(this.pageContent!.id),
        error: (err) => this.handleCreateOrUpdateError(err)
      });
      return;
    }

    // Create page if it doesn't exist
    this.pageService.createPage(payload).subscribe({
      next: (res) => {
        const pageData = res?.data || res;
        const pageId = pageData?.id || pageData?.data?.id;
        redirectToBuilder(pageId);
      },
      error: (err) => {
        const errText = err.error?.message || err.message || '';
        if (errText.includes('already exists')) {
          this.pageService.savePageContent(this.selectedOrgId!, this.selectedMenuId!, payload).subscribe({
            next: (res: any) => {
              const pageData = res?.data || res;
              const pageId = pageData?.id || this.pageContent?.id;
              redirectToBuilder(pageId);
            },
            error: (updateErr) => this.handleCreateOrUpdateError(updateErr)
          });
        } else {
          this.handleCreateOrUpdateError(err);
        }
      }
    });
  }

  private handleCreateOrUpdateError(err: any) {
    this.isCreating = false;
    
    let message = 'Unable to save page. Please check your form details and try again.';
    if (err.status === 404 || (err.message && err.message.includes('Http failure response'))) {
      message = 'This page content has not been initialized in the database yet. Creating a new page entry for you...';
    } else if (err.error?.errors) {
      const msgs = [];
      for (const key in err.error.errors) {
        msgs.push(err.error.errors[key].join(' '));
      }
      message = msgs.join(' ');
    } else if (err.error && err.error.message) {
      message = err.error.message;
    }

    this.errorMessage = message;
    this.cdr.detectChanges();
    console.error('Save Page Error:', err);
  }

  getOrgSlug(): string {
    if (!this.selectedOrgId) return '';
    const org = this.organizations.find(o => o.id === this.selectedOrgId);
    return org ? org.slug : 'site';
  }

  getSelectedPageSlug(): string {
    if (!this.selectedMenuId || !this.menus) return 'home';
    const menu = this.menus.find(m => m.id === this.selectedMenuId);
    return menu ? (menu.page || 'home') : 'home';
  }

  getViewSiteUrl(): string {
    const slug = this.getOrgSlug();
    const page = this.getSelectedPageSlug();
    return `/site/${slug}/${page}`;
  }

  saveAndPublishPage() {
    if (!this.selectedOrgId || !this.selectedMenuId || !this.formData.title) return;

    this.isCreating = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.formData.bodyHtml || this.formData.bodyHtml.trim() === '') {
      this.updateGeneratedHtml();
    }

    const selectedMenu = this.menus.find(m => m.id === this.selectedMenuId);
    const payload = {
      organizationId: this.selectedOrgId,
      menuItemId: this.selectedMenuId,
      title: (this.formData.title || '').trim(),
      status: this.formData.status || 'Draft',
      sortOrder: Number(this.formData.sortOrder || selectedMenu?.sortOrder || 1),
      templateId: this.selectedTemplateId || 'blank',
      contentJson: JSON.stringify(this.clientData)
    };

    const handleSuccess = () => {
      this.isCreating = false;
      this.successMessage = this.formData.status === 'Draft' 
        ? 'Draft saved successfully!' 
        : 'Page saved & published to website successfully!';
      
      // Reset selections to redirect back to initial Page Content view
      if (this.role === 'Admin') {
        this.selectedOrgId = null;
      }
      this.selectedMenuId = null;
      this.pageContent = null;
      this.formData = { title: '', status: 'Draft' };

      this.cdr.detectChanges();
      
      // Auto-dismiss popup after 4 seconds
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 4000);
    };

    if (this.pageContent && this.pageContent.id) {
      this.pageService.updatePage(this.pageContent.id, payload).subscribe({
        next: () => handleSuccess(),
        error: (err) => this.handleCreateOrUpdateError(err)
      });
    } else {
      this.pageService.createPage(payload).subscribe({
        next: () => handleSuccess(),
        error: (err) => this.handleCreateOrUpdateError(err)
      });
    }
  }

  dismissSuccess() {
    this.successMessage = null;
    this.cdr.detectChanges();
  }

  dismissError() {
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  loadWireframe() {
    this.updateGeneratedHtml('wireframe');
  }
}
