import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { PageService, PageContent } from '../../../core/services/page.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pages',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './pages.html'
})
export class PagesComponent implements OnInit {
  isBrowser = false;
  role: string | null = '';
  clientOrgId: string | null = null;
  
  organizations: Organization[] = [];
  menus: MenuItem[] = [];
  
  selectedOrgId: string | null = null;
  selectedMenuId: string | null = null;
  
  pageContent: PageContent | null = null;
  formData = { title: '', bodyHtml: '', status: 'Draft' };
  isSaving = false;
  successMessage = '';

  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean'],                                         // remove formatting button
      ['link', 'image', 'video']                         // link and image, video
    ]
  };

  constructor(
    private pageService: PageService,
    private orgService: OrganizationService,
    private menuService: MenuService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.role = this.authService.getRole();
    this.clientOrgId = this.authService.getOrganizationId();
  }

  ngOnInit() {
    this.loadMenus();
    if (this.role === 'Admin') {
      this.loadOrganizations();
    } else {
      // Client is locked to their own org
      this.selectedOrgId = this.clientOrgId;
      if (!this.selectedOrgId) {
        console.error('Client user has no associated organizationId!');
      }
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

  onSelectionChange() {
    this.successMessage = '';
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
          this.formData = { title: page.title, bodyHtml: page.bodyHtml, status: page.status };
        } else {
          // Initialize empty for creation
          this.pageContent = null;
          this.formData = { title: '', bodyHtml: '', status: 'Draft' };
        }
        this.cdr.detectChanges();
      }
    });
  }

  saveContent() {
    if (!this.selectedOrgId || !this.selectedMenuId) return;
    
    this.isSaving = true;
    this.successMessage = '';
    
    this.pageService.savePageContent(this.selectedOrgId, this.selectedMenuId, this.formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Content saved successfully!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => {
        this.isSaving = false;
        alert('Failed to save content.');
      }
    });
  }
}
