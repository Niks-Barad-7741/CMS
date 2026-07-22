import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, ActivatedRoute } from '@angular/router';
import { MenuItem } from '../../../core/services/menu.service';
import { PageService } from '../../../core/services/page.service';
import { TenantService } from '../../../core/services/tenant.service';
import { isPathBasedSite, resolveOrgSlug } from '../../../core/utils/tenant-route.util';
import { getStaticSiteProfile, STATIC_SITE_MENUS } from '../../../core/constants/static-site.data';

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
  isPathBased = false;
  isNotFound = false;
  isLoading = true;
  currentYear = new Date().getFullYear();

  constructor(
    private pageService: PageService,
    private tenantService: TenantService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => this.initSite());
    this.initSite();
  }

  private initSite() {
    const slug = resolveOrgSlug(this.route, this.tenantService.getTenantSlug());
    if (slug === this.orgSlug && this.orgProfile && !this.isLoading) return;

    this.orgSlug = slug || 'site';
    this.isPathBased = true;
    this.isLoading = true;
    this.cdr.detectChanges();

    // Safety timeout: if API call takes more than 1 second, immediately render default templates
    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        console.warn('API timeout: falling back to default site templates');
        this.loadStaticSite();
      }
    }, 1000);

    this.pageService.getSiteProfile(this.orgSlug).subscribe({
      next: (res: any) => {
        clearTimeout(timeoutId);
        const profile = res?.data || res;
        if (profile && profile.name) {
          this.orgProfile = profile;
          this.isNotFound = false;
          this.loadMenus();
        } else {
          this.loadStaticSite();
        }
      },
      error: () => {
        clearTimeout(timeoutId);
        this.loadStaticSite();
      }
    });
  }

  private loadStaticSite() {
    this.orgProfile = getStaticSiteProfile(this.orgSlug);
    this.menus = STATIC_SITE_MENUS as MenuItem[];
    this.isNotFound = false;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private loadMenus() {
    this.pageService.getPublicMenus(this.orgSlug).subscribe({
      next: (res: any) => {
        const data = res?.data || res;
        const fetched = (Array.isArray(data) ? data : [])
          .filter((m: any) => m.isVisible)
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
          
        this.menus = (fetched && fetched.length > 0) ? fetched : (STATIC_SITE_MENUS as MenuItem[]);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.menus = STATIC_SITE_MENUS as MenuItem[];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPageLink(page: string): string[] {
    return ['/site', this.orgSlug, page];
  }
}
