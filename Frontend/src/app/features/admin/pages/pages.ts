import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
// Trigger Angular build refresh
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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

interface MenuListItem {
  menu: MenuItem;
  page: PageContent | null;
  hasContent: boolean;
  status: string; // 'Published' | 'Draft' | 'Not Added'
  sortOrder: number;
}

export interface BlockConfig {
  id: string;
  type: 'hero-banner' | 'solutions-grid' | 'features-row' | 'cta-banner' | 'rich-text';
  data: any;
}

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
export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'image' | 'email';
  placeholder: string;
  fullWidth?: boolean;
}

export const MENU_FIELD_CONFIG: Record<string, FieldConfig[]> = {
  home: [
    { key: 'homeHeroTitle', label: 'Hero Main Title', type: 'text', placeholder: 'e.g. DELIVERED WITH PRECISION' },
    { key: 'homeHeroSubtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Hero subtext...', fullWidth: true },
    { key: 'homeBackgroundImage', label: 'Hero Background Image', type: 'image', placeholder: 'https://...', fullWidth: true },
    { key: 'homeCtaText', label: 'Hero CTA Button Text', type: 'text', placeholder: 'e.g. Our Mission' },
    { key: 'solutionsTitle', label: 'Solutions Section Title', type: 'text', placeholder: 'e.g. OUR SOLUTIONS', fullWidth: true },
    { key: 'solution1Title', label: 'Solution 1 Title', type: 'text', placeholder: 'Title' },
    { key: 'solution1Image', label: 'Solution 1 Image', type: 'image', placeholder: 'https://...' },
    { key: 'solution2Title', label: 'Solution 2 Title', type: 'text', placeholder: 'Title' },
    { key: 'solution2Image', label: 'Solution 2 Image', type: 'image', placeholder: 'https://...' },
    { key: 'solution3Title', label: 'Solution 3 Title', type: 'text', placeholder: 'Title' },
    { key: 'solution3Image', label: 'Solution 3 Image', type: 'image', placeholder: 'https://...' },
    { key: 'solution4Title', label: 'Solution 4 Title', type: 'text', placeholder: 'Title' },
    { key: 'solution4Image', label: 'Solution 4 Image', type: 'image', placeholder: 'https://...' },
    { key: 'featuresTitle', label: 'Features Section Title', type: 'text', placeholder: 'e.g. WORKING WITH US', fullWidth: true },
    { key: 'featuresSubtitle', label: 'Features Subtitle', type: 'textarea', placeholder: 'Subtitle...', fullWidth: true },
    { key: 'feature1Icon', label: 'Feature 1 Icon (Emoji)', type: 'text', placeholder: 'e.g. ⏱' },
    { key: 'feature1Desc', label: 'Feature 1 Description', type: 'textarea', placeholder: 'Description' },
    { key: 'feature2Icon', label: 'Feature 2 Icon (Emoji)', type: 'text', placeholder: 'e.g. 🔧' },
    { key: 'feature2Desc', label: 'Feature 2 Description', type: 'textarea', placeholder: 'Description' },
    { key: 'feature3Icon', label: 'Feature 3 Icon (Emoji)', type: 'text', placeholder: 'e.g. ⚙️' },
    { key: 'feature3Desc', label: 'Feature 3 Description', type: 'textarea', placeholder: 'Description' },
    { key: 'ctaBannerTitle', label: 'CTA Banner Title', type: 'text', placeholder: 'Title', fullWidth: true },
    { key: 'ctaBannerButtonText', label: 'CTA Banner Button Text', type: 'text', placeholder: 'Button text' },
  ],
  about: [
    { key: 'aboutTitle', label: 'Page Main Heading', type: 'text', placeholder: 'e.g. About Ayaan Corp' },
    { key: 'aboutImage', label: 'Featured Image URL', type: 'text', placeholder: 'https://...' },
    { key: 'aboutSubtitle', label: 'Mission / Header Tagline', type: 'text', placeholder: 'e.g. We are on a mission...', fullWidth: true },
    { key: 'aboutStory1', label: 'Story Paragraph 1', type: 'textarea', placeholder: '...' },
    { key: 'aboutStory2', label: 'Story Paragraph 2', type: 'textarea', placeholder: '...' },
    { key: 'aboutPoint1', label: 'Key Highlight 1', type: 'text', placeholder: 'Bullet 1' },
    { key: 'aboutPoint2', label: 'Key Highlight 2', type: 'text', placeholder: 'Bullet 2' },
    { key: 'aboutPoint3', label: 'Key Highlight 3', type: 'text', placeholder: 'Bullet 3' },
  ],
  services: [
    { key: 'servicesTitle', label: 'Services Page Heading', type: 'text', placeholder: 'e.g. Our Services' },
    { key: 'servicesSubtitle', label: 'Services Subtitle', type: 'text', placeholder: 'Subtitle...' },
    { key: 'service1Title', label: 'Service 1 Title', type: 'text', placeholder: 'Title' },
    { key: 'service1Desc', label: 'Service 1 Description', type: 'textarea', placeholder: 'Description' },
    { key: 'service2Title', label: 'Service 2 Title', type: 'text', placeholder: 'Title' },
    { key: 'service2Desc', label: 'Service 2 Description', type: 'textarea', placeholder: 'Description' },
    { key: 'service3Title', label: 'Service 3 Title', type: 'text', placeholder: 'Title' },
    { key: 'service3Desc', label: 'Service 3 Description', type: 'textarea', placeholder: 'Description' },
  ],
  contact: [
    { key: 'contactTitle', label: 'Page Title', type: 'text', placeholder: 'e.g. Get in Touch' },
    { key: 'contactSubtitle', label: 'Page Subtitle', type: 'text', placeholder: 'Subtext...' },
    { key: 'email', label: 'Contact Email', type: 'email', placeholder: 'hello@ayaan.com' },
    { key: 'phone', label: 'Contact Phone', type: 'text', placeholder: '+1 (555) 123-4567' },
    { key: 'address', label: 'Office Address', type: 'text', placeholder: 'Address...', fullWidth: true },
  ],
  generic: [
    { key: 'tagline', label: 'Tagline / Headline', type: 'text', placeholder: 'e.g. Building Next-Gen Platform Solutions', fullWidth: true },
    { key: 'description', label: 'Page Subtitle / Description', type: 'textarea', placeholder: 'Describe your page content or offerings...', fullWidth: true },
  ]
};

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
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
  orgPages: PageContent[] = [];
  menuListItems: MenuListItem[] = [];
  dragIndex: number | null = null;
  
  templates: SiteTemplate[] = SITE_TEMPLATES;
  selectedTemplateId: string = 'blank';
  
  //formData: any = { title: '', status: 'Draft' };

  get currentFields(): FieldConfig[] {
    return MENU_FIELD_CONFIG[this.getSelectedMenuType()] || [];
  }
  formData: any = { title: '', status: 'Draft', sortOrder: 1 };
  
  // Clean Input Fields for Content Customization
  // Clean Input Fields for Content Customization
  clientData: any = {
    companyName: 'Ayaan Corp',
    tagline: 'Building Next-Gen Platform Solutions',
    description: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
    email: 'hello@ayaan.com',
    phone: '+1 (555) 123-4567',
    address: '123 Innovation Way, Tech City',

    // Home (Accurus Style)
    homeHeroTitle: 'DELIVERED WITH PRECISION, BUILT FOR FLIGHT',
    homeHeroSubtitle: 'A leading global technology partner providing complex integrated products and services for the commercial aircraft, defense and space industries.',
    homeBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    homeCtaText: 'Our Mission',
    solutionsTitle: 'OUR SOLUTIONS',
    solution1Title: 'Machining',
    solution1Image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=400',
    solution2Title: 'Sheet Metal Fabrication',
    solution2Image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ede4c21?q=80&w=400',
    solution3Title: 'Kits and Assemblies',
    solution3Image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400',
    solution4Title: 'Processing',
    solution4Image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=400',
    featuresTitle: 'WORKING WITH US',
    featuresSubtitle: 'We deliver high quality products to our customers on time and our strategy is designed to meet our customers needs.',
    feature1Icon: '⏱',
    feature1Desc: 'Ability to provide a quote in days, and produce a part in weeks, depending on raw material availability.',
    feature2Icon: '🔧',
    feature2Desc: 'Prototyping and engineering support to ensure producibility and optimize design for manufacturing.',
    feature3Icon: '⚙️',
    feature3Desc: 'Uniquely facilitized to scale from one-off production to high volume production based on automated cellular machining.',
    ctaBannerTitle: 'READY TO GET STARTED?',
    ctaBannerButtonText: 'Contact Us',

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
  isInitializing = true;
  isLoadingPages = false;
  isOrgDropdownOpen = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  toastTitle: string = 'Saved Successfully!';
  showLiveSiteLink: boolean = true;
  blockToDeleteIndex: number | null = null;

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
    if (this.role === 'Admin') {
      this.orgService.getOrganizations().pipe(catchError(() => of([]))).subscribe(orgs => {
        this.organizations = (orgs || []).filter((o: any) => o.isActive);
        this.isInitializing = false;
        this.cdr.detectChanges();

        this.route.queryParams.subscribe(params => {
          if (params['orgId'] && params['orgId'] !== this.selectedOrgId) {
            this.selectedOrgId = params['orgId'];
            this.onSelectionChange();
          } else if (!this.selectedOrgId && this.organizations.length > 0) {
            // Default to first org if none selected
            this.selectedOrgId = this.organizations[0].id;
            this.onSelectionChange();
          }
        });
      });
    } else {
      this.selectedOrgId = this.clientOrgId;
      this.isInitializing = false;
      this.cdr.detectChanges();
      this.onSelectionChange();
    }
  }

  processMenus(data: any) {
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
    this.selectedMenuId = null; // Always reset selected menu when org changes
    this.pageContent = null;
    this.isOrgDropdownOpen = false;
    
    if (this.selectedOrgId) {
      this.loadOrgPages();
    } else {
      this.orgPages = [];
      this.menuListItems = [];
      this.cdr.detectChanges();
    }
  }

  getSelectedOrgName(): string {
    if (!this.selectedOrgId || !this.organizations) return '';
    const org = this.organizations.find(o => o.id === this.selectedOrgId);
    return org ? org.name : '';
  }

  selectOrg(id: string | null) {
    this.selectedOrgId = id;
    this.onSelectionChange();
  }

  loadOrgPages() {
    if (!this.selectedOrgId) return;
    this.isLoadingPages = true;
    
    forkJoin({
      menus: this.menuService.getMenus(this.selectedOrgId).pipe(catchError(() => of([]))),
      pages: this.pageService.getPagesForOrg(this.selectedOrgId).pipe(catchError(() => of([])))
    }).subscribe({
      next: (results) => {
        this.processMenus(results.menus);
        this.orgPages = results.pages || [];
        this.buildMenuList();
        this.isLoadingPages = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.orgPages = [];
        this.buildMenuList();
        this.isLoadingPages = false;
        this.cdr.detectChanges();
      }
    });
  }

  buildMenuList() {
    if (!this.menus || this.menus.length === 0) {
      this.menuListItems = [];
      return;
    }

    const items: MenuListItem[] = this.menus.map(menu => {
      const menuTitle = (menu.title || menu.page || '').toLowerCase();
      const page = this.orgPages.find(p => {
        if (!p) return false;
        // 1. Direct menuItemId match (case-insensitive)
        if (p.menuItemId && menu.id && p.menuItemId.toLowerCase() === menu.id.toLowerCase()) {
          return true;
        }
        // 2. Fallback match by page title / template keyword
        const pTitle = (p.title || '').toLowerCase();
        const pTemplate = (p.templateId || '').toLowerCase();
        if (menuTitle.includes('home') && (pTitle.includes('home') || pTemplate.includes('home'))) return true;
        if (menuTitle.includes('about') && (pTitle.includes('about') || pTemplate.includes('about'))) return true;
        if (menuTitle.includes('service') && (pTitle.includes('service') || pTemplate.includes('service'))) return true;
        if (menuTitle.includes('contact') && (pTitle.includes('contact') || pTemplate.includes('contact'))) return true;
        return false;
      }) || null;

      const hasContent = !!page;
      let status = 'Not Added';
      if (page) {
        status = page.status === 'Published' ? 'Published' : 'Draft';
      }
      
      const sortOrder = (page && page.sortOrder && page.sortOrder > 0) 
        ? page.sortOrder 
        : (menu.sortOrder || 1);

      return {
        menu,
        page,
        hasContent,
        status,
        sortOrder
      };
    });

    // Sort items: Items with content first (sorted by their page sortOrder), then items without content (sorted by menu sortOrder)
    this.menuListItems = items.sort((a, b) => {
      if (a.hasContent && b.hasContent) {
        return a.sortOrder - b.sortOrder;
      }
      if (a.hasContent && !b.hasContent) return -1;
      if (!a.hasContent && b.hasContent) return 1;
      return a.sortOrder - b.sortOrder;
    });
  }

  // --- Drag and Drop Sort Logic ---
  onDragStart(index: number) {
    this.dragIndex = index;
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
  }

  onDrop(dropIndex: number) {
    if (this.dragIndex === null || this.dragIndex === dropIndex) {
      this.dragIndex = null;
      return;
    }

    const draggedItem = this.menuListItems[this.dragIndex];
    
    // Remove item from old position
    this.menuListItems.splice(this.dragIndex, 1);
    // Insert item at new position
    this.menuListItems.splice(dropIndex, 0, draggedItem);

    // Update sortOrder values based on new array indices (1-based)
    let currentOrder = 1;
    let newSortOrderForDragged = 1;

    this.menuListItems.forEach(item => {
      item.sortOrder = currentOrder++;
      if (item.page) {
        item.page.sortOrder = item.sortOrder;
      }
      if (item === draggedItem) {
        newSortOrderForDragged = item.sortOrder;
      }
    });

    if (draggedItem.page && draggedItem.page.id) {
       this.pageService.updatePage(draggedItem.page.id, { 
         ...draggedItem.page, 
         sortOrder: newSortOrderForDragged 
       }).subscribe({
         error: err => console.error('Failed to update sort order', err)
       });
    }

    this.dragIndex = null;
    this.cdr.detectChanges();
  }

  // --- Edit / Add Actions ---
  editPage(menuId: string) {
    this.selectedMenuId = menuId;
    this.errorMessage = null;
    this.successMessage = null;
    this.loadPageContent();
  }

  addPage(menuId: string) {
    this.selectedMenuId = menuId;
    this.errorMessage = null;
    this.successMessage = null;
    this.pageContent = null;
    const defaultOrder = this.getMenuDefaultSortOrder(menuId);
    this.formData = { title: '', status: 'Draft', sortOrder: defaultOrder, bodyHtml: '' };
    this.resetDefaultDemoData();
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  backToList() {
    this.selectedMenuId = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.loadOrgPages(); // Refresh the list
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
              
              // Migrate old flat Home data to blocks format if not already present
              if (this.getSelectedMenuType() === 'home' && (!this.clientData.blocks || !Array.isArray(this.clientData.blocks))) {
                this.clientData.blocks = this.migrateHomeToBlocks(this.clientData);
              }
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

  migrateHomeToBlocks(data: any): BlockConfig[] {
    const blocks: BlockConfig[] = [];
    
    // 1. Hero
    if (data.homeHeroTitle || data.homeBackgroundImage) {
      blocks.push({
        id: 'hero-' + Date.now(),
        type: 'hero-banner',
        data: {
          title: data.homeHeroTitle || 'DELIVERED WITH PRECISION',
          subtitle: data.homeHeroSubtitle || '',
          bgImage: data.homeBackgroundImage || '',
          ctaText: data.homeCtaText || 'Our Mission',
          ctaLink: '#'
        }
      });
    }

    // 2. Solutions
    if (data.solutionsTitle || data.solution1Title) {
      blocks.push({
        id: 'sol-' + Date.now(),
        type: 'solutions-grid',
        data: {
          sectionTitle: data.solutionsTitle || 'OUR SOLUTIONS',
          cards: [
            { title: data.solution1Title, image: data.solution1Image, link: '#' },
            { title: data.solution2Title, image: data.solution2Image, link: '#' },
            { title: data.solution3Title, image: data.solution3Image, link: '#' },
            { title: data.solution4Title, image: data.solution4Image, link: '#' }
          ].filter(c => c.title || c.image)
        }
      });
    }

    // 3. Features
    if (data.featuresTitle || data.feature1Desc) {
      blocks.push({
        id: 'feat-' + Date.now(),
        type: 'features-row',
        data: {
          sectionTitle: data.featuresTitle || 'WORKING WITH US',
          subtitle: data.featuresSubtitle || '',
          items: [
            { icon: data.feature1Icon, desc: data.feature1Desc },
            { icon: data.feature2Icon, desc: data.feature2Desc },
            { icon: data.feature3Icon, desc: data.feature3Desc }
          ].filter(i => i.icon || i.desc)
        }
      });
    }

    // 4. CTA
    if (data.ctaBannerTitle) {
      blocks.push({
        id: 'cta-' + Date.now(),
        type: 'cta-banner',
        data: {
          title: data.ctaBannerTitle,
          buttonText: data.ctaBannerButtonText || 'Contact Us',
          buttonLink: '#'
        }
      });
    }
    
    return blocks.length > 0 ? blocks : this.getDefaultHomeBlocks();
  }

  getDefaultHomeBlocks(): BlockConfig[] {
    return [
      {
        id: 'blk-' + Math.random().toString(36).substr(2, 9),
        type: 'hero-banner',
        data: {
          title: 'DELIVERED WITH PRECISION, BUILT FOR FLIGHT',
          subtitle: 'A leading global technology partner providing complex integrated products and services.',
          bgImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
          ctaText: 'Our Mission',
          ctaLink: '#'
        }
      },
      {
        id: 'blk-' + Math.random().toString(36).substr(2, 9),
        type: 'solutions-grid',
        data: {
          sectionTitle: 'OUR SOLUTIONS',
          cards: [
            { title: 'Machining', image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=400', link: '#' },
            { title: 'Sheet Metal Fabrication', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ede4c21?q=80&w=400', link: '#' }
          ]
        }
      }
    ];
  }

  // --- Block Builder Actions ---
  dropBlock(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.clientData.blocks, event.previousIndex, event.currentIndex);
    this.updateGeneratedHtml();
  }

  addBlock(type: string) {
    if (!this.clientData.blocks) this.clientData.blocks = [];
    
    let defaultData: any = {};
    if (type === 'hero-banner') {
      defaultData = { title: 'New Hero Banner', subtitle: 'Subtitle text...', bgImage: '', ctaText: 'Click Here', ctaLink: '#' };
    } else if (type === 'solutions-grid') {
      defaultData = { sectionTitle: 'New Solutions Grid', cards: [{ title: 'Card 1', image: '', link: '#' }] };
    } else if (type === 'features-row') {
      defaultData = { sectionTitle: 'New Features', subtitle: 'Subtitle...', items: [{ icon: '⭐', desc: 'Feature 1' }] };
    } else if (type === 'cta-banner') {
      defaultData = { title: 'New CTA', buttonText: 'Contact Us', buttonLink: '#' };
    } else if (type === 'rich-text') {
      defaultData = { content: '<p>New rich text content...</p>' };
    }

    this.clientData.blocks.push({
      id: 'blk-' + Math.random().toString(36).substr(2, 9),
      type: type,
      data: defaultData
    });
    this.updateGeneratedHtml();
  }

  removeBlock(index: number) {
    this.blockToDeleteIndex = index;
  }

  confirmRemoveBlock() {
    if (this.blockToDeleteIndex !== null) {
      this.clientData.blocks.splice(this.blockToDeleteIndex, 1);
      this.updateGeneratedHtml();
      this.blockToDeleteIndex = null;
      this.cdr.detectChanges();
    }
  }

  cancelRemoveBlock() {
    this.blockToDeleteIndex = null;
    this.cdr.detectChanges();
  }

  addBlockItem(blockIndex: number, listType: 'cards' | 'items') {
    const block = this.clientData.blocks[blockIndex];
    if (!block.data[listType]) block.data[listType] = [];
    
    if (listType === 'cards') {
      block.data.cards.push({ title: 'New Card', image: '', link: '#' });
    } else if (listType === 'items') {
      block.data.items.push({ icon: '⭐', desc: 'New Feature' });
    }
    this.updateGeneratedHtml();
  }

  removeBlockItem(blockIndex: number, listType: 'cards' | 'items', itemIndex: number) {
    const block = this.clientData.blocks[blockIndex];
    if (block.data[listType]) {
      block.data[listType].splice(itemIndex, 1);
      this.updateGeneratedHtml();
    }
  }

  uploadBlockImage(event: any, blockIndex: number, listType?: 'cards', itemIndex?: number) {
    const file = event.target.files[0];
    if (file && this.selectedOrgId) {
      this.isUploadingImage = true;
      this.mediaService.uploadMedia(this.selectedOrgId, file).subscribe({
        next: (res: any) => {
          let url = '';
          if (res && res.data && res.data.filePath) {
            url = res.data.filePath;
          } else if (res && res.filePath) {
            url = res.filePath;
          } else if (typeof res === 'string') {
            url = res;
          }

          if (url) {
            const block = this.clientData.blocks[blockIndex];
            if (listType && itemIndex !== undefined) {
              block.data[listType][itemIndex].image = url;
            } else {
              block.data.bgImage = url;
            }
          }
          this.isUploadingImage = false;
          this.updateGeneratedHtml();
          this.cdr.detectChanges();
        },
        error: () => {
          this.isUploadingImage = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  resetDefaultDemoData(): any {
    const demoData: any = {
      companyName: 'Ayaan Corp',
      tagline: 'Building Next-Gen Platform Solutions',
      description: 'Tailored solutions designed to elevate your brand and drive unparalleled growth.',
      email: 'hello@ayaan.com',
      phone: '+1 (555) 123-4567',
      address: '123 Innovation Way, Tech City',

      // Home (Accurus Style)
      homeHeroTitle: 'DELIVERED WITH PRECISION, BUILT FOR FLIGHT',
      homeHeroSubtitle: 'A leading global technology partner providing complex integrated products and services for the commercial aircraft, defense and space industries.',
      homeBackgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      homeCtaText: 'Our Mission',
      solutionsTitle: 'OUR SOLUTIONS',
      solution1Title: 'Machining',
      solution1Image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=400',
      solution2Title: 'Sheet Metal Fabrication',
      solution2Image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ede4c21?q=80&w=400',
      solution3Title: 'Kits and Assemblies',
      solution3Image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=400',
      solution4Title: 'Processing',
      solution4Image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?q=80&w=400',
      featuresTitle: 'WORKING WITH US',
      featuresSubtitle: 'We deliver high quality products to our customers on time and our strategy is designed to meet our customers needs.',
      feature1Icon: '⏱',
      feature1Desc: 'Ability to provide a quote in days, and produce a part in weeks, depending on raw material availability.',
      feature2Icon: '🔧',
      feature2Desc: 'Prototyping and engineering support to ensure producibility and optimize design for manufacturing.',
      feature3Icon: '⚙️',
      feature3Desc: 'Uniquely facilitized to scale from one-off production to high volume production based on automated cellular machining.',
      ctaBannerTitle: 'READY TO GET STARTED?',
      ctaBannerButtonText: 'Contact Us',

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

    demoData.blocks = this.getDefaultHomeBlocks();

    this.clientData = { ...demoData };
    return demoData;
  }

  uploadImage(event: any, fieldKey: string) {
    const file = event.target.files[0];
    const target = event.target;
    
    if (file && this.selectedOrgId) {
      this.isUploadingImage = true;
      this.cdr.detectChanges();
      this.mediaService.uploadMedia(this.selectedOrgId, file).subscribe({
        next: (res: any) => {
          // Since we removed map() from the service, res is the FULL ApiResponse object
          // It should look like: { success: true, statusCode: 200, data: { filePath: ... } }
          
          let url = '';
          if (res && res.data && res.data.filePath) {
            url = res.data.filePath;
          } else if (res && res.filePath) {
            url = res.filePath;
          }

          console.log('Upload response:', res, 'Extracted URL:', url);
          if (url) {
            this.clientData[fieldKey] = url;
            this.updateGeneratedHtml();
            this.toastTitle = 'Image Uploaded!';
            this.successMessage = 'Image uploaded to server. Remember to click "Save & Publish" to update the live site!';
            this.showLiveSiteLink = false;
          } else {
            this.errorMessage = 'Upload succeeded but no URL was extracted.';
          }
          this.isUploadingImage = false;
          target.value = '';
          this.cdr.detectChanges();
          
          if (this.successMessage || this.errorMessage) {
            setTimeout(() => {
              this.successMessage = null;
              this.errorMessage = null;
              this.cdr.detectChanges();
            }, 4000);
          }
        },
        error: (err) => {
          console.error('Image upload failed', err);
          this.errorMessage = 'Image upload failed. Please try again.';
          this.isUploadingImage = false;
          target.value = '';
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.errorMessage = null;
            this.cdr.detectChanges();
          }, 4000);
        }
      });
    }
  }

  updateGeneratedHtml(presetType?: 'home' | 'about' | 'services' | 'contact' | 'wireframe') {
    const type = presetType || this.getSelectedMenuType();
    const company = this.clientData.companyName || 'Ayaan Corp';

    // Helper to resolve relative /uploads/ paths to the backend server
    const resolveImageUrl = (url: string) => url && url.startsWith('/uploads/') ? `https://localhost:7170${url}` : url;

    let html = '';
    switch (type) {
      case 'home': {
        const blocks = this.clientData.blocks || [];
        html = blocks.map((block: any) => {
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
        if (!this.formData.title) this.formData.title = 'Home - ' + company;
        break;
      }
      case 'about': {
        const getVal = (key: string, fallback: string) => this.clientData[key] !== undefined ? this.clientData[key] : fallback;

        const pageTitle = getVal('aboutTitle', 'About ' + company);
        const sub = getVal('aboutSubtitle', 'We are on a mission to transform how the world creates and interacts with digital content.');
        const story1 = getVal('aboutStory1', 'Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.');
        const story2 = getVal('aboutStory2', 'We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.');
        const img = getVal('aboutImage', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop');
        const p1 = getVal('aboutPoint1', 'Innovation-driven approach');
        const p2 = getVal('aboutPoint2', 'Customer-centric design');
        const p3 = getVal('aboutPoint3', 'Commitment to excellence');

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


  private handleCreateOrUpdateError(err: any) {
    this.isCreating = false;
    
    let message = 'Unable to save page. Please check your form details and try again.';
    if (err.status === 404) {
      message = 'This page content has not been initialized in the database yet.';
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

  getOrgName(): string {
    if (!this.selectedOrgId) return '';
    const org = this.organizations.find(o => o.id === this.selectedOrgId);
    return org ? org.name : 'Unknown Organization';
  }

  getSelectedPageSlug(): string {
    if (!this.selectedMenuId || !this.menus) return 'home';
    const menu = this.menus.find(m => m.id === this.selectedMenuId);
    return menu ? (menu.page || 'home') : 'home';
  }

  getViewSiteUrl(): string {
    let slug = this.getOrgSlug();
    if (slug.startsWith('.')) {
      slug = slug.substring(1);
    }
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
      this.toastTitle = 'Saved Successfully!';
      this.showLiveSiteLink = true;
      this.successMessage = this.formData.status === 'Draft' 
        ? 'Draft saved successfully!' 
        : 'Page saved & published to website successfully!';
      
      // Don't reset selectedOrgId, just go back to list
      this.selectedMenuId = null;
      this.pageContent = null;
      this.formData = { title: '', status: 'Draft', sortOrder: 1 };
      
      this.loadOrgPages(); // Refresh the list

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
        error: (err) => {
          // If page already exists, fall back to savePageContent (upsert)
          const errText = err.error?.message || err.message || '';
          if (errText.includes('already exists')) {
            this.pageService.savePageContent(this.selectedOrgId!, this.selectedMenuId!, payload).subscribe({
              next: () => handleSuccess(),
              error: (updateErr) => this.handleCreateOrUpdateError(updateErr)
            });
          } else {
            this.handleCreateOrUpdateError(err);
          }
        }
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
