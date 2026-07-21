import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  organizations: Organization[] = [];
  
  showForm = false;
  editingId: string | null = null;
  formData: any = { name: '', email: '', password: '', role: 'Client', organizationId: null, isActive: true };

  constructor(
    private userService: UserService,
    private orgService: OrganizationService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadOrganizations();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => this.users = data
    });
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe({
      next: (data) => this.organizations = data
    });
  }

  getOrgName(orgId: string | null): string {
    if (!orgId) return 'None (Global)';
    const org = this.organizations.find(o => o.id === orgId);
    return org ? org.name : 'Unknown';
  }

  openCreateForm() {
    this.showForm = true;
    this.editingId = null;
    this.formData = { name: '', email: '', password: '', role: 'Client', organizationId: null, isActive: true };
  }

  openEditForm(user: User) {
    this.showForm = true;
    this.editingId = user.id;
    this.formData = { 
      name: user.name, 
      email: user.email, 
      password: '', // blank on edit, only send if changing
      role: user.role, 
      organizationId: user.organizationId, 
      isActive: user.isActive 
    };
  }

  closeForm() {
    this.showForm = false;
  }

  save() {
    // If Admin, clear orgId
    if (this.formData.role === 'Admin') {
      this.formData.organizationId = null;
    }

    if (this.editingId) {
      this.userService.updateUser(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
        }
      });
    } else {
      this.userService.createUser(this.formData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeForm();
        }
      });
    }
  }
}
