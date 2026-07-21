import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PageService, PageContent } from '../../../core/services/page.service';
import { TenantService } from '../../../core/services/tenant.service';

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
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.orgSlug = this.tenantService.getTenantSlug() || '';
    
    this.route.paramMap.subscribe(params => {
      this.pageSlug = params.get('pageSlug') || 'home';
      this.loadContent();
    });
  }

  loadContent() {
    this.isLoading = true;
    this.hasError = false;
    
    this.pageService.getPublicPage(this.orgSlug, this.pageSlug).subscribe({
      next: (page) => {
        this.pageContent = page;
        // Sanitize the HTML for security before rendering it directly to the DOM
        this.safeBodyHtml = this.sanitizer.bypassSecurityTrustHtml(page.bodyHtml);
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}
