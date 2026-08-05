import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem, SubMenuItem } from '../../../core/services/menu.service';
import { SubMenuService } from '../../../core/services/submenu.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menus.html'
})
export class MenusComponent implements OnInit {
  role: string | null = '';
  clientOrgId: string | null = null;
  organizations: Organization[] = [];
  selectedOrgId: string | null = null;
  isOrgDropdownOpen = false;

  menus: MenuItem[] = [];
  
  showForm = false;
  editingId: string | null = null;
  formData: any = { title: '', page: '', sortOrder: 0, isVisible: true };
  errorMessage: string | null = null;

  // Inline Creation Properties
  newMenuData = { title: '', page: '' };
  submittedEmptyInline = false;
  submittedEmptyEdit = false;

  // Sub-menu properties
  expandedMenuId: string | null = null;
  subMenus: { [menuId: string]: SubMenuItem[] } = {};
  subMenuFormData: any = { title: '', page: '', sortOrder: 1, isVisible: true, menuItemId: '' };
  editingSubMenuId: string | null = null;
  showSubMenuForm: string | null = null;
  newSubMenuData: { [menuId: string]: { title: string; page: string } } = {};

  // Toast & Modal Notification Properties
  toastMessage: string | null = null;
  showDeleteModal = false;
  deleteTargetId: string | null = null;
  deleteTargetTitle = '';
  deleteTargetType: 'menu' | 'submenu' = 'menu';
  deleteTargetParentId: string | null = null;

  showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  confirmDelete(id: string, title: string, type: 'menu' | 'submenu', parentId: string | null = null) {
    this.deleteTargetId = id;
    this.deleteTargetTitle = title;
    this.deleteTargetType = type;
    this.deleteTargetParentId = parentId;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
    this.deleteTargetTitle = '';
    this.deleteTargetType = 'menu';
    this.deleteTargetParentId = null;
    this.cdr.detectChanges();
  }

  executeDelete() {
    if (!this.deleteTargetId) return;
    
    if (this.deleteTargetType === 'menu') {
      this.menuService.deleteMenu(this.deleteTargetId).subscribe({
        next: () => {
          this.showToast(`Menu '${this.deleteTargetTitle}' deleted successfully.`);
          this.loadMenus();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.errorMessage = 'Delete failed: ' + this.extractErrorMessage(err);
          this.cancelDelete();
        }
      });
    } else {
      const parentId = this.deleteTargetParentId;
      this.subMenuService.deleteSubMenu(this.deleteTargetId).subscribe({
        next: () => {
          this.showToast(`Sub-menu '${this.deleteTargetTitle}' deleted successfully.`);
          if (parentId) this.loadSubMenus(parentId);
          this.cancelDelete();
        },
        error: (err) => {
          this.errorMessage = 'Delete failed: ' + this.extractErrorMessage(err);
          this.cancelDelete();
        }
      });
    }
  }

  get nextSortOrder(): number {
    return this.menus.length > 0 ? Math.max(...this.menus.map(m => m.sortOrder)) + 1 : 1;
  }

  generateInlineSlug() {
    this.newMenuData.page = (this.newMenuData.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }



  saveInline() {
    if (!this.newMenuData.title || !this.newMenuData.page) {
      this.submittedEmptyInline = true;
      this.cdr.detectChanges();
      return;
    }
    const payload = {
      title: this.newMenuData.title,
      page: this.newMenuData.page,
      sortOrder: this.nextSortOrder,
      isVisible: true
    };
    this.menuService.createMenu(this.selectedOrgId!, payload).subscribe({
      next: () => {
        this.submittedEmptyInline = false;
        this.showToast(`Menu '${payload.title}' added successfully.`);
        this.loadMenus();
        this.newMenuData = { title: '', page: '' };
      },
      error: (err) => {
        console.error('Create failed:', err);
        alert(this.extractErrorMessage(err));
      }
    });
  }

  constructor(
    private menuService: MenuService,
    private subMenuService: SubMenuService,
    private orgService: OrganizationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.role = this.authService.getRole();
    this.clientOrgId = this.authService.getOrganizationId();
  }

  ngOnInit() {
    if (this.role === 'Admin') {
      this.orgService.getOrganizations().pipe(catchError(() => of([]))).subscribe(orgs => {
        this.organizations = (orgs || []).filter((o: any) => o.isActive);
        if (this.organizations.length > 0) {
          this.selectedOrgId = this.organizations[0].id;
        }
        this.loadMenus();
      });
    } else {
      this.selectedOrgId = this.clientOrgId;
      this.loadMenus();
    }
  }

  selectOrg(id: string | null) {
    this.selectedOrgId = id;
    this.isOrgDropdownOpen = false;
    this.loadMenus();
  }

  getSelectedOrgName(): string {
    if (!this.selectedOrgId || !this.organizations) return '';
    const org = this.organizations.find(o => o.id === this.selectedOrgId);
    return org ? org.name : '';
  }

  loadMenus() {
    if (!this.selectedOrgId) return;
    this.menuService.getMenus(this.selectedOrgId).subscribe({
      next: (data) => {
        // Sort by sortOrder locally just in case
        if (data && Array.isArray(data)) {
          this.menus = data.sort((a, b) => a.sortOrder - b.sortOrder);
        } else {
          this.menus = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load menus', err);
        if (err.status === 404) {
          this.menus = [];
          this.cdr.detectChanges();
        }
      }
    });
  }

  openCreateForm() {
    this.showForm = true;
    this.editingId = null;
    const nextSort = this.menus.length > 0 ? Math.max(...this.menus.map(m => m.sortOrder)) + 1 : 1;
    this.formData = { title: '', page: '', sortOrder: nextSort, isVisible: true };
    this.errorMessage = null;
    this.submittedEmptyEdit = false;
  }

  openEditForm(menu: MenuItem) {
    this.showForm = true;
    this.editingId = menu.id;
    this.formData = { 
      title: menu.title, 
      page: menu.page, 
      sortOrder: menu.sortOrder, 
      isVisible: menu.isVisible 
    };
    this.errorMessage = null;
    this.submittedEmptyEdit = false;
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.errorMessage = null;
    this.submittedEmptyEdit = false;
  }

  generateSlug() {
    if (!this.editingId) {
      this.formData.page = (this.formData.title || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  save() {
    this.errorMessage = null;
    if (this.editingId) {
      if (!this.formData.title || !this.formData.page) {
        this.submittedEmptyEdit = true;
        this.cdr.detectChanges();
        return;
      }
      this.menuService.updateMenu(this.editingId, this.formData).subscribe({
        next: () => {
          this.showToast(`Menu '${this.formData.title}' updated successfully.`);
          this.loadMenus();
          this.closeForm();
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.errorMessage = this.extractErrorMessage(err);
          this.cdr.detectChanges();
        }
      });
    } else {
      this.menuService.createMenu(this.selectedOrgId!, this.formData).subscribe({
        next: () => {
          this.showToast(`Menu '${this.formData.title}' added successfully.`);
          this.loadMenus();
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
      const msgs = [];
      for (const key in err.error.errors) {
        msgs.push(err.error.errors[key].join(' '));
      }
      return msgs.join(' ');
    }
    return err.error?.message || err.message || 'An unknown error occurred.';
  }

  deleteMenu(id: string) {
    const menu = this.menus.find(m => m.id === id);
    if (menu) {
      this.confirmDelete(menu.id, menu.title, 'menu');
    }
  }

  moveUp(index: number) {
    if (index <= 0) return;
    const current = this.menus[index];
    const prev = this.menus[index - 1];

    const tempOrder = current.sortOrder;
    current.sortOrder = prev.sortOrder;
    prev.sortOrder = tempOrder;

    this.menuService.updateMenu(current.id, current).subscribe({
      next: () => {
        this.menuService.updateMenu(prev.id, prev).subscribe({
          next: () => this.loadMenus()
        });
      }
    });
  }

  moveDown(index: number) {
    if (index >= this.menus.length - 1) return;
    const current = this.menus[index];
    const next = this.menus[index + 1];

    const tempOrder = current.sortOrder;
    current.sortOrder = next.sortOrder;
    next.sortOrder = tempOrder;

    this.menuService.updateMenu(current.id, current).subscribe({
      next: () => {
        this.menuService.updateMenu(next.id, next).subscribe({
          next: () => this.loadMenus()
        });
      }
    });
  }

  toggleSubMenus(menuId: string) {
    if (this.expandedMenuId === menuId) {
      this.expandedMenuId = null;
      return;
    }
    this.expandedMenuId = menuId;
    this.loadSubMenus(menuId);
  }

  loadSubMenus(menuId: string) {
    this.subMenuService.getSubMenus(menuId).subscribe({
      next: (data) => {
        this.subMenus[menuId] = (data || []).sort((a, b) => a.sortOrder - b.sortOrder);
        if (!this.newSubMenuData[menuId]) {
          this.newSubMenuData[menuId] = { title: '', page: '' };
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.subMenus[menuId] = [];
        this.cdr.detectChanges();
      }
    });
  }

  generateSubMenuSlug(menuId: string) {
    if (this.newSubMenuData[menuId]) {
      this.newSubMenuData[menuId].page = (this.newSubMenuData[menuId].title || '')
        .toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
  }

  getNextSubSortOrder(menuId: string): number {
    const subs = this.subMenus[menuId] || [];
    return subs.length > 0 ? Math.max(...subs.map(s => s.sortOrder)) + 1 : 1;
  }

  saveSubMenuInline(menuId: string) {
    const data = this.newSubMenuData[menuId];
    if (!data || !data.title || !data.page) return;
    const payload = {
      menuItemId: menuId,
      title: data.title,
      page: data.page,
      sortOrder: this.getNextSubSortOrder(menuId),
      isVisible: true
    };
    this.subMenuService.createSubMenu(this.selectedOrgId!, payload).subscribe({
      next: () => {
        this.showToast(`Sub-menu '${payload.title}' added successfully.`);
        this.newSubMenuData[menuId] = { title: '', page: '' };
        this.loadSubMenus(menuId);
      },
      error: (err) => {
        alert(this.extractErrorMessage(err));
      }
    });
  }

  startEditSubMenu(sub: SubMenuItem) {
    this.editingSubMenuId = sub.id;
    this.subMenuFormData = {
      title: sub.title,
      page: sub.page,
      sortOrder: sub.sortOrder,
      isVisible: sub.isVisible,
      menuItemId: sub.menuItemId
    };
    this.cdr.detectChanges();
  }

  cancelEditSubMenu() {
    this.editingSubMenuId = null;
    this.cdr.detectChanges();
  }

  saveEditSubMenu() {
    if (!this.editingSubMenuId || !this.subMenuFormData.title || !this.subMenuFormData.page) return;
    this.subMenuService.updateSubMenu(this.editingSubMenuId, this.subMenuFormData).subscribe({
      next: () => {
        this.showToast(`Sub-menu '${this.subMenuFormData.title}' updated.`);
        this.editingSubMenuId = null;
        this.loadSubMenus(this.subMenuFormData.menuItemId);
      },
      error: (err) => alert(this.extractErrorMessage(err))
    });
  }

  deleteSubMenu(sub: SubMenuItem) {
    this.confirmDelete(sub.id, sub.title, 'submenu', sub.menuItemId);
  }
}
