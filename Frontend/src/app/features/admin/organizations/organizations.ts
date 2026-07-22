import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService } from '../../../core/services/menu.service';
import { PageService } from '../../../core/services/page.service';
import { 
  HOME_TEMPLATE, 
  ABOUT_TEMPLATE, 
  SERVICES_TEMPLATE, 
  CONTACT_TEMPLATE 
} from '../../../core/constants/template-data';
import { from, concatMap, toArray, finalize } from 'rxjs';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizations.html'
})
export class OrganizationsComponent implements OnInit {
  organizations: Organization[] = [];
  
  showForm = false;
  editingId: string | null = null;
  formData: any = { name: '', slug: '', isActive: true, initializeTemplates: true };
  errorMessage: string | null = null;
  isSaving = false;

  constructor(
    private orgService: OrganizationService,
    private menuService: MenuService,
    private pageService: PageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Failed to load orgs', err);
        // If 404, just set to empty array
        if (err.status === 404) {
          this.organizations = [];
          this.cdr.detectChanges();
        }
      }
    });
  }

  openCreateForm() {
    this.editingId = null;
    this.formData = { name: '', slug: '', isActive: true, initializeTemplates: true };
    this.errorMessage = null;
    this.showForm = true;
  }

  openEditForm(org: Organization) {
    this.editingId = org.id;
    this.formData = { ...org };
    // We don't show initialize templates for editing
    this.errorMessage = null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.errorMessage = null;
    this.isSaving = false;
  }

  generateSlug() {
    if (!this.editingId) {
      this.formData.slug = (this.formData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
  }

  save() {
    this.errorMessage = null;
    this.isSaving = true;

    if (this.editingId) {
      this.orgService.updateOrganization(this.editingId, {
        name: this.formData.name,
        slug: this.formData.slug,
        isActive: this.formData.isActive
      }).subscribe({
        next: () => {
          this.loadOrganizations();
          this.closeForm();
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.errorMessage = this.extractErrorMessage(err);
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.orgService.createOrganization({
        name: this.formData.name,
        slug: this.formData.slug,
        isActive: this.formData.isActive
      }).subscribe({
        next: (org) => {
          if (this.formData.initializeTemplates) {
            this.setupSiteContent(org);
          } else {
            this.loadOrganizations();
            this.closeForm();
          }
        },
        error: (err) => {
          console.error('Create failed:', err);
          this.errorMessage = this.extractErrorMessage(err);
          this.isSaving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private setupSiteContent(org: Organization) {
    const menusToCreate = [
      { title: 'Home', page: 'home', sortOrder: 1, isVisible: true, html: HOME_TEMPLATE },
      { title: 'About', page: 'about', sortOrder: 2, isVisible: true, html: ABOUT_TEMPLATE },
      { title: 'Services', page: 'services', sortOrder: 3, isVisible: true, html: SERVICES_TEMPLATE },
      { title: 'Contact', page: 'contact', sortOrder: 4, isVisible: true, html: CONTACT_TEMPLATE }
    ];

    from(menusToCreate).pipe(
      concatMap(menuDef => 
        this.menuService.createMenu({
          organizationId: org.id,
          title: menuDef.title,
          page: menuDef.page,
          sortOrder: menuDef.sortOrder,
          isVisible: menuDef.isVisible
        }).pipe(
          concatMap((menuRes: any) => {
            const menuItem = menuRes?.data || menuRes;
            const pagePayload = {
              organizationId: org.id,
              menuItemId: menuItem.id,
              title: menuDef.title,
              bodyHtml: menuDef.html.trim(),
              status: 'Published'
            };
            return this.pageService.createPage(pagePayload);
          })
        )
      ),
      toArray(),
      finalize(() => {
        this.isSaving = false;
        this.loadOrganizations();
        this.closeForm();
      })
    ).subscribe({
      next: () => {
        console.log('Site initialized successfully.');
      },
      error: (err) => {
        this.errorMessage = 'Created organization, but failed to seed some content: ' + this.extractErrorMessage(err);
        this.cdr.detectChanges();
      }
    });
  }

  private extractErrorMessage(err: any): string {
    if (err.error?.errors) {
      // Extract all validation errors into a single string
      const msgs = [];
      for (const key in err.error.errors) {
        msgs.push(err.error.errors[key].join(' '));
      }
      return msgs.join(' ');
    }
    return err.error?.message || err.message || 'An unknown error occurred.';
  }

  deactivate(id: string) {
    if (confirm('Are you sure you want to deactivate this organization?')) {
      this.orgService.deactivateOrganization(id).subscribe({
        next: () => this.loadOrganizations()
      });
    }
  }
}
