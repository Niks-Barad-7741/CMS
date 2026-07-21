import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationService, Organization } from '../../../core/services/organization.service';

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
  formData: any = { name: '', slug: '', isActive: true };
  errorMessage: string | null = null;

  constructor(
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        console.log('loadOrganizations received:', data);
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
    this.formData = { name: '', slug: '', isActive: true };
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
  }

  generateSlug() {
    if (!this.editingId) {
      this.formData.slug = (this.formData.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
  }

  save() {
    this.errorMessage = null;
    if (this.editingId) {
      this.orgService.updateOrganization(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadOrganizations();
          this.closeForm();
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.errorMessage = this.extractErrorMessage(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.orgService.createOrganization(this.formData).subscribe({
        next: () => {
          this.loadOrganizations();
          this.closeForm();
        },
        error: (err) => {
          console.error('Create failed:', err);
          this.errorMessage = this.extractErrorMessage(err);
          this.cdr.detectChanges();
        }
      });
    }
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
