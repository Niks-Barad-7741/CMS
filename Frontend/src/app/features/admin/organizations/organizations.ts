import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { MenuService } from '../../../core/services/menu.service';
import { PageService } from '../../../core/services/page.service';
import { DashboardService } from '../../../core/services/dashboard.service';
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
  formData: any = { name: '', slug: '', isActive: true, initializeTemplates: false };
  errorMessage: string | null = null;
  isSaving = false;

  // Toast & Modal Notification Properties
  toastMessage: string | null = null;
  showDeleteModal = false;
  deleteTargetId: string | null = null;
  deleteTargetName = '';

  showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  confirmDelete(org: Organization) {
    this.deleteTargetId = org.id;
    this.deleteTargetName = org.name;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
    this.deleteTargetName = '';
    this.cdr.detectChanges();
  }

  executeDelete() {
    if (!this.deleteTargetId) return;
    this.orgService.deleteOrganization(this.deleteTargetId).subscribe({
      next: () => {
        this.showToast(`Organization '${this.deleteTargetName}' deleted successfully.`);
        this.loadOrganizations();
        this.cancelDelete();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.errorMessage = 'Delete failed: ' + this.extractErrorMessage(err);
        this.cancelDelete();
      }
    });
  }

  constructor(
    private orgService: OrganizationService,
    private menuService: MenuService,
    private pageService: PageService,
    private dashboardService: DashboardService,
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
        this.dashboardService.refresh(); // Sync dashboard state
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
    this.formData = {
      name: '',
      slug: '',
      isActive: true,
      initializeTemplates: false,
      footerDescription: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      socialTwitter: '',
      socialFacebook: '',
      socialInstagram: ''
    };
    this.errorMessage = null;
    this.showForm = true;
  }

  openEditForm(org: Organization) {
    this.editingId = org.id;
    this.formData = { ...org };
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

    // Contact Email Validation
    if (this.formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.contactEmail)) {
      this.errorMessage = 'Contact Email must be a valid email address.';
      return;
    }

    // Contact Phone Validation (exactly 10 digits)
    if (this.formData.contactPhone && !/^\d{10}$/.test(this.formData.contactPhone)) {
      this.errorMessage = 'Contact Phone must be exactly a 10-digit number (e.g. 9876543210).';
      return;
    }

    // Twitter URL Validation (valid HTTP/HTTPS URL containing twitter.com or x.com)
    if (this.formData.socialTwitter) {
      try {
        const url = new URL(this.formData.socialTwitter);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          throw new Error();
        }
        const host = url.hostname.toLowerCase();
        if (!host.includes('twitter.com') && !host.includes('x.com')) {
          this.errorMessage = 'Twitter link must be a valid URL containing twitter.com or x.com.';
          return;
        }
      } catch (_) {
        this.errorMessage = 'Twitter link must be a valid URL starting with http:// or https://.';
        return;
      }
    }

    // Facebook ID/URL Validation (valid URL containing facebook.com or handle allowing slashes)
    if (this.formData.socialFacebook) {
      const val = this.formData.socialFacebook;
      if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
          const url = new URL(val);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
          if (!url.hostname.toLowerCase().includes('facebook.com')) {
            this.errorMessage = 'Facebook link must be a valid URL containing facebook.com.';
            return;
          }
        } catch (_) {
          this.errorMessage = 'Facebook link must be a valid URL starting with http:// or https://.';
          return;
        }
      } else if (!/^[a-zA-Z0-9._/]+$/.test(val)) {
        this.errorMessage = 'Facebook ID must be a valid alphanumeric handle (dots, underscores, and slashes allowed).';
        return;
      }
    }

    // Instagram ID/URL Validation (valid URL containing instagram.com or handle allowing slashes)
    if (this.formData.socialInstagram) {
      const val = this.formData.socialInstagram;
      if (val.startsWith('http://') || val.startsWith('https://')) {
        try {
          const url = new URL(val);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
          if (!url.hostname.toLowerCase().includes('instagram.com')) {
            this.errorMessage = 'Instagram link must be a valid URL containing instagram.com.';
            return;
          }
        } catch (_) {
          this.errorMessage = 'Instagram link must be a valid URL starting with http:// or https://.';
          return;
        }
      } else if (!/^[a-zA-Z0-9._/]+$/.test(val)) {
        this.errorMessage = 'Instagram ID must be a valid alphanumeric handle (dots, underscores, and slashes allowed).';
        return;
      }
    }

    this.isSaving = true;

    const payload = {
      name: this.formData.name,
      slug: this.formData.slug,
      isActive: this.formData.isActive,
      footerDescription: this.formData.footerDescription,
      contactEmail: this.formData.contactEmail,
      contactPhone: this.formData.contactPhone,
      address: this.formData.address,
      socialTwitter: this.formData.socialTwitter,
      socialFacebook: this.formData.socialFacebook,
      socialInstagram: this.formData.socialInstagram
    };

    if (this.editingId) {
      this.orgService.updateOrganization(this.editingId, payload).subscribe({
        next: () => {
          this.showToast(`Organization '${payload.name}' updated successfully.`);
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
      this.orgService.createOrganization(payload).subscribe({
        next: (org) => {
          this.showToast(`Organization '${payload.name}' created successfully.`);
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
        this.menuService.createMenu(org.id, {
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

  toggleOrgStatus(org: Organization) {
    this.orgService.toggleStatus(org.id).subscribe({
      next: () => {
        const nextStatus = !org.isActive ? 'Active' : 'Inactive';
        this.showToast(`Organization '${org.name}' is now ${nextStatus}.`);
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('Toggle status failed:', err);
        this.showToast('Failed to change status: ' + this.extractErrorMessage(err));
      }
    });
  }
}
