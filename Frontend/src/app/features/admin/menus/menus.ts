import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MenuService, MenuItem } from '../../../core/services/menu.service';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './menus.html'
})
export class MenusComponent implements OnInit {
  menus: MenuItem[] = [];
  
  showForm = false;
  editingId: string | null = null;
  formData: any = { title: '', page: '', sortOrder: 0, isVisible: true };
  errorMessage: string | null = null;

  // Inline Creation Properties
  newMenuData = { title: '', page: '' };
  submittedEmptyEdit = false;

  // Toast & Modal Notification Properties
  toastMessage: string | null = null;
  showDeleteModal = false;
  deleteTargetId: string | null = null;
  deleteTargetTitle = '';

  showToast(msg: string) {
    this.toastMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.toastMessage = null;
      this.cdr.detectChanges();
    }, 4000);
  }

  confirmDelete(menu: MenuItem) {
    this.deleteTargetId = menu.id;
    this.deleteTargetTitle = menu.title;
    this.showDeleteModal = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.deleteTargetId = null;
    this.deleteTargetTitle = '';
    this.cdr.detectChanges();
  }

  executeDelete() {
    if (!this.deleteTargetId) return;
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

  submittedEmptyInline = false;

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
    this.menuService.createMenu(payload).subscribe({
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.menuService.getMenus().subscribe({
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
      this.menuService.createMenu(this.formData).subscribe({
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
      this.confirmDelete(menu);
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
}
