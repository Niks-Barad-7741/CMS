import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private tenantSlug: string | null = null;
  private readonly reservedSlugs = ['admin', 'www', 'api', 'app'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.resolveTenant();
  }

  private resolveTenant() {
    if (isPlatformBrowser(this.platformId)) {
      const hostname = window.location.hostname;
      // Example hostnames: 'abc.yoursite.com', 'admin.yoursite.com', 'localhost', 'abc.localhost'
      const parts = hostname.split('.');
      
      // If it's a bare domain or just localhost
      if (parts.length <= 1 || (parts.length === 2 && parts[1] === 'localhost' && this.reservedSlugs.includes(parts[0]))) {
        // Just localhost or admin.localhost
      }

      const slug = parts[0];
      
      if (this.reservedSlugs.includes(slug.toLowerCase()) || slug === 'localhost') {
        this.tenantSlug = null; // Admin / No tenant
      } else {
        this.tenantSlug = slug; // Found a valid org slug
      }
    }
  }

  getTenantSlug(): string | null {
    return this.tenantSlug;
  }

  isTenantSite(): boolean {
    return this.tenantSlug !== null;
  }
}
