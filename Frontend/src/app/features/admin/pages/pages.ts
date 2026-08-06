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
import { MenuService, MenuItem, SubMenuItem } from '../../../core/services/menu.service';
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
  menu: MenuItem | SubMenuItem;
  isSubMenu?: boolean;
  page: PageContent | null;
  hasContent: boolean;
  status: string; // 'Published' | 'Draft' | 'Not Added'
  sortOrder: number;
}

interface MenuNode {
  item: MenuListItem;
  subItems: MenuListItem[];
}

export interface BlockConfig {
  id: string;
  type: string;
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
  filterMenuId: string | null = null;
  filterSubMenuId: string | null = null;
  pageContent: PageContent | null = null;
  orgPages: PageContent[] = [];
  menuListItems: MenuListItem[] = [];
  menuNodes: MenuNode[] = [];
  dragIndex: number = -1;
  
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
          } else if (!this.selectedOrgId) {
            // Keep selectedOrgId null to show the placeholder
            this.selectedOrgId = null;
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
    this.menus = fetched.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
    this.filterMenuId = null;
    this.filterSubMenuId = null;
    this.pageContent = null;
    this.isOrgDropdownOpen = false;
    
    if (this.selectedOrgId) {
      this.loadOrgPages();
    } else {
      this.orgPages = [];
      this.menuNodes = [];
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

    const items: MenuListItem[] = [];

    const mainMenus = [...this.menus].sort((a, b) => {
      const aOrder = a.sortOrder || 1;
      const bOrder = b.sortOrder || 1;
      return aOrder - bOrder;
    });

    mainMenus.forEach(menu => {
      const menuTitle = (menu.title || menu.page || '').toLowerCase();
      const page = this.orgPages.find(p => {
        if (!p) return false;
        if (p.menuItemId && menu.id && p.menuItemId.toLowerCase() === menu.id.toLowerCase()) return true;
        
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
      
      const sortOrder = menu.sortOrder || 1;

      items.push({
        menu,
        isSubMenu: false,
        page,
        hasContent,
        status,
        sortOrder
      });

      if (menu.subMenuItems && menu.subMenuItems.length > 0) {
        const subMenus = [...menu.subMenuItems].sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
        subMenus.forEach(subMenu => {
          const subPage = this.orgPages.find(p => {
             if (!p) return false;
             return p.subMenuItemId && subMenu.id && p.subMenuItemId.toLowerCase() === subMenu.id.toLowerCase();
          }) || null;

          const subHasContent = !!subPage;
          let subStatus = 'Not Added';
          if (subPage) {
            subStatus = subPage.status === 'Published' ? 'Published' : 'Draft';
          }
          
          const subSortOrder = subMenu.sortOrder || 1;

          items.push({
            menu: subMenu,
            isSubMenu: true,
            page: subPage,
            hasContent: subHasContent,
            status: subStatus,
            sortOrder: subSortOrder
          });
        });
      }
    });

    this.menuListItems = items;
    this.buildMenuNodes();
  }

  buildMenuNodes() {
    this.menuNodes = [];
    if (!this.menus || this.menus.length === 0) {
      return;
    }
    
    const mainItems = this.menuListItems.filter(item => !item.isSubMenu);
    
    let mainActiveCounter = 1;
    for (const main of mainItems) {
      if (main.hasContent) {
        main.sortOrder = mainActiveCounter++;
      } else {
        main.sortOrder = 0;
      }

      const subItems = this.menuListItems.filter(item => 
        item.isSubMenu && 
        (main.menu as any).subMenuItems?.find((s: any) => s.id === item.menu.id)
      );
      
      let subActiveCounter = 1;
      subItems.forEach(sub => {
        if (sub.hasContent) {
          sub.sortOrder = subActiveCounter++;
        } else {
          sub.sortOrder = 0;
        }
      });

      this.menuNodes.push({
        item: main,
        subItems: subItems
      });
    }
  }

  get availableSubMenus(): SubMenuItem[] {
    if (!this.filterMenuId) return [];
    const menu = this.menus.find(m => m.id === this.filterMenuId);
    return menu?.subMenuItems || [];
  }

  onFilterMenuChange() {
    this.filterSubMenuId = null;
  }

  get filteredMenuNodes(): MenuNode[] {
    if (!this.menuNodes) return [];
    
    if (this.filterMenuId) {
      const filtered = this.menuNodes.filter(node => node.item.menu.id === this.filterMenuId);
      if (this.filterSubMenuId) {
        return filtered.map(node => ({
          ...node,
          subItems: node.subItems.filter(sub => sub.menu.id === this.filterSubMenuId)
        }));
      }
      return filtered;
    }
    return this.menuNodes;
  }

  expandedMenus: { [key: string]: boolean } = {};
  
  toggleMenu(menuId: string, event: Event) {
    event.stopPropagation();
    this.expandedMenus[menuId] = !this.expandedMenus[menuId];
  }

  dropMainMenu(event: CdkDragDrop<any[]>) {
    if (this.filterMenuId) return;
    moveItemInArray(this.menuNodes, event.previousIndex, event.currentIndex);
    
    let order = 1;
    this.menuNodes.forEach(node => {
      node.item.sortOrder = order++;
      if (node.item.menu.id) {
        this.menuService.updateMenu(node.item.menu.id, { ...node.item.menu, sortOrder: node.item.sortOrder }).subscribe();
      }
      if (node.item.page?.id && node.item.hasContent) {
        this.pageService.updatePage(node.item.page.id, { ...node.item.page, sortOrder: node.item.sortOrder }).subscribe();
      }
    });
  }

  dropSubMenu(event: CdkDragDrop<any[]>, node: MenuNode) {
    if (this.filterMenuId) return;
    moveItemInArray(node.subItems, event.previousIndex, event.currentIndex);
    
    let order = 1;
    node.subItems.forEach(sub => {
      sub.sortOrder = order++;
      if (sub.menu.id) {
        this.menuService.updateSubMenu(sub.menu.id, { ...sub.menu as SubMenuItem, sortOrder: sub.sortOrder }).subscribe();
      }
      if (sub.page?.id && sub.hasContent) {
        this.pageService.updatePage(sub.page.id, { ...sub.page, sortOrder: sub.sortOrder }).subscribe();
      }
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
    if (this.dragIndex === -1 || this.dragIndex === dropIndex) {
      this.dragIndex = -1;
      return;
    }

    const draggedItem = this.menuListItems[this.dragIndex];
    // Remove from old position
    this.menuListItems.splice(this.dragIndex, 1);
    // Insert at new position
    this.menuListItems.splice(dropIndex, 0, draggedItem);
    this.dragIndex = -1;

    let currentOrder = 1;
    let newSortOrderForDragged = 1;
    
    this.menuListItems.forEach(item => {
      if (item.hasContent) {
        item.sortOrder = currentOrder++;
        if (item.page) {
          item.page.sortOrder = item.sortOrder;
        }
      } else {
        item.sortOrder = 0; // Do not consume an integer in the sequence for unadded templates
      }
      
      if (item === draggedItem) {
        newSortOrderForDragged = item.sortOrder;
      }
    });

    // Save updated sort order to the backend without any integer gaps!
    if (draggedItem.page && draggedItem.page.id && draggedItem.hasContent) {
      this.pageService.updatePage(draggedItem.page.id, { 
        ...draggedItem.page, 
        sortOrder: newSortOrderForDragged 
      }).subscribe({
        error: err => console.error('Failed to update page sort order', err)
      });
      
      // Also sync Menu Order so the public live website's navigation bar mirrors this sequence
      if (draggedItem.menu && draggedItem.menu.id) {
        if (draggedItem.isSubMenu) {
          this.menuService.updateSubMenu(draggedItem.menu.id, {
            ...draggedItem.menu,
            sortOrder: newSortOrderForDragged
          }).subscribe({
            error: err => console.error('Failed to update submenu sort order', err)
          });
        } else {
          this.menuService.updateMenu(draggedItem.menu.id, {
            ...draggedItem.menu,
            sortOrder: newSortOrderForDragged
          }).subscribe({
            error: err => console.error('Failed to update menu sort order', err)
          });
        }
      }
    }
    
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
    this.clientData = { blocks: [] };
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
    let idx = this.menus.findIndex(m => m.id === menuId);
    if (idx !== -1) return this.menus[idx].sortOrder || 1;
    
    for (const menu of this.menus) {
      if (menu.subMenuItems) {
        idx = menu.subMenuItems.findIndex(s => s.id === menuId);
        if (idx !== -1) return menu.subMenuItems[idx].sortOrder || 1;
      }
    }
    return 1;
  }

  loadPageContent() {
    this.pageService.getPagesForOrg(this.selectedOrgId!).subscribe({
      next: (pages) => {
        const pageList = pages || [];
        const page = pageList.find(p => p.menuItemId === this.selectedMenuId || p.subMenuItemId === this.selectedMenuId);
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
              this.clientData = { blocks: [] };
            }
          } else {
            this.clientData = { blocks: [] };
          }
          this.updateGeneratedHtml();
        } else {
          this.pageContent = null;
          this.formData = { title: '', status: 'Draft', sortOrder: defaultOrder, bodyHtml: '' };
          this.clientData = { blocks: [] };
          this.updateGeneratedHtml();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.pageContent = null;
        const defaultOrder = this.getMenuDefaultSortOrder(this.selectedMenuId);
        this.formData = { title: '', status: 'Draft', sortOrder: defaultOrder, bodyHtml: '' };
        this.clientData = { blocks: [] };
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
        type: 'hero',
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
        type: 'services',
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
        type: 'about',
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
        type: 'cta',
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
    return [];
  }

  // --- Block Builder Actions ---
  dropBlock(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.clientData.blocks, event.previousIndex, event.currentIndex);
    this.updateGeneratedHtml();
  }

  addBlock(type: string) {
    if (!this.clientData.blocks) this.clientData.blocks = [];
    
    let defaultData: any = {};
    switch (type) {
      case 'heading': defaultData = { level: 'h2', align: 'left', size: 'text-3xl', text: 'New Heading', color: '' }; break;
      case 'paragraph': defaultData = { text: 'Type your paragraph here...', align: 'left', size: 'text-base', color: '' }; break;
      case 'gallery': defaultData = { images: [], columns: 3 }; break;
      case 'image': defaultData = { url: '', align: 'center', width: '', height: '', alt: '' }; break;
      case 'hero': defaultData = { title: 'Hero Title', subtitle: 'Hero Subtitle', bgImage: '', ctaText: 'Click Here', ctaLink: '#' }; break;
      case 'cta': defaultData = { text: 'Action Button', link: '#', align: 'center', style: 'primary' }; break;
      case 'divider': defaultData = { size: 'medium' }; break;
      case 'grid': defaultData = { columns: 2, content: [] }; break;
      case 'testimonial': defaultData = { quote: 'This is an amazing product!', author: 'John Doe', title: 'CEO' }; break;
      case 'video': defaultData = { url: '', aspectRatio: '16:9' }; break;
      case 'about': defaultData = { title: 'About Us', subtitle: 'Who we are', story: 'Our company was founded with a mission...', image: '' }; break;
      case 'services': defaultData = { title: 'Our Services', subtitle: 'What we offer', service1Title: 'Web Design', service1Desc: 'Awesome design', service2Title: 'Development', service2Desc: 'Solid code', service3Title: 'Marketing', service3Desc: 'Great reach' }; break;
      case 'contact': defaultData = { title: 'Contact Us', subtitle: 'Get in touch', email: 'hello@company.com', phone: '+1 555 0000', address: '123 Main St' }; break;

    }

    this.clientData.blocks.push({
      id: 'blk-' + Math.random().toString(36).substr(2, 9),
      type: type,
      data: defaultData
    });
  }

  removeBlock(index: number) {
    this.blockToDeleteIndex = index;
  }

  moveBlockUp(index: number) {
    if (index > 0) {
      const block = this.clientData.blocks[index];
      this.clientData.blocks.splice(index, 1);
      this.clientData.blocks.splice(index - 1, 0, block);
    }
  }

  moveBlockDown(index: number) {
    if (index < this.clientData.blocks.length - 1) {
      const block = this.clientData.blocks[index];
      this.clientData.blocks.splice(index, 1);
      this.clientData.blocks.splice(index + 1, 0, block);
    }
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
    const blocks = this.clientData.blocks || [];
    const resolveImageUrl = (url: string) => url && url.startsWith('/uploads/') ? `https://localhost:7170${url}` : url;

    let html = blocks.map((block: any) => {
      switch (block.type) {
        case 'heading': {
          const Tag = block.data.level || 'h2';
          const align = block.data.align || 'left';
          const size = block.data.size || 'text-3xl';
          let style = block.data.color ? `color: ${block.data.color};` : '';
          return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-${align}"><${Tag} class="${size} font-bold" style="${style}">${block.data.text || ''}</${Tag}></div>`;
        }
        case 'paragraph': {
          const align = block.data.align || 'left';
          const size = block.data.size || 'text-base';
          let style = block.data.color ? `color: ${block.data.color};` : '';
          return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-${align}"><p class="${size} text-gray-700 dark:text-gray-300" style="${style}">${block.data.text || ''}</p></div>`;
        }
        case 'hero': {
          const bUrl = resolveImageUrl(block.data.bgImage);
          const bg = bUrl
            ? `style="background-image: url('${bUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"`
            : 'style="background: linear-gradient(135deg, #002855 0%, #0A192F 100%);"';
          return `
            <div class="relative w-full min-h-[70vh] flex items-center justify-center" ${bg}>
              <div class="absolute inset-0 bg-black/50"></div>
              <div class="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-24">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white uppercase tracking-wider mb-6 leading-tight">${block.data.title || ''}</h1>
                <p class="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-10 leading-relaxed font-light">${block.data.subtitle || ''}</p>
                ${block.data.ctaText ? `<a href="${block.data.ctaLink || '#'}" class="inline-block px-10 py-4 bg-white/10 hover:bg-white hover:text-gray-900 text-white font-semibold text-sm uppercase tracking-widest border-2 border-white rounded transition-all duration-300">${block.data.ctaText}</a>` : ''}
              </div>
            </div>
          `;
        }
        case 'image': {
          const url = resolveImageUrl(block.data.url);
          const align = block.data.align || 'center';
          const w = block.data.width || '100%';
          const h = block.data.height || 'auto';
          let flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
          return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex ${flexAlign}">
                    <img src="${url}" alt="${block.data.alt || ''}" style="width: ${w}; height: ${h}; object-fit: cover;" class="rounded-lg shadow-md" />
                  </div>`;
        }
        case 'cta': {
          const align = block.data.align || 'center';
          const style = block.data.style === 'secondary' 
            ? 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg';
          let flexAlign = align === 'left' ? 'justify-start' : (align === 'right' ? 'justify-end' : 'justify-center');
          return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex ${flexAlign}">
                    <a href="${block.data.link || '#'}" class="inline-block px-8 py-4 rounded-xl font-bold transition-all ${style}">${block.data.text || 'Click Here'}</a>
                  </div>`;
        }
        case 'divider': {
          const sizeMap: any = { small: 'my-4', medium: 'my-12', large: 'my-24' };
          const margin = sizeMap[block.data.size] || 'my-12';
          return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><hr class="border-gray-200 dark:border-gray-800 ${margin}"></div>`;
        }
        case 'gallery': {
           return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">[Gallery Placeholder]</div>`;
        }
        case 'grid': {
           return `<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500">[Grid Placeholder]</div>`;
        }
        case 'testimonial': {
           return `
             <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
               <svg class="w-12 h-12 mx-auto text-indigo-200 mb-6" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"></path></svg>
               <p class="text-2xl font-medium text-gray-900 dark:text-gray-100 italic mb-8">"${block.data.quote || ''}"</p>
               <footer class="font-bold text-gray-900 dark:text-white">${block.data.author || ''} <span class="text-gray-500 font-normal ml-2">${block.data.title || ''}</span></footer>
             </div>
           `;
        }
        
        case 'about': {
          const img = resolveImageUrl(block.data.image) || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000';
          return `
            <section class="py-20 bg-white dark:bg-gray-900">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">${block.data.title || 'About Us'}</h2>
                    <h3 class="text-xl text-indigo-600 mb-6 font-medium">${block.data.subtitle || ''}</h3>
                    <p class="text-gray-600 dark:text-gray-300 leading-relaxed">${block.data.story || ''}</p>
                  </div>
                  <div class="rounded-2xl overflow-hidden shadow-xl">
                    <img src="${img}" alt="About Us" class="w-full h-full object-cover aspect-video">
                  </div>
                </div>
              </div>
            </section>
          `;
        }
        case 'services': {
          return `
            <section class="py-20 bg-gray-50 dark:bg-gray-800">
              <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">${block.data.title || 'Our Services'}</h2>
                <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16">${block.data.subtitle || ''}</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${block.data.service1Title || ''}</h3>
                    <p class="text-gray-600 dark:text-gray-400">${block.data.service1Desc || ''}</p>
                  </div>
                  <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${block.data.service2Title || ''}</h3>
                    <p class="text-gray-600 dark:text-gray-400">${block.data.service2Desc || ''}</p>
                  </div>
                  <div class="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">${block.data.service3Title || ''}</h3>
                    <p class="text-gray-600 dark:text-gray-400">${block.data.service3Desc || ''}</p>
                  </div>
                </div>
              </div>
            </section>
          `;
        }
        case 'contact': {
          return `
            <section class="py-20 bg-white dark:bg-gray-900">
              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">${block.data.title || 'Contact Us'}</h2>
                <p class="text-gray-500 dark:text-gray-400 mb-12">${block.data.subtitle || ''}</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mx-auto rounded-full flex items-center justify-center mb-4">📧</div>
                    <h4 class="font-bold text-gray-900 dark:text-white mb-1">Email</h4>
                    <p class="text-gray-500 text-sm">${block.data.email || ''}</p>
                  </div>
                  <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mx-auto rounded-full flex items-center justify-center mb-4">📞</div>
                    <h4 class="font-bold text-gray-900 dark:text-white mb-1">Phone</h4>
                    <p class="text-gray-500 text-sm">${block.data.phone || ''}</p>
                  </div>
                  <div class="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 mx-auto rounded-full flex items-center justify-center mb-4">📍</div>
                    <h4 class="font-bold text-gray-900 dark:text-white mb-1">Address</h4>
                    <p class="text-gray-500 text-sm">${block.data.address || ''}</p>
                  </div>
                </div>
              </div>
            </section>
          `;
        }
case 'video': {
           const url = block.data.url;
           let embedUrl = url;
           if (url && url.includes('youtube.com/watch?v=')) {
              embedUrl = url.replace('watch?v=', 'embed/');
           }
           const aspectClass = block.data.aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-video';
           return `<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                     <div class="w-full ${aspectClass} rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
                       ${embedUrl ? `<iframe src="${embedUrl}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : '<div class="w-full h-full flex items-center justify-center text-gray-400">No Video URL</div>'}
                     </div>
                   </div>`;
        }
        default:
          return '';
      }
    }).join('');
    
    if (!this.formData.title) this.formData.title = 'New Page';
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

  saveAndPublishPage(statusOverride?: string) {
    if (!this.selectedOrgId || !this.selectedMenuId || !this.formData.title) return;

    this.isCreating = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.formData.bodyHtml || this.formData.bodyHtml.trim() === '') {
      this.updateGeneratedHtml();
    }

    let isSubMenu = false;
    let selectedMenu = this.menus.find(m => m.id === this.selectedMenuId);
    let selectedSubMenu = null;
    
    if (!selectedMenu) {
      for (const menu of this.menus) {
        if (menu.subMenuItems) {
          const sub = menu.subMenuItems.find(s => s.id === this.selectedMenuId);
          if (sub) {
            isSubMenu = true;
            selectedSubMenu = sub;
            break;
          }
        }
      }
    }

    const payload: any = {
      organizationId: this.selectedOrgId,
      title: (this.formData.title || '').trim(),
      status: this.formData.status || 'Draft',
      sortOrder: Number(this.formData.sortOrder || (isSubMenu ? selectedSubMenu?.sortOrder : selectedMenu?.sortOrder) || 1),
      templateId: this.selectedTemplateId || 'blank',
      contentJson: JSON.stringify(this.clientData)
    };

    if (isSubMenu) {
      payload.subMenuItemId = this.selectedMenuId;
    } else {
      payload.menuItemId = this.selectedMenuId;
    }

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

    this.pageService.savePageContent(this.selectedOrgId, payload).subscribe({
      next: () => handleSuccess(),
      error: (err) => this.handleCreateOrUpdateError(err)
    });
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
