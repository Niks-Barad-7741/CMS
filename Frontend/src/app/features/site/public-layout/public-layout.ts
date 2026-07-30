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
  }

  private initSite() {
    const slug = resolveOrgSlug(this.route, this.tenantService.getTenantSlug());
    if (slug === this.orgSlug && this.orgProfile && !this.isLoading) return;

    this.orgSlug = slug || 'site';
    this.isPathBased = true;
    this.isLoading = true;
    this.cdr.detectChanges();

    this.pageService.getSiteProfile(this.orgSlug).subscribe({
      next: (res: any) => {
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
          .filter((m: any) => m.isVisible !== false)
          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

        this.menus = fetched;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.menus = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getPageLink(page: string): string[] {
    return ['/site', this.orgSlug, page];
  }

  getSocialUrl(platform: string, value: string): string {
    if (!value) return '#';
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    let cleanVal = value.trim();
    while (cleanVal.startsWith('/')) {
      cleanVal = cleanVal.substring(1);
    }
    while (cleanVal.endsWith('/')) {
      cleanVal = cleanVal.substring(0, cleanVal.length - 1);
    }
    switch (platform.toLowerCase()) {
      case 'twitter':
        return `https://x.com/${cleanVal}`;
      case 'facebook':
        return `https://facebook.com/${cleanVal}`;
      case 'instagram':
        return `https://instagram.com/${cleanVal}`;
      default:
        return cleanVal;
    }
  }
}
