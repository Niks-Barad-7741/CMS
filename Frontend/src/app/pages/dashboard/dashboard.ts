import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrganizationService } from '../../core/services/organization.service';
import { MenuService } from '../../core/services/menu.service';
import { PageService } from '../../core/services/page.service';
import { 
  HOME_TEMPLATE, 
  ABOUT_TEMPLATE, 
  SERVICES_TEMPLATE, 
  CONTACT_TEMPLATE 
} from '../../core/constants/template-data';
import { catchError, concatMap, from, of, toArray, finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  siteForm: FormGroup;
  isInitializing = false;
  createdOrgSlug: string | null = null;
  errorMessage = '';
  showInitModal = false;

  selectedPeriod: 'Day' | 'Week' | 'Month' = 'Week';

  organizations: any[] = [];
  totalOrgs = 0;
  activeOrgs = 0;
  totalViews = '12.45K';
  totalProfit = '$45.2K';
  totalProducts = '2.450';
  totalUsersCount = '3.456';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private orgService: OrganizationService,
    private menuService: MenuService,
    private pageService: PageService,
    private cdr: ChangeDetectorRef
  ) {
    this.siteForm = this.fb.group({
      siteName: ['', Validators.required],
      siteSlug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]]
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.orgService.getOrganizations().subscribe({
      next: (orgs) => {
        this.organizations = orgs || [];
        this.totalOrgs = this.organizations.length;
        this.activeOrgs = this.organizations.filter(o => o.isActive).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  setPeriod(period: 'Day' | 'Week' | 'Month'): void {
    this.selectedPeriod = period;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  initializeSite() {
    if (this.siteForm.invalid) return;

    this.isInitializing = true;
    this.errorMessage = '';
    this.createdOrgSlug = null;
    this.cdr.detectChanges();

    const { siteName, siteSlug } = this.siteForm.value;

    this.orgService.createOrganization({ name: siteName, slug: siteSlug }).subscribe({
      next: (org) => {
        this.setupSiteContent(org);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create Organization.';
        this.isInitializing = false;
        this.cdr.detectChanges();
      }
    });
  }

  private setupSiteContent(org: any) {
    const menusToCreate = [
      { title: 'Home', page: 'home', sortOrder: 1, isVisible: true, html: HOME_TEMPLATE },
      { title: 'About', page: 'about', sortOrder: 2, isVisible: true, html: ABOUT_TEMPLATE },
      { title: 'Services', page: 'services', sortOrder: 3, isVisible: true, html: SERVICES_TEMPLATE },
      { title: 'Contact', page: 'contact', sortOrder: 4, isVisible: true, html: CONTACT_TEMPLATE }
    ];

    // We process sequentially to avoid potential race conditions if the backend is strict
    from(menusToCreate).pipe(
      concatMap(menuDef => 
        this.menuService.createMenu({
          organizationId: org.id,
          title: menuDef.title,
          page: menuDef.page,
          sortOrder: menuDef.sortOrder,
          isVisible: menuDef.isVisible
        }).pipe(
          concatMap(menuItem => {
            const pagePayload = {
              organizationId: org.id,
              menuItemId: menuItem.id,
              title: menuDef.title,
              bodyHtml: menuDef.html,
              status: 'Published'
            };
            return this.pageService.createPage(pagePayload);
          })
        )
      ),
      toArray(),
      finalize(() => {
        this.isInitializing = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.createdOrgSlug = org.slug;
      },
      error: (err) => {
        this.errorMessage = 'Created organization, but failed to seed some content: ' + (err.error?.message || err.message);
      }
    });
  }

  viewSite() {
    if (this.createdOrgSlug) {
      this.router.navigate(['/site', this.createdOrgSlug]);
    }
  }
}
