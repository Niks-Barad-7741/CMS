import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PageService, PageContent } from '../../../core/services/page.service';
import { TenantService } from '../../../core/services/tenant.service';
import { resolveOrgSlug } from '../../../core/utils/tenant-route.util';
import { getStaticSitePage } from '../../../core/constants/static-site.data';

@Component({
  selector: 'app-page-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-viewer.html'
})
export class PageViewerComponent implements OnInit {
  pageSlug: string = '';
  orgSlug: string = '';

  pageContent: PageContent | null = null;
  safeBodyHtml: SafeHtml | null = null;

  isLoading = true;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private pageService: PageService,
    private tenantService: TenantService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pageSlug = params.get('pageSlug') || 'home';
      this.orgSlug = resolveOrgSlug(this.route, this.tenantService.getTenantSlug()) || 'site';
      this.loadContent();
    });
  }

  loadContent() {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.detectChanges();

    // Safety timeout: if API call takes more than 1 second, load fallback template
    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.loadStaticContent();
      }
    }, 1000);

    this.pageService.getPublicPage(this.orgSlug, this.pageSlug).subscribe({
      next: (res: any) => {
        clearTimeout(timeoutId);
        const page = res?.data || res;
        if (page && page.bodyHtml) {
          this.pageContent = page;
          this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(page.bodyHtml);
          this.isLoading = false;
          this.hasError = false;
          this.cdr.detectChanges();
        } else {
          this.loadStaticContent();
        }
      },
      error: () => {
        clearTimeout(timeoutId);
        this.loadStaticContent();
      }
    });
  }

  private loadStaticContent() {
    const page = getStaticSitePage(this.orgSlug, this.pageSlug);
    this.pageContent = {
      id: 'static',
      organizationId: this.orgSlug,
      menuItemId: 'static',
      title: page ? page.title : 'Page',
      bodyHtml: page ? page.bodyHtml : '',
      status: 'Published'
    };
    this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(this.pageContent.bodyHtml);
    this.isLoading = false;
    this.hasError = false;
    this.cdr.detectChanges();
  }
}
