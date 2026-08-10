import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PageService, PageContent } from '../../../core/services/page.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { MediaService } from '../../../core/services/media.service';
import { AuthService } from '../../../core/services/auth.service';
import { SITE_TEMPLATES, SiteTemplate } from '../../../core/constants/templates';
import { cloneSectionsWithFreshIds } from '../../../core/utils/id-generator.util';
import { CORPORATE_TEMPLATE_SECTIONS } from '../../../core/constants/template-data/corporate-services.data';
import { PORTFOLIO_TEMPLATE_SECTIONS } from '../../../core/constants/template-data/portfolio.data';
import { ECOMMERCE_TEMPLATE_SECTIONS } from '../../../core/constants/template-data/ecommerce.data';
import { BLOG_TEMPLATE_SECTIONS } from '../../../core/constants/template-data/blog.data';

const TEMPLATE_REGISTRY: Record<string, any[]> = {
  blank: [],
  corporate: CORPORATE_TEMPLATE_SECTIONS,
  portfolio: PORTFOLIO_TEMPLATE_SECTIONS,
  ecommerce: ECOMMERCE_TEMPLATE_SECTIONS,
  blog: BLOG_TEMPLATE_SECTIONS,
};

interface MenuListItem {
  menu: MenuItem;
  page: PageContent | null;
  hasContent: boolean;
  status: string; // 'Published' | 'Draft' | 'Not Added'
  sortOrder: number;
  isSubMenu?: boolean;
  expanded?: boolean;
  parentId?: string;
}

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
  orgPages: PageContent[] = [];
  menuListItems: MenuListItem[] = [];
  menuNodes: { item: MenuListItem; subItems: MenuListItem[] }[] = [];
  dragIndex: number | null = null;
  
  templates: SiteTemplate[] = SITE_TEMPLATES;
  selectedTemplateId: string = 'blank';

  formData: any = { title: '', status: 'Draft', sortOrder: 1, bodyHtml: '' };
  clientData: any = { sections: [] };

  isCreating = false;
  isUploadingImage = false;
  isInitializing = true;
  isLoadingPages = false;
  isOrgDropdownOpen = false;
  showTemplatePicker = false;
  showTemplateConfirm = false;
  pendingTemplateId: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  toastTitle: string = 'Saved Successfully!';
  showLiveSiteLink: boolean = false;

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
        this.organizations = orgs;
        this.isInitializing = false;
        this.cdr.detectChanges();

        this.route.queryParams.subscribe(params => {
          if (params['orgId'] && params['orgId'] !== this.selectedOrgId) {
            this.selectedOrgId = params['orgId'];
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
    
    if (fetched.length > 0) {
      // API returned real menus — use them directly, no defaults injection
      this.menus = fetched.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
    } else {
      // No menus from API — show defaults as placeholder guidance
      this.menus = [
        { id: 'def-1', title: 'Home', page: 'home', isVisible: true, sortOrder: 1 },
        { id: 'def-2', title: 'About Us', page: 'about-us', isVisible: true, sortOrder: 2 },
        { id: 'def-3', title: 'Services', page: 'services', isVisible: true, sortOrder: 3 },
        { id: 'def-4', title: 'Contact Us', page: 'contact-us', isVisible: true, sortOrder: 4 }
      ];
    }
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
    this.selectedMenuId = null;
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

    const items: MenuListItem[] = [];

    this.menus.forEach(menu => {
      // Find page content for this top-level menu
      const page = this.orgPages.find(p => {
        if (!p) return false;
        if (p.menuItemId && menu.id && p.menuItemId.toLowerCase() === menu.id.toLowerCase()) {
          return true;
        }
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

      items.push({
        menu,
        page,
        hasContent,
        status,
        sortOrder,
        isSubMenu: false,
        expanded: false
      });

      // Map submenus if present
      if (menu.subMenuItems && Array.isArray(menu.subMenuItems)) {
        menu.subMenuItems.forEach(subMenu => {
          const subPage = this.orgPages.find(p => {
            if (!p) return false;
            if (p.subMenuItemId && subMenu.id && p.subMenuItemId.toLowerCase() === subMenu.id.toLowerCase()) {
              return true;
            }
            return false;
          }) || null;

          const subHasContent = !!subPage;
          let subStatus = 'Not Added';
          if (subPage) {
            subStatus = subPage.status === 'Published' ? 'Published' : 'Draft';
          }

          const subSortOrder = (subPage && subPage.sortOrder && subPage.sortOrder > 0)
            ? subPage.sortOrder
            : (subMenu.sortOrder || 1);

          const wrappedMenu: MenuItem = {
            id: subMenu.id,
            title: subMenu.title,
            page: subMenu.page,
            sortOrder: subMenu.sortOrder,
            isVisible: subMenu.isVisible
          };

          items.push({
            menu: wrappedMenu,
            page: subPage,
            hasContent: subHasContent,
            status: subStatus,
            sortOrder: subSortOrder,
            isSubMenu: true,
            parentId: menu.id
          });
        });
      }
    });

    this.menuListItems = items;
    this.buildMenuNodes();
  }

  toggleMenu(parentId: string) {
    const parent = this.menuListItems.find(i => !i.isSubMenu && i.menu.id === parentId);
    if (parent) {
      const isExpanding = !parent.expanded;
      if (isExpanding) {
        this.menuListItems.forEach(item => {
          if (!item.isSubMenu) {
            item.expanded = false;
          }
        });
      }
      parent.expanded = isExpanding;
    }
  }

  isRowVisible(item: MenuListItem): boolean {
    if (!item.isSubMenu) return true;
    const parent = this.menuListItems.find(i => !i.isSubMenu && i.menu.id === item.parentId);
    return parent ? !!parent.expanded : true;
  }

  hasSubMenus(menuId: string): boolean {
    return this.menuListItems.some(i => i.isSubMenu && i.parentId === menuId);
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
    const dropTarget = this.menuListItems[dropIndex];

    if (draggedItem.isSubMenu) {
      // Submenus can only be dropped on their parent or siblings
      if (dropTarget.parentId !== draggedItem.parentId && dropTarget.menu.id !== draggedItem.parentId) {
        this.dragIndex = null;
        return;
      }
      this.menuListItems.splice(this.dragIndex, 1);
      this.menuListItems.splice(dropIndex, 0, draggedItem);
    } else {
      // Main menus can only be dropped on other main menus
      if (dropTarget.isSubMenu) {
        this.dragIndex = null;
        return;
      }

      // Move the parent AND all its submenus
      const family = this.menuListItems.filter(i => i.menu.id === draggedItem.menu.id || i.parentId === draggedItem.menu.id);
      this.menuListItems = this.menuListItems.filter(i => i.menu.id !== draggedItem.menu.id && i.parentId !== draggedItem.menu.id);
      
      let newDropIndex = this.menuListItems.findIndex(i => i === dropTarget);
      if (newDropIndex === -1) newDropIndex = this.menuListItems.length;
      
      this.menuListItems.splice(newDropIndex, 0, ...family);
    }

    // Recalculate sort orders separately for main menus and submenus
    let mainOrder = 1;
    let subOrders: { [key: string]: number } = {};

    this.menuListItems.forEach(item => {
      if (!item.hasContent) {
        item.sortOrder = 0;
      } else {
        if (!item.isSubMenu) {
          item.sortOrder = mainOrder++;
          subOrders[item.menu.id] = 1;
        } else {
          if (!subOrders[item.parentId!]) subOrders[item.parentId!] = 1;
          item.sortOrder = subOrders[item.parentId!]++;
        }
      }
      if (item.page) {
        item.page.sortOrder = item.sortOrder;
      }
    });

    if (draggedItem.page && draggedItem.page.id) {
       this.pageService.updatePage(draggedItem.page.id, { 
         ...draggedItem.page, 
         sortOrder: draggedItem.sortOrder 
       }).subscribe({
         error: err => console.error('Failed to update sort order', err)
       });
    }

    this.dragIndex = null;
    this.cdr.detectChanges();
  }

  editPage(menuId: string) {
    this.selectedMenuId = menuId;
    this.errorMessage = null;
    this.successMessage = null;
    this.loadPageContent();
  }

  togglePageStatus(item: MenuListItem) {
    if (!item.page || !item.page.id) return;
    
    const newStatus = item.status === 'Published' ? 'Draft' : 'Published';
    
    const payload = {
      title: item.page.title,
      status: newStatus,
      sortOrder: item.page.sortOrder || item.sortOrder,
      templateId: item.page.templateId,
      contentJson: item.page.contentJson
    };
    
    this.pageService.updatePage(item.page.id, payload).subscribe({
      next: () => {
        item.status = newStatus;
        if (item.page) {
          item.page.status = newStatus;
        }
        this.successMessage = `Page "${item.menu.title}" status updated to ${newStatus}`;
        this.loadOrgPages();
        setTimeout(() => this.dismissSuccess(), 3000);
      },
      error: (err) => {
        this.errorMessage = 'Failed to toggle page status';
        console.error(err);
      }
    });
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
    this.loadOrgPages();
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
        
        let subMenuItemId: string | null = null;
        let menuItemId: string | null = null;
        let isSub = false;

        for (const m of this.menus) {
          if (m.subMenuItems) {
            const foundSub = (m.subMenuItems as any[]).find(s => s && s.id === this.selectedMenuId);
            if (foundSub) {
              isSub = true;
              subMenuItemId = foundSub.id;
              break;
            }
          }
        }
        if (!isSub) {
          menuItemId = this.selectedMenuId;
        }

        const page = pageList.find(p => {
          if (subMenuItemId) {
            return p.subMenuItemId && p.subMenuItemId.toLowerCase() === subMenuItemId.toLowerCase();
          } else if (menuItemId) {
            return p.menuItemId && p.menuItemId.toLowerCase() === menuItemId.toLowerCase();
          }
          return false;
        });

        const defaultOrder = this.getMenuDefaultSortOrder(this.selectedMenuId);

        if (page) {
          this.pageContent = page;
          let order = page.sortOrder && page.sortOrder > 0 ? page.sortOrder : defaultOrder;
          
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
    const defaultData = {
      schemaVersion: '1.0',
      globalTheme: {
        primaryColor: '#6366F1',
        fontFamily: 'Inter'
      },
      sections: [
        {
          id: 'sec-' + Date.now(),
          sortOrder: 1,
          style: {
            backgroundType: 'color',
            backgroundColor: '#ffffff',
            backgroundImageUrl: '',
            overlayOpacity: 0,
            backgroundSize: 'cover',
            textColor: '#1f2937',
            paddingY: 'py-16'
          },
          blocks: [
            {
              id: 'blk-' + Date.now() + '-1',
              type: 'heading',
              sortOrder: 1,
              content: { text: this.formData.title || 'Dynamic Heading Title', level: 1, align: 'center' },
              style: { fontSize: 'text-4xl', textColor: '#1f2937' }
            },
            {
              id: 'blk-' + Date.now() + '-2',
              type: 'paragraph',
              sortOrder: 2,
              content: { text: 'Customize your sections and add headers, text paragraphs, or image galleries dynamically.', align: 'center' },
              style: { fontSize: 'text-base', textColor: '#4b5563' }
            }
          ]
        }
      ]
    };

    this.clientData = defaultData;
    return defaultData;
  }

  selectTemplate(templateId: string) {
    if (this.clientData.sections && this.clientData.sections.length > 0) {
      this.pendingTemplateId = templateId;
      this.showTemplateConfirm = true;
      return;
    }
    this.applyTemplate(templateId);
  }

  confirmTemplateApply() {
    if (this.pendingTemplateId) {
      this.applyTemplate(this.pendingTemplateId);
    }
    this.showTemplateConfirm = false;
    this.pendingTemplateId = null;
  }

  cancelTemplateApply() {
    this.showTemplateConfirm = false;
    this.pendingTemplateId = null;
  }

  private applyTemplate(templateId: string) {
    this.selectedTemplateId = templateId;
    const templateData = TEMPLATE_REGISTRY[templateId] ?? TEMPLATE_REGISTRY['blank'];
    this.clientData.schemaVersion = '1.0';
    this.clientData.globalTheme = this.clientData.globalTheme || { primaryColor: '#6366F1', fontFamily: 'Inter' };
    this.clientData.sections = cloneSectionsWithFreshIds(templateData);
    this.showTemplatePicker = false;
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  addSection() {
    if (!this.clientData.sections) {
      this.clientData.sections = [];
    }
    const newSection = {
      id: 'sec-' + Date.now(),
      sortOrder: this.clientData.sections.length + 1,
      style: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        backgroundImageUrl: '',
        overlayOpacity: 0,
        backgroundSize: 'cover',
        textColor: '#1f2937',
        paddingY: 'py-16'
      },
      blocks: []
    };
    this.clientData.sections.push(newSection);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  deleteSection(sectionIndex: number) {
    this.clientData.sections.splice(sectionIndex, 1);
    this.reorderSections();
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveSectionUp(index: number) {
    if (index === 0) return;
    const temp = this.clientData.sections[index];
    this.clientData.sections[index] = this.clientData.sections[index - 1];
    this.clientData.sections[index - 1] = temp;
    this.reorderSections();
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveSectionDown(index: number) {
    if (index === this.clientData.sections.length - 1) return;
    const temp = this.clientData.sections[index];
    this.clientData.sections[index] = this.clientData.sections[index + 1];
    this.clientData.sections[index + 1] = temp;
    this.reorderSections();
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  duplicateSection(sectionIndex: number) {
    if (!this.clientData.sections) return;
    const original = this.clientData.sections[sectionIndex];
    const cloned = JSON.parse(JSON.stringify(original));
    cloned.id = 'sec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    
    this.clientData.sections.splice(sectionIndex + 1, 0, cloned);
    this.reorderSections();
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  applyGradientSwatch(section: any, c1: string, c2: string, angle: number) {
    if (!section.style) section.style = {};
    section.style.gradientColor1 = c1;
    section.style.gradientColor2 = c2;
    section.style.gradientAngle = angle;
    this.updateGeneratedHtml();
  }

  reorderSections() {
    this.clientData.sections.forEach((sec: any, idx: number) => {
      sec.sortOrder = idx + 1;
    });
  }

  addBlock(section: any, type: 'heading' | 'paragraph' | 'gallery' | 'image' | 'hero' | 'button' | 'divider' | 'columns' | 'quote' | 'video') {
    if (!section.blocks) {
      section.blocks = [];
    }
    const newBlock: any = {
      id: 'blk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      type: type,
      sortOrder: section.blocks.length + 1,
      content: {},
      style: {}
    };

    if (type === 'heading') {
      newBlock.content = { text: 'Heading Text', level: 2, align: 'left' };
      newBlock.style = { fontSize: 'text-2xl', textColor: '#1f2937' };
    } else if (type === 'paragraph') {
      newBlock.content = { text: 'Paragraph description block content goes here.', align: 'left' };
      newBlock.style = { fontSize: 'text-base', textColor: '#4b5563' };
    } else if (type === 'gallery') {
      newBlock.content = {
        images: [
          { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300', caption: 'Image Caption' }
        ]
      };
      newBlock.style = { gridCols: 'grid-cols-2' };
    } else if (type === 'image') {
      newBlock.content = {
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
        caption: '',
        alt: 'Featured image',
        title: '',
        linkUrl: '',
        linkNewTab: false,
        lightbox: false,
        animation: 'None',
        customCss: ''
      };
      newBlock.style = {
        displayMode: 'inline',
        objectFit: 'cover',
        aspectRatio: 'auto',
        maxWidth: 'Large',
        borderRadius: 'Medium',
        boxShadow: 'Large',
        filterEffect: 'None',
        alignment: 'center',
        padding: 'None',
        margin: 'None',
        border: 'None',
        backgroundColor: '',
        responsiveBehavior: 'responsive',
        additionalClasses: '',
        hoverEffect: 'Subtle Zoom'
      };
    } else if (type === 'hero') {
      newBlock.content = { 
        bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200', 
        heading: 'Crafting Dynamic Digital Experiences', 
        subtext: 'Build beautiful, customizable page sections and professional websites in seconds.', 
        ctaText: 'Get Started Today', 
        ctaUrl: '#', 
        overlayOpacity: 55 
      };
      newBlock.style = {};
    } else if (type === 'button') {
      newBlock.content = { 
        label: 'Explore Services', 
        url: '#', 
        style: 'primary', 
        align: 'left' 
      };
      newBlock.style = {};
    } else if (type === 'divider') {
      newBlock.content = { 
        height: 40 
      };
      newBlock.style = {};
    } else if (type === 'columns') {
      newBlock.content = {
        columns: [
          { title: 'Responsive Design', text: 'Looks gorgeous on any device, automatically resizing grids and text.', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=150' },
          { title: 'Supercharged Speed', text: 'Optimized for performance and fast loading, keeping your visitors engaged.', imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=150' }
        ]
      };
      newBlock.style = { gridCols: 'grid-cols-2' };
    } else if (type === 'quote') {
      newBlock.content = { 
        text: 'A satisfied customer is the best business strategy of all.', 
        author: 'Michael LeBoeuf', 
        avatarUrl: '' 
      };
      newBlock.style = {};
    } else if (type === 'video') {
      newBlock.content = { 
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' 
      };
      newBlock.style = {};
    }

    section.blocks.push(newBlock);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  deleteBlock(section: any, blockIndex: number) {
    section.blocks.splice(blockIndex, 1);
    this.reorderBlocks(section);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveBlockUp(section: any, index: number) {
    if (index === 0) return;
    const temp = section.blocks[index];
    section.blocks[index] = section.blocks[index - 1];
    section.blocks[index - 1] = temp;
    this.reorderBlocks(section);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveBlockDown(section: any, index: number) {
    if (index === section.blocks.length - 1) return;
    const temp = section.blocks[index];
    section.blocks[index] = section.blocks[index + 1];
    section.blocks[index + 1] = temp;
    this.reorderBlocks(section);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  reorderBlocks(section: any) {
    section.blocks.forEach((blk: any, idx: number) => {
      blk.sortOrder = idx + 1;
    });
  }

  addImageToGallery(block: any) {
    if (!block.content.images) {
      block.content.images = [];
    }
    block.content.images.push({ url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300', caption: 'New Image Caption' });
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  removeImageFromGallery(block: any, imgIdx: number) {
    block.content.images.splice(imgIdx, 1);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  addColumn(block: any) {
    if (!block.content.columns) {
      block.content.columns = [];
    }
    block.content.columns.push({ title: 'New Feature', text: 'Feature description goes here.', imageUrl: '' });
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  removeColumn(block: any, colIdx: number) {
    block.content.columns.splice(colIdx, 1);
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveColumnUp(block: any, colIdx: number) {
    if (colIdx > 0 && block.content.columns) {
      const temp = block.content.columns[colIdx];
      block.content.columns[colIdx] = block.content.columns[colIdx - 1];
      block.content.columns[colIdx - 1] = temp;
      this.updateGeneratedHtml();
      this.cdr.detectChanges();
    }
  }

  moveColumnDown(block: any, colIdx: number) {
    if (block.content.columns && colIdx < block.content.columns.length - 1) {
      const temp = block.content.columns[colIdx];
      block.content.columns[colIdx] = block.content.columns[colIdx + 1];
      block.content.columns[colIdx + 1] = temp;
      this.updateGeneratedHtml();
      this.cdr.detectChanges();
    }
  }

  uploadBackgroundImage(event: any, section: any) {
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
            section.style.backgroundImageUrl = url;
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

  uploadBlockImage(event: any, block: any, listType?: 'columns' | 'images', itemIndex?: number) {
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
            if (listType === 'columns' && itemIndex !== undefined) {
              block.content.columns[itemIndex].imageUrl = url;
            } else if (listType === 'images' && itemIndex !== undefined) {
              block.content.images[itemIndex].url = url;
            } else {
              block.content.url = url;
            }
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

  insertHtmlTag(block: any, tag: string, textareaEl?: HTMLTextAreaElement) {
    if (!block.content) block.content = {};
    if (!block.content.text) block.content.text = '';

    let textToWrap = '';
    let startIdx = block.content.text.length;
    let endIdx = block.content.text.length;

    if (textareaEl) {
      startIdx = textareaEl.selectionStart;
      endIdx = textareaEl.selectionEnd;
      textToWrap = block.content.text.substring(startIdx, endIdx);
    }
    
    let replacement = '';
    if (tag === 'b') {
      replacement = `<b>${textToWrap || 'bold text'}</b>`;
    } else if (tag === 'i') {
      replacement = `<i>${textToWrap || 'italic text'}</i>`;
    } else if (tag === 'a') {
      replacement = `<a href="https://example.com" class="text-indigo-600 underline">${textToWrap || 'link text'}</a>`;
    } else if (tag === 'ul') {
      replacement = `\n<ul>\n  <li>${textToWrap || 'List Item 1'}</li>\n</ul>\n`;
    } else if (tag === 'ol') {
      replacement = `\n<ol>\n  <li>${textToWrap || 'Item 1'}</li>\n</ol>\n`;
    }

    if (textareaEl && textToWrap) {
      block.content.text = block.content.text.substring(0, startIdx) + replacement + block.content.text.substring(endIdx);
    } else {
      // If nothing selected or no textarea, append or insert at cursor
      block.content.text = block.content.text.substring(0, startIdx) + replacement + block.content.text.substring(endIdx);
    }

    this.updateGeneratedHtml();
    this.cdr.detectChanges();

    if (textareaEl) {
      setTimeout(() => {
        textareaEl.focus();
        const newSelectionStart = startIdx + replacement.indexOf('>') + 1;
        textareaEl.setSelectionRange(newSelectionStart, newSelectionStart + (textToWrap || '').length);
      });
    }
  }

  moveGalleryImageUp(block: any, idx: number) {
    if (idx === 0 || !block.content.images) return;
    const temp = block.content.images[idx];
    block.content.images[idx] = block.content.images[idx - 1];
    block.content.images[idx - 1] = temp;
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  moveGalleryImageDown(block: any, idx: number) {
    if (!block.content.images || idx === block.content.images.length - 1) return;
    const temp = block.content.images[idx];
    block.content.images[idx] = block.content.images[idx + 1];
    block.content.images[idx + 1] = temp;
    this.updateGeneratedHtml();
    this.cdr.detectChanges();
  }

  getSectionStyle(section: any) {
    if (!section || !section.style) return {};
    const styles: any = {};
    const resolveImageUrl = (url: string) => url && url.startsWith('/uploads/') ? `https://localhost:7170${url}` : url;
    
    if (section.style.backgroundType === 'color') {
      styles['background-color'] = section.style.backgroundColor || '#ffffff';
      styles['background-image'] = 'none';
    } else if (section.style.backgroundType === 'image' && section.style.backgroundImageUrl) {
      styles['background-image'] = `url('${resolveImageUrl(section.style.backgroundImageUrl)}')`;
      styles['background-position'] = 'center';
      
      if (section.style.backgroundSize === 'contain') {
        styles['background-size'] = 'contain';
        styles['background-repeat'] = 'no-repeat';
      } else if (section.style.backgroundSize === 'repeat') {
        styles['background-size'] = 'auto';
        styles['background-repeat'] = 'repeat';
      } else {
        styles['background-size'] = 'cover';
        styles['background-repeat'] = 'no-repeat';
      }
      styles['min-height'] = '350px';
    } else {
      styles['background-color'] = '#ffffff';
      styles['background-image'] = 'none';
    }
    
    if (section.style.textColor) {
      styles['color'] = section.style.textColor;
    } else if (section.style.backgroundType === 'image') {
      styles['color'] = '#ffffff';
    } else {
      styles['color'] = '#1f2937';
    }
    
    return styles;
  }

  ensureSectionStyles() {
    if (this.clientData && this.clientData.sections && Array.isArray(this.clientData.sections)) {
      this.clientData.sections.forEach((sec: any) => {
        if (!sec.style) {
          sec.style = {
            backgroundType: 'color',
            backgroundColor: '#ffffff',
            backgroundImageUrl: '',
            overlayOpacity: 0,
            backgroundSize: 'cover',
            textColor: '#1f2937',
            paddingY: 'py-16'
          };
        }
        
        // New styles initialization
        if (sec.style.backgroundType === undefined) sec.style.backgroundType = 'color';
        if (sec.style.backgroundColor === undefined) sec.style.backgroundColor = '#ffffff';
        if (sec.style.backgroundImageUrl === undefined) sec.style.backgroundImageUrl = '';
        if (sec.style.overlayOpacity === undefined) sec.style.overlayOpacity = 0;
        if (sec.style.backgroundSize === undefined) sec.style.backgroundSize = 'cover';
        if (sec.style.textColor === undefined) sec.style.textColor = '#1f2937';
        if (sec.style.blockLayout === undefined) sec.style.blockLayout = 'stack';
        if (sec.style.paddingY === undefined) sec.style.paddingY = 'py-16';

        if (sec.style.gradientColor1 === undefined) sec.style.gradientColor1 = '#4f46e5';
        if (sec.style.gradientColor2 === undefined) sec.style.gradientColor2 = '#9333ea';
        if (sec.style.gradientAngle === undefined) sec.style.gradientAngle = 135;
        if (sec.style.overlayColor === undefined) sec.style.overlayColor = '#000000';
        if (sec.style.backgroundAttachment === undefined) sec.style.backgroundAttachment = 'scroll';
        if (sec.style.videoUrl === undefined) sec.style.videoUrl = '';
        if (sec.style.videoMuted === undefined) sec.style.videoMuted = true;
        if (sec.style.videoAutoplay === undefined) sec.style.videoAutoplay = true;
        if (sec.style.paddingTop === undefined) sec.style.paddingTop = 'pt-16';
        if (sec.style.paddingBottom === undefined) sec.style.paddingBottom = 'pb-16';
        if (sec.style.containerWidth === undefined) sec.style.containerWidth = 'boxed';
        if (sec.style.minHeightType === undefined) sec.style.minHeightType = 'auto';
        if (sec.style.minHeightValue === undefined) sec.style.minHeightValue = 500;

        if (!sec.blocks) {
          sec.blocks = [];
        }
        sec.blocks.forEach((blk: any) => {
          if (!blk.content) blk.content = {};
          if (!blk.style) blk.style = {};
          
          if (blk.type === 'hero') {
            if (blk.content.headingTag === undefined) blk.content.headingTag = 'h1';
            if (blk.content.eyebrow === undefined) blk.content.eyebrow = '';
            if (blk.style.headingFontSize === undefined) blk.style.headingFontSize = 'Large';
            if (blk.style.contentMaxWidth === undefined) blk.style.contentMaxWidth = 'Large';
            
            if (blk.content.bgType === undefined) blk.content.bgType = 'image';
            if (blk.content.bgImageUrl === undefined) blk.content.bgImageUrl = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200';
            if (blk.content.mobileBgImageUrl === undefined) blk.content.mobileBgImageUrl = '';
            if (blk.content.bgFocalPoint === undefined) blk.content.bgFocalPoint = 'center';
            if (blk.content.bgColor === undefined) blk.content.bgColor = '#1e1b4b';
            if (blk.content.gradientColor1 === undefined) blk.content.gradientColor1 = '#1e1b4b';
            if (blk.content.gradientColor2 === undefined) blk.content.gradientColor2 = '#312e81';
            if (blk.content.gradientAngle === undefined) blk.content.gradientAngle = 135;
            
            if (blk.content.videoUrl === undefined) blk.content.videoUrl = '';
            if (blk.content.videoMuted === undefined) blk.content.videoMuted = true;
            if (blk.content.videoAutoplay === undefined) blk.content.videoAutoplay = true;
            
            if (blk.content.overlayColor === undefined) blk.content.overlayColor = '#000000';
            if (blk.content.overlayOpacity === undefined) blk.content.overlayOpacity = 55;
            
            if (blk.content.align === undefined) blk.content.align = 'center';
            if (blk.content.valign === undefined) blk.content.valign = 'middle';
            if (blk.style.minHeightType === undefined) blk.style.minHeightType = '50vh';
            if (blk.style.minHeightValue === undefined) blk.style.minHeightValue = 500;
            if (blk.style.textColor === undefined) blk.style.textColor = '';
            
            if (blk.content.ctaText === undefined) blk.content.ctaText = 'Get Started';
            if (blk.content.ctaUrl === undefined) blk.content.ctaUrl = '#';
            if (blk.content.ctaStyle === undefined) blk.content.ctaStyle = 'primary';
            if (blk.content.ctaNewTab === undefined) blk.content.ctaNewTab = false;
            if (blk.content.ctaSize === undefined) blk.content.ctaSize = 'Medium';
            
            if (blk.content.secCtaText === undefined) blk.content.secCtaText = '';
            if (blk.content.secCtaUrl === undefined) blk.content.secCtaUrl = '';
            if (blk.content.secCtaStyle === undefined) blk.content.secCtaStyle = 'outline';
            if (blk.content.secCtaNewTab === undefined) blk.content.secCtaNewTab = false;
            
            if (blk.content.animation === undefined) blk.content.animation = 'None';
            if (blk.content.animationDelay === undefined) blk.content.animationDelay = 0;
            if (blk.style.dividerShape === undefined) blk.style.dividerShape = 'None';
          }
          
          if (blk.type === 'paragraph') {
            if (blk.style.maxWidth === undefined) blk.style.maxWidth = 'Full';
            if (blk.style.lineHeight === undefined) blk.style.lineHeight = 'Normal';
            if (blk.style.columnLayout === undefined) blk.style.columnLayout = '1 Column';
            if (blk.style.highlightBg === undefined) blk.style.highlightBg = '';
            if (blk.content.animation === undefined) blk.content.animation = 'None';
          }
          
          if (blk.type === 'gallery') {
            if (blk.content.images === undefined) blk.content.images = [];
            if (blk.style.colsDesktop === undefined) blk.style.colsDesktop = 'grid-cols-3';
            if (blk.style.colsTablet === undefined) blk.style.colsTablet = 'md:grid-cols-2';
            if (blk.style.colsMobile === undefined) blk.style.colsMobile = 'grid-cols-1';
            if (blk.style.galleryStyle === undefined) blk.style.galleryStyle = 'Grid';
            if (blk.style.imageGap === undefined) blk.style.imageGap = 'Medium';
            if (blk.content.lightbox === undefined) blk.content.lightbox = false;
            if (blk.content.lazyLoad === undefined) blk.content.lazyLoad = true;
          }
          
          if (blk.type === 'image') {
            if (blk.content.linkUrl === undefined) blk.content.linkUrl = '';
            if (blk.content.linkNewTab === undefined) blk.content.linkNewTab = false;
            if (blk.style.borderRadius === undefined) blk.style.borderRadius = 'Medium';
            if (blk.style.boxShadow === undefined) blk.style.boxShadow = false;
            if (blk.style.filterEffect === undefined) blk.style.filterEffect = 'None';
            if (blk.content.lightbox === undefined) blk.content.lightbox = false;
            if (blk.style.maxWidth === undefined) blk.style.maxWidth = 'Full';
            if (blk.content.animation === undefined) blk.content.animation = 'None';
          }
          
          if (blk.type === 'button') {
            if (blk.content.label === undefined) blk.content.label = 'Click Here';
            if (blk.content.url === undefined) blk.content.url = '#';
            if (blk.content.style === undefined) blk.content.style = 'primary';
            if (blk.content.align === undefined) blk.content.align = 'left';
            
            if (blk.content.size === undefined) blk.content.size = 'Medium';
            if (blk.content.icon === undefined) blk.content.icon = 'None';
            if (blk.content.iconPosition === undefined) blk.content.iconPosition = 'None';
            if (blk.content.newTab === undefined) blk.content.newTab = false;
            if (blk.content.buttonType === undefined) blk.content.buttonType = 'Link URL';
            if (blk.content.scrollToSection === undefined) blk.content.scrollToSection = '';
            if (blk.content.triggerPopup === undefined) blk.content.triggerPopup = '';
            if (blk.content.fullWidthMobile === undefined) blk.content.fullWidthMobile = false;
            
            if (blk.content.customBg === undefined) blk.content.customBg = '';
            if (blk.content.customText === undefined) blk.content.customText = '';
            
            if (blk.style.borderRadius === undefined) blk.style.borderRadius = 'Rounded';
            if (blk.style.hoverEffect === undefined) blk.style.hoverEffect = 'None';
            
            if (blk.content.hasSecondButton === undefined) blk.content.hasSecondButton = false;
            if (blk.content.secLabel === undefined) blk.content.secLabel = 'Learn More';
            if (blk.content.secUrl === undefined) blk.content.secUrl = '#';
            if (blk.content.secStyle === undefined) blk.content.secStyle = 'outline';
            if (blk.content.secSize === undefined) blk.content.secSize = 'Medium';
            
            if (blk.content.secIcon === undefined) blk.content.secIcon = 'None';
            if (blk.content.secIconPosition === undefined) blk.content.secIconPosition = 'None';
            if (blk.content.secNewTab === undefined) blk.content.secNewTab = false;
            if (blk.content.secButtonType === undefined) blk.content.secButtonType = 'Link URL';
            if (blk.content.secScrollToSection === undefined) blk.content.secScrollToSection = '';
            if (blk.content.secTriggerPopup === undefined) blk.content.secTriggerPopup = '';
            
            if (blk.content.secCustomBg === undefined) blk.content.secCustomBg = '';
            if (blk.content.secCustomText === undefined) blk.content.secCustomText = '';
            if (blk.style.secBorderRadius === undefined) blk.style.secBorderRadius = 'Rounded';
            if (blk.style.secHoverEffect === undefined) blk.style.secHoverEffect = 'None';
            
            if (blk.content.animation === undefined) blk.content.animation = 'None';
          }

          if (blk.type === 'divider') {
            if (blk.content.height === undefined) blk.content.height = 40;
            if (blk.content.mobileHeight === undefined) blk.content.mobileHeight = 20;
            if (blk.content.dividerStyle === undefined) blk.content.dividerStyle = 'Blank Space';
            if (blk.content.lineStyle === undefined) blk.content.lineStyle = 'Solid';
            if (blk.content.lineColor === undefined) blk.content.lineColor = '#e2e8f0';
            if (blk.content.lineThickness === undefined) blk.content.lineThickness = 2;
            if (blk.content.lineWidth === undefined) blk.content.lineWidth = 'Full';
            if (blk.content.dividerIcon === undefined) blk.content.dividerIcon = 'None';
          }

          if (blk.type === 'columns') {
            if (blk.style.gridCols === undefined) blk.style.gridCols = 'grid-cols-2';
            if (blk.style.widthRatio === undefined) blk.style.widthRatio = 'Equal';
            if (blk.style.colsTablet === undefined) blk.style.colsTablet = 'md:grid-cols-2';
            if (blk.style.colsMobile === undefined) blk.style.colsMobile = 'grid-cols-1';
            if (blk.style.gapSize === undefined) blk.style.gapSize = 'Medium';
            if (blk.style.valign === undefined) blk.style.valign = 'Top';
            if (blk.content.animation === undefined) blk.content.animation = 'None';
            if (blk.content.staggerDelay === undefined) blk.content.staggerDelay = 0;
            
            if (blk.content.columns) {
              blk.content.columns.forEach((col: any) => {
                if (col.icon === undefined) col.icon = 'None';
                if (col.align === undefined) col.align = 'center';
                if (col.bg === undefined) col.bg = '';
                if (col.cardLook === undefined) col.cardLook = false;
                if (col.btnText === undefined) col.btnText = '';
                if (col.btnUrl === undefined) col.btnUrl = '';
              });
            }
          }

          if (blk.type === 'quote') {
            if (blk.content.text === undefined) blk.content.text = '';
            if (blk.content.author === undefined) blk.content.author = '';
            if (blk.content.avatarUrl === undefined) blk.content.avatarUrl = '';
            
            if (blk.content.authorTitle === undefined) blk.content.authorTitle = '';
            if (blk.style.quoteStyle === undefined) blk.style.quoteStyle = 'Simple';
            if (blk.content.showQuoteIcon === undefined) blk.content.showQuoteIcon = true;
            if (blk.content.rating === undefined) blk.content.rating = 'None';
            if (blk.content.align === undefined) blk.content.align = 'center';
            if (blk.content.customBg === undefined) blk.content.customBg = '';
            if (blk.content.avatarPos === undefined) blk.content.avatarPos = 'Left of Name';
            if (blk.style.fontSize === undefined) blk.style.fontSize = 'Large';
            if (blk.content.isItalic === undefined) blk.content.isItalic = true;
            if (blk.content.animation === undefined) blk.content.animation = 'None';
          }

          if (blk.type === 'video') {
            if (blk.content.embedUrl === undefined) blk.content.embedUrl = '';
            if (blk.content.videoSource === undefined) blk.content.videoSource = 'Embed';
            if (blk.content.selfHostedUrl === undefined) blk.content.selfHostedUrl = '';
            if (blk.content.caption === undefined) blk.content.caption = '';
            if (blk.content.autoplay === undefined) blk.content.autoplay = false;
            if (blk.content.loop === undefined) blk.content.loop = false;
            if (blk.content.showControls === undefined) blk.content.showControls = true;
            if (blk.content.aspectRatio === undefined) blk.content.aspectRatio = '16:9';
            if (blk.style.maxWidth === undefined) blk.style.maxWidth = 'Large';
            if (blk.content.posterUrl === undefined) blk.content.posterUrl = '';
            if (blk.content.lightboxMode === undefined) blk.content.lightboxMode = false;
            if (blk.style.borderRadius === undefined) blk.style.borderRadius = 'Medium';
            if (blk.content.animation === undefined) blk.content.animation = 'None';
          }
        });
      });
    }
  }

  updateGeneratedHtml(presetType?: 'home' | 'about' | 'services' | 'contact' | 'wireframe') {
    this.ensureSectionStyles();
    const sections = this.clientData.sections || [];
    const resolveImageUrl = (url: string) => url && url.startsWith('/uploads/') ? `https://localhost:7170${url}` : url;

    let html = sections.map((section: any) => {
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
        const url = section.style.videoUrl;
        // Extract YouTube video ID from any format
        let ytId = '';
        if (url.includes('youtube.com/watch')) {
          const match = url.match(/[?&]v=([^&]+)/);
          if (match) ytId = match[1];
        } else if (url.includes('youtube.com/embed/')) {
          ytId = url.split('embed/')[1].split('?')[0];
        } else if (url.includes('youtu.be/')) {
          ytId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/shorts/')) {
          ytId = url.split('shorts/')[1].split('?')[0];
        }

        if (ytId) {
          const autoParam = section.style.videoAutoplay !== false ? '&autoplay=1' : '&autoplay=0';
          const muteParam = section.style.videoMuted !== false ? '&mute=1' : '&mute=0';
          videoHtml = `
            <iframe class="absolute inset-0 w-full h-full" style="z-index: 0; transform: scale(1.2);"
                    src="https://www.youtube.com/embed/${ytId}?controls=1&showinfo=0&rel=0&loop=1&playlist=${ytId}${autoParam}${muteParam}" 
                    frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
          `;
        } else {
          const autoplay = section.style.videoAutoplay !== false ? 'autoplay' : '';
          const muted = section.style.videoMuted !== false ? 'muted' : '';
          videoHtml = `
            <video ${autoplay} ${muted} loop playsinline controls class="absolute inset-0 w-full h-full object-cover" style="z-index: 0;">
              <source src="${resolveImageUrl(url)}" type="video/mp4">
            </video>
          `;
        }
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
                      <div class="whitespace-pre-wrap ${size} ${lhClass} ${colClass}" style="${style}">${block.content.text || ''}</div>
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
              const url = block.content.videoUrl;
              // Extract YouTube video ID from any format
              let ytId = '';
              if (url.includes('youtube.com/watch')) {
                const match = url.match(/[?&]v=([^&]+)/);
                if (match) ytId = match[1];
              } else if (url.includes('youtube.com/embed/')) {
                ytId = url.split('embed/')[1].split('?')[0];
              } else if (url.includes('youtu.be/')) {
                ytId = url.split('youtu.be/')[1].split('?')[0];
              } else if (url.includes('youtube.com/shorts/')) {
                ytId = url.split('shorts/')[1].split('?')[0];
              }

              if (ytId) {
                const autoParam = block.content.videoAutoplay !== false ? '&autoplay=1' : '&autoplay=0';
                const muteParam = block.content.videoMuted !== false ? '&mute=1' : '&mute=0';
                videoHtml = `
                  <iframe class="" style="position: absolute; top: 50%; left: 50%; width: 100vw; height: 56.25vw; min-height: 100vh; min-width: 177.77vh; transform: translate(-50%, -50%) scale(1.05); z-index: 0;"
                          src="https://www.youtube.com/embed/${ytId}?controls=1&showinfo=0&rel=0&loop=1&playlist=${ytId}${autoParam}${muteParam}" 
                          frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
                `;
              } else {
                const autoplay = block.content.videoAutoplay !== false ? 'autoplay' : '';
                const muted = block.content.videoMuted !== false ? 'muted' : '';
                videoHtml = `
                  <video ${autoplay} ${muted} loop playsinline controls class="absolute inset-0 w-full h-full object-cover z-0">
                    <source src="${resolveImageUrl(url)}" type="video/mp4">
                  </video>
                `;
              }
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
            const displayMode = block.style.displayMode || 'inline';
            const objectFit = block.style.objectFit || 'cover';
            const aspectRatio = block.style.aspectRatio || 'auto';

            // --- Max Width ---
            let widthClass = 'w-full';
            if (block.style.maxWidth === 'Large') widthClass = 'max-w-4xl';
            else if (block.style.maxWidth === 'Medium') widthClass = 'max-w-2xl';
            else if (block.style.maxWidth === 'Small') widthClass = 'max-w-sm';

            // --- Responsive ---
            if (block.style.responsiveBehavior === 'fixed') {
              // No mx-auto to strip anymore, but we can leave this block or just ignore it
            }

            // --- Border Radius ---
            let radiusClass = 'rounded-xl';
            if (block.style.borderRadius === 'None') radiusClass = 'rounded-none';
            else if (block.style.borderRadius === 'Small') radiusClass = 'rounded-md';
            else if (block.style.borderRadius === 'Medium') radiusClass = 'rounded-2xl';
            else if (block.style.borderRadius === 'Full-Round' || block.style.borderRadius === 'Full') radiusClass = 'rounded-full';

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

            // --- Wrapper aspect-ratio style ---
            let wrapperStyle = '';
            if (aspectRatio !== 'auto') {
              wrapperStyle += `aspect-ratio: ${aspectRatio.replace(':', '/')}; `;
            }
            if (block.style.backgroundColor) {
              wrapperStyle += `background-color: ${block.style.backgroundColor}; `;
            }
            wrapperStyle += borderStyle;

            // --- Alignment for outer wrapper ---
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

            // --- Build the img tag ---
            let imgTag = `<img
              src="${url}"
              alt="${block.content.alt || ''}"
              title="${block.content.title || ''}"
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
              
              if (block.style.galleryStyle === 'Overlay Card') {
                return `
                <div class="relative overflow-hidden rounded-2xl shadow-lg group aspect-[4/3] bg-gray-900 ${cursorClass}" ${onclickLightbox}>
                  <img src="${url}" alt="${alt}" ${lazy} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  <div class="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end pointer-events-none">
                    ${img.category ? `<span class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">${img.category}</span>` : ''}
                    ${img.caption ? `<h3 class="text-xl font-bold text-white tracking-tight leading-snug">${img.caption}</h3>` : ''}
                  </div>
                </div>
                `;
              }

              const aspectClass = block.style.imageAspectRatio === '16/9' ? 'aspect-video object-cover' :
                                  block.style.imageAspectRatio === '1/1' ? 'aspect-square object-cover' :
                                  block.style.imageAspectRatio === '4/3' ? 'aspect-[4/3] object-cover' : 'object-cover aspect-square';

              return `
                <div class="overflow-hidden rounded-lg shadow-sm bg-gray-50 relative group ${cursorClass}" ${onclickLightbox}>
                  <img src="${url}" alt="${alt}" ${lazy} class="w-full h-full ${aspectClass} hover:scale-105 transition-transform duration-500" />
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

              const aspectClass = block.style.imageAspectRatio === '16/9' ? 'aspect-video' :
                                  block.style.imageAspectRatio === '1/1' ? 'aspect-square' :
                                  block.style.imageAspectRatio === '4/3' ? 'aspect-[4/3]' : '';

              let mediaHtml = '';
              if (col.mediaType === 'video' && col.videoUrl) {
                const isEmbed = /youtube\.com|youtu\.be|vimeo\.com/.test(col.videoUrl);
                if (isEmbed) {
                  let embedSrc = col.videoUrl;
                  try {
                    const urlObj = new URL(col.videoUrl);
                    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                      let videoId = '';
                      if (urlObj.hostname.includes('youtu.be')) {
                          videoId = urlObj.pathname.slice(1);
                      } else if (urlObj.pathname.includes('/embed/')) {
                          videoId = urlObj.pathname.split('/embed/')[1];
                      } else if (urlObj.pathname.includes('/shorts/')) {
                          videoId = urlObj.pathname.split('/shorts/')[1];
                      } else if (urlObj.searchParams.has('v')) {
                          videoId = urlObj.searchParams.get('v') || '';
                      }
                      if (videoId) embedSrc = `https://www.youtube.com/embed/${videoId}`;
                    } else if (urlObj.hostname.includes('vimeo.com')) {
                      const videoId = urlObj.pathname.split('/').pop();
                      if (videoId) embedSrc = `https://player.vimeo.com/video/${videoId}`;
                    }
                  } catch (e) {}
                  
                  mediaHtml = `<div class="aspect-video w-full overflow-hidden rounded-xl mb-4"><iframe src="${embedSrc}" class="w-full h-full" frameborder="0" allowfullscreen></iframe></div>`;
                } else {
                  const resolvedVidUrl = resolveImageUrl(col.videoUrl);
                  const posterAttr = col.videoPoster ? `poster="${resolveImageUrl(col.videoPoster)}"` : '';
                  mediaHtml = `<video src="${resolvedVidUrl}" ${posterAttr} controls class="w-full ${aspectClass || 'h-auto'} object-cover rounded-xl mb-4"></video>`;
                }
              } else if (col.mediaType !== 'video') {
                const imgUrl = resolveImageUrl(col.imageUrl);
                if (imgUrl) {
                  mediaHtml = `<img src="${imgUrl}" alt="${col.title || 'Image'}" class="w-full ${aspectClass || 'max-h-48'} object-cover rounded-xl mb-4" />`;
                }
              }

              return `<div class="flex flex-col ${alignClass} ${cardClass} ${animClass}" ${styleAttr}>
                        ${iconSvg}
                        ${mediaHtml}
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

            // Max width class (removed mx-auto so alignment can handle it)
            const mwMap: Record<string,string> = { 'Full': 'w-full', 'Large': 'max-w-5xl', 'Medium': 'max-w-3xl', 'Small': 'max-w-xl' };
            const mwClass = mwMap[block.style.maxWidth || 'Large'] || 'max-w-5xl';

            // Alignment class
            const align = block.content.align || 'center';
            const alignClass = align === 'left' ? 'mr-auto' : (align === 'right' ? 'ml-auto' : 'mx-auto');

            // Border radius class
            const brMap: Record<string,string> = { 'None': 'rounded-none', 'Small': 'rounded-lg', 'Medium': 'rounded-2xl', 'Full': 'rounded-full' };
            const brClass = brMap[block.style.borderRadius || 'Medium'] || 'rounded-2xl';

            // Build iframe src with params
            let iframeSrc = '';
            let finalEmbedUrl = embedUrl;
            if (videoSource === 'Embed' && embedUrl) {
              try {
                const urlObj = new URL(embedUrl);
                if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                  let videoId = '';
                  if (urlObj.hostname.includes('youtu.be')) videoId = urlObj.pathname.slice(1);
                  else if (urlObj.pathname.includes('/embed/')) videoId = urlObj.pathname.split('/embed/')[1];
                  else if (urlObj.pathname.includes('/shorts/')) videoId = urlObj.pathname.split('/shorts/')[1];
                  else if (urlObj.searchParams.has('v')) videoId = urlObj.searchParams.get('v') || '';
                  if (videoId) finalEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (urlObj.hostname.includes('vimeo.com')) {
                  const videoId = urlObj.pathname.split('/').pop();
                  if (videoId && !urlObj.pathname.includes('/video/')) finalEmbedUrl = `https://player.vimeo.com/video/${videoId}`;
                }
              } catch (e) {}

              const sep = finalEmbedUrl.includes('?') ? '&' : '?';
              iframeSrc = `${finalEmbedUrl}${sep}autoplay=${autoplay}&loop=${loop}&controls=${controls}&mute=${autoplay}`;
            }

            // Build inner media HTML
            let mediaHtml = '';
            if (lightbox) {
              // Poster/play-button trigger for lightbox
              const bgStyle = posterUrl ? `background-image:url('${posterUrl}');background-size:cover;background-position:center;` : 'background:#0f172a;';
              const videoId = `vid-${Math.random().toString(36).slice(2,8)}`;
              const modalId = `modal-${videoId}`;
              mediaHtml = `
                <div id="${videoId}" class="${arClass} ${brClass} overflow-hidden relative cursor-pointer group shadow-2xl"
                     style="${bgStyle}"
                     onclick="document.getElementById('${modalId}').classList.remove('hidden')">
                  <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                    <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <svg class="w-10 h-10 text-indigo-600 ml-2" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z"/></svg>
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

            return `
              <div class="w-full py-8">
                <div class="${mwClass} ${alignClass} ${animClass} relative">
                  ${mediaHtml}
                  ${caption ? `<p class="text-center text-sm text-gray-500 mt-3 italic">${caption}</p>` : ''}
                </div>
              </div>
            `;
          }
          default:
            return '';
        }
      }).join('');

      const isBoxed = section.style.containerWidth !== 'full';
      const containerClass = isBoxed ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'w-full';
      const blockLayoutClass = section.style.blockLayout === 'row'
        ? 'flex flex-col md:flex-row items-center gap-8'
        : '';

      return `
        <section id="${section.id}" class="relative ${ptClass} ${pbClass} overflow-hidden" style="${secStyle}">
          <style>
            #${section.id} .section-content-wrapper { pointer-events: none; }
            #${section.id} .section-content-wrapper > * { pointer-events: auto; }
          </style>
          ${videoHtml}
          ${(isImageBg || isVideoBg) && overlayOpacity > 0 ? `
            <div class="absolute inset-0" style="background-color: ${overlayColor}; opacity: ${overlayOpacity}; pointer-events: none; z-index: 1;"></div>
          ` : ''}
          <div class="section-content-wrapper relative z-10 ${containerClass} ${blockLayoutClass} w-full">
            ${blocksHtml}
          </div>
        </section>
      `;
    }).join('');



    if (!this.formData.title) this.formData.title = 'New Page';
    this.formData.bodyHtml = html;
    this.cdr.detectChanges();
  }

  saveAndPublishPage(statusOverride?: string) {
    if (!this.selectedOrgId || !this.selectedMenuId || !this.formData.title) return;

    if (statusOverride) {
      this.formData.status = statusOverride;
    }

    this.isCreating = true;
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.formData.bodyHtml || this.formData.bodyHtml.trim() === '') {
      this.updateGeneratedHtml();
    }

    let subMenuItemId: string | null = null;
    let menuItemId: string | null = null;
    let isSub = false;

    for (const m of this.menus) {
      if (m.subMenuItems) {
        const foundSub = (m.subMenuItems as any[]).find(s => s && s.id === this.selectedMenuId);
        if (foundSub) {
          isSub = true;
          subMenuItemId = foundSub.id;
          break;
        }
      }
    }
    if (!isSub) {
      menuItemId = this.selectedMenuId;
    }

    const payload = {
      organizationId: this.selectedOrgId,
      menuItemId: menuItemId,
      subMenuItemId: subMenuItemId,
      title: (this.formData.title || '').trim(),
      status: this.formData.status || 'Draft',
      sortOrder: Number(this.formData.sortOrder || 1),
      templateId: this.selectedTemplateId || 'blank',
      contentJson: JSON.stringify(this.clientData),
      bodyHtml: this.formData.bodyHtml
    };

    const handleSuccess = () => {
      this.isCreating = false;
      this.successMessage = this.formData.status === 'Draft' 
        ? 'Draft saved successfully!' 
        : 'Page saved & published to website successfully!';
      
      this.selectedMenuId = null;
      this.pageContent = null;
      this.formData = { title: '', status: 'Draft', sortOrder: 1 };
      
      this.loadOrgPages();

      this.cdr.detectChanges();
      
      setTimeout(() => {
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 4000);
    };

    if (this.pageContent && this.pageContent.id) {
      this.pageService.updatePage(this.pageContent.id!, payload).subscribe({
        next: () => handleSuccess(),
        error: (err) => this.handleCreateOrUpdateError(err)
      });
    } else {
      this.pageService.createPage(payload).subscribe({
        next: () => handleSuccess(),
        error: (err) => {
          const errText = err.error?.message || err.message || '';
          if (errText.includes('already exists')) {
            this.pageService.savePageContent(this.selectedOrgId!, payload).subscribe({
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

  dismissSuccess() {
    this.successMessage = null;
    this.cdr.detectChanges();
  }

  dismissError() {
    this.errorMessage = null;
    this.cdr.detectChanges();
  }

  uploadImage(event: any, targetObj: any, targetProp: string) {
    const file = event.target.files[0];
    if (!file || !this.selectedOrgId) return;

    this.isUploadingImage = true;
    this.cdr.detectChanges();

    this.mediaService.uploadMedia(this.selectedOrgId, file).subscribe({
      next: (res) => {
        // Handle direct object response vs envelope wrapper response
        const newMedia = res.data ? res.data : res;
        if (newMedia && newMedia.filePath) {
          targetObj[targetProp] = newMedia.filePath;
        } else {
          this.errorMessage = 'Media uploaded but could not retrieve path.';
          setTimeout(() => { this.errorMessage = null; this.cdr.detectChanges(); }, 3000);
        }
        this.isUploadingImage = false;
        event.target.value = ''; // Reset input
        this.updateGeneratedHtml();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error uploading media', err);
        this.errorMessage = 'Failed to upload media. Please try again.';
        setTimeout(() => { this.errorMessage = null; this.cdr.detectChanges(); }, 3000);
        this.isUploadingImage = false;
        event.target.value = ''; // Reset input
        this.cdr.detectChanges();
      }
    });
  }

  loadWireframe() {
    this.updateGeneratedHtml('wireframe');
  }
}
