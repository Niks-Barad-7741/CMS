import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MenuService, MenuItem } from '../../../core/services/menu.service';
import { PageService } from '../../../core/services/page.service';
import { TenantService } from '../../../core/services/tenant.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './public-layout.html'
})
export class PublicLayoutComponent implements OnInit {
  menus: MenuItem[] = [];
  orgProfile: any = null;
  orgSlug: string = '';
  isNotFound = false;
  currentYear = new Date().getFullYear();

  constructor(
    private menuService: MenuService,
    private pageService: PageService,
    private tenantService: TenantService
  ) {}

  ngOnInit() {
    this.orgSlug = this.tenantService.getTenantSlug() || '';
    
    if (this.orgSlug) {
      this.loadSiteProfile();
    } else {
      this.isNotFound = true;
    }
  }

  loadSiteProfile() {
    this.pageService.getSiteProfile(this.orgSlug).subscribe({
      next: (profile) => {
        this.orgProfile = profile;
        this.loadMenus();
      },
      error: () => {
        this.isNotFound = true;
      }
    });
  }

  loadMenus() {
    this.menuService.getMenus().subscribe({
      next: (data) => {
        // Only show visible menus, sorted
        this.menus = data.filter(m => m.isVisible).sort((a,b) => a.sortOrder - b.sortOrder);
      }
    });
  }
}
