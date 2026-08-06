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

interface MenuListItem {
  menu: MenuItem;
  page: PageContent | null;
  hasContent: boolean;
  status: string; // 'Published' | 'Draft' | 'Not Added'
  sortOrder: number;
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
        sortOrder
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
            title: `${menu.title} > ${subMenu.title}`,
            page: subMenu.page,
            sortOrder: subMenu.sortOrder,
            isVisible: subMenu.isVisible
          };

          items.push({
            menu: wrappedMenu,
            page: subPage,
            hasContent: subHasContent,
            status: subStatus,
            sortOrder: subSortOrder
          });
        });
      }
    });

    this.menuListItems = items;
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
    this.menuListItems.splice(this.dragIndex, 1);
    this.menuListItems.splice(dropIndex, 0, draggedItem);

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
            const foundSub = m.subMenuItems.find(s => s.id === this.selectedMenuId);
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
        url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600', 
        caption: 'Sample Image Caption', 
        alt: 'Sample description' 
      };
      newBlock.style = { 
        displayMode: 'inline', 
        objectFit: 'cover', 
        aspectRatio: 'auto' 
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
        if (!sec.blocks) {
          sec.blocks = [];
        }
        sec.blocks.forEach((blk: any) => {
          if (!blk.content) blk.content = {};
          if (!blk.style) blk.style = {};
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
        const foundSub = m.subMenuItems.find(s => s.id === this.selectedMenuId);
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
      this.pageService.updatePage(this.pageContent.id, payload).subscribe({
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

  loadWireframe() {
    this.updateGeneratedHtml('wireframe');
  }
}
