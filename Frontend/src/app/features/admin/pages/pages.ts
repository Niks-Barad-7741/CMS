import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Trigger Angular build refresh
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageService, PageContent } from '../../../core/services/page.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
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
  
  formData = { title: '', status: 'Draft', bodyHtml: '' };
  
  // Clean Input Fields for Content Customization
  clientData = {
    companyName: 'Ayaan Corp',
    tagline: 'Building Next-Gen Platform Solutions',
    description: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
    email: 'hello@ayaan.com',
    phone: '+1 (555) 123-4567'
  };

  isCreating = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private pageService: PageService,
    private orgService: OrganizationService,
    private menuService: MenuService,
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
      if (data && Array.isArray(data)) {
        this.menus = data.sort((a,b) => a.sortOrder - b.sortOrder);
      } else {
        this.menus = [];
      }
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

  loadPageContent() {
    this.pageService.getPagesForOrg(this.selectedOrgId!).subscribe({
      next: (pages) => {
        const page = pages.find(p => p.menuItemId === this.selectedMenuId);
        if (page) {
          this.pageContent = page;
          this.formData = { title: page.title, status: page.status, bodyHtml: page.bodyHtml };
        } else {
          this.pageContent = null;
          this.formData = { title: '', status: 'Draft', bodyHtml: '' };
          this.updateGeneratedHtml();
        }
        this.cdr.detectChanges();
      }
    });
  }

  updateGeneratedHtml(presetType?: 'home' | 'about' | 'services' | 'contact' | 'wireframe') {
    const type = presetType || this.getSelectedMenuType();
    const company = this.clientData.companyName || 'My Business';
    const tagline = this.clientData.tagline || 'Building Next-Gen Platform Solutions';
    const desc = this.clientData.description || 'Tailored solutions designed to elevate your brand and drive unparalleled growth.';
    const email = this.clientData.email || 'hello@ayaan.com';
    const phone = this.clientData.phone || '+1 (555) 123-4567';

    let html = '';
    switch (type) {
      case 'services':
        html = SERVICES_TEMPLATE
          .replace(/Tailored solutions designed to elevate your brand and drive unparalleled growth\./g, desc);
        if (!this.formData.title) this.formData.title = 'Services';
        break;
      case 'home':
        html = HOME_TEMPLATE
          .replace(/Build Your Digital Empire/g, company)
          .replace(/Empower your business with our cutting-edge dynamic platform\./g, tagline);
        if (!this.formData.title) this.formData.title = 'Home - ' + company;
        break;
      case 'about':
        html = ABOUT_TEMPLATE
          .replace(/About Us/g, 'About ' + company)
          .replace(/We are on a mission to transform how the world creates and interacts with digital content\./g, desc);
        if (!this.formData.title) this.formData.title = 'About ' + company;
        break;
      case 'contact':
        html = CONTACT_TEMPLATE
          .replace(/hello@dynamiccms\.com/g, email)
          .replace(/\+1 \(555\) 123-4567/g, phone);
        if (!this.formData.title) this.formData.title = 'Contact Us';
        break;
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

  openPageEditor() {
    if (this.selectedOrgId && this.pageContent && this.pageContent.id) {
      this.router.navigate(['/admin/page-editor', this.selectedOrgId, this.pageContent.id]);
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
      status: this.formData.status || 'Draft'
    };

    const redirectToPageEditor = (targetPageId?: string) => {
      this.isCreating = false;
      this.cdr.detectChanges();
      if (targetPageId) {
        this.router.navigate(['/admin/page-editor', this.selectedOrgId, targetPageId]);
      } else {
        this.loadPageContent();
      }
    };

    // If page already exists, update it
    if (this.pageContent && this.pageContent.id) {
      this.pageService.updatePage(this.pageContent.id, payload).subscribe({
        next: () => redirectToPageEditor(this.pageContent!.id),
        error: (err) => this.handleCreateOrUpdateError(err)
      });
      return;
    }

    // Create page if it doesn't exist
    this.pageService.createPage(payload).subscribe({
      next: (res) => {
        const pageData = res?.data || res;
        const pageId = pageData?.id || pageData?.data?.id;
        redirectToPageEditor(pageId);
      },
      error: (err) => {
        const errText = err.error?.message || err.message || '';
        if (errText.includes('already exists')) {
          this.pageService.savePageContent(this.selectedOrgId!, this.selectedMenuId!, payload).subscribe({
            next: (res: any) => {
              const pageData = res?.data || res;
              const pageId = pageData?.id || this.pageContent?.id;
              redirectToPageEditor(pageId);
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

  dismissError() {
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  loadWireframe() {
    this.updateGeneratedHtml('wireframe');
  }
}
