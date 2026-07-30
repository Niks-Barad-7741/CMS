import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ChangeDetectorRef, inject, signal, computed, PLATFORM_ID, Inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { OrganizationService } from '../../core/services/organization.service';
import { MenuService } from '../../core/services/menu.service';
import { PageService } from '../../core/services/page.service';
import { DashboardService, DashboardStats, DayActivity } from '../../core/services/dashboard.service';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ── Services ──────────────────────────────────────────────
  private authService      = inject(AuthService);
  private router           = inject(Router);
  private fb               = inject(FormBuilder);
  private orgService       = inject(OrganizationService);
  private menuService      = inject(MenuService);
  private pageService      = inject(PageService);
  public  dashboardService = inject(DashboardService);
  private cdr              = inject(ChangeDetectorRef);

  // ── Auth ──────────────────────────────────────────────────
  role    = this.authService.getRole() || 'User';
  isAdmin = this.role === 'Admin';

  // ── Dark Mode ─────────────────────────────────────────────


  // ── Stats snapshot ────────────────────────────────────────
  stats: DashboardStats | null = null;
  isLoading = true;

  // ── Period Filter ─────────────────────────────────────────────────────────
  readonly periodOptions: Array<'Day' | 'Week' | 'Month'> = ['Day', 'Week', 'Month'];
  selectedPeriod = signal<'Day' | 'Week' | 'Month'>('Week');

  // ── Search & Filters ──────────────────────────────────────
  searchQuery = signal('');
  orgStatusFilter = signal<'All' | 'Active' | 'Inactive'>('All');

  setOrgFilter(status: 'All' | 'Active' | 'Inactive'): void {
    this.orgStatusFilter.set(status);
    if (status === 'All') {
      this.searchQuery.set('');
    }
  }

  filteredOrgs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const filter = this.orgStatusFilter();

    if (!this.stats) return [];

    let orgs = this.stats.organizations;

    if (filter === 'Active') {
      orgs = orgs.filter(o => o.isActive);
    } else if (filter === 'Inactive') {
      orgs = orgs.filter(o => !o.isActive);
    }

    if (!q) return orgs;
    return orgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.slug.toLowerCase().includes(q)
    );
  });

  // ── Chart helpers ─────────────────────────────────────────
  get chartMaxValue(): number {
    if (!this.stats?.weeklyActivity?.length) return 1;
    return Math.max(...this.stats.weeklyActivity.map(d => d.total), 1);
  }

  barHeight(value: number): number {
    return Math.round((value / this.chartMaxValue) * 100);
  }

  svgLinePath(data: DayActivity[], key: 'total' | 'orgs'): string {
    if (!data.length) return '';
    const W = 500, H = 160, pad = 20;
    const max = Math.max(...data.map(d => d[key]), 1);
    const points = data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((d[key] / max) * (H - pad * 2));
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  }

  svgAreaPath(data: DayActivity[], key: 'total' | 'orgs'): string {
    if (!data.length) return '';
    const W = 500, H = 160, pad = 20;
    const max = Math.max(...data.map(d => d[key]), 1);
    const pts = data.map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - ((d[key] / max) * (H - pad * 2));
      return { x, y };
    });
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const close = `L ${pts[pts.length - 1].x},${H - pad} L ${pts[0].x},${H - pad} Z`;
    return `${line} ${close}`;
  }



  // Donut chart (SVG circle)
  get donutDasharray(): string {
    const pct = this.stats?.orgStatusRatio ?? 0;
    const circ = 2 * Math.PI * 54; // r=54
    const active = (pct / 100) * circ;
    return `${active} ${circ - active}`;
  }

  // ── Modal ─────────────────────────────────────────────────
  showInitModal  = false;
  siteForm: FormGroup;
  isInitializing = false;
  createdOrgSlug: string | null = null;
  errorMessage   = '';

  // ── Refresh indicator ─────────────────────────────────────
  isRefreshing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.siteForm = inject(FormBuilder).group({
      siteName: ['', Validators.required],
      siteSlug: ['', [Validators.required, Validators.pattern('^[a-z0-9-]+$')]]
    });
  }

  ngOnInit(): void {

    this._subscribeToStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



  // ── Stats subscription ────────────────────────────────────
  private _subscribeToStats(): void {
    this.dashboardService.stats$.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: stats => {
        this.stats     = stats;
        this.isLoading = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading    = false;
        this.isRefreshing = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Actions ───────────────────────────────────────────────
  setPeriod(p: 'Day' | 'Week' | 'Month'): void {
    this.selectedPeriod.set(p);
    this.dashboardService.setPeriod(p);
  }

  setPeriodStr(p: string): void {
    if (p === 'Day' || p === 'Week' || p === 'Month') {
      this.selectedPeriod.set(p);
      this.dashboardService.setPeriod(p);
    }
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  refresh(): void {
    this.isRefreshing = true;
    this.cdr.markForCheck();
    this.dashboardService.refresh();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  formatGrowth(pct: number): string {
    if (pct === 0) return '—';
    return `${pct > 0 ? '+' : ''}${pct}%`;
  }

  growthClass(pct: number): string {
    if (pct > 0) return 'badge-success';
    if (pct < 0) return 'badge-danger';
    return 'badge-neutral';
  }

  // ── Site Init Modal ───────────────────────────────────────
  openModal(): void {
    this.showInitModal  = true;
    this.createdOrgSlug = null;
    this.errorMessage   = '';
    this.siteForm.reset();
  }

  closeModal(): void {
    this.showInitModal = false;
    if (this.createdOrgSlug) this.refresh();
  }

  initializeSite(): void {
    if (this.siteForm.invalid) return;
    this.isInitializing = true;
    this.errorMessage   = '';
    this.createdOrgSlug = null;
    this.cdr.markForCheck();

    const { siteName, siteSlug } = this.siteForm.value;

    this.orgService.createOrganization({ name: siteName, slug: siteSlug }).subscribe({
      next: (org) => this._setupSiteContent(org),
      error: (err) => {
        this.errorMessage   = err.error?.message || 'Failed to create organization.';
        this.isInitializing = false;
        this.cdr.markForCheck();
      }
    });
  }

  private _setupSiteContent(org: any): void {
    const menus = [
      { title: 'Home',     page: 'home',     sortOrder: 1, isVisible: true, html: HOME_TEMPLATE },
      { title: 'About',    page: 'about',    sortOrder: 2, isVisible: true, html: ABOUT_TEMPLATE },
      { title: 'Services', page: 'services', sortOrder: 3, isVisible: true, html: SERVICES_TEMPLATE },
      { title: 'Contact',  page: 'contact',  sortOrder: 4, isVisible: true, html: CONTACT_TEMPLATE }
    ];

    from(menus).pipe(
      concatMap(m =>
        this.menuService.createMenu({
          organizationId: org.id, title: m.title,
          page: m.page, sortOrder: m.sortOrder, isVisible: m.isVisible
        }).pipe(
          concatMap(mi =>
            this.pageService.createPage({
              organizationId: org.id, menuItemId: mi.id,
              title: m.title, bodyHtml: m.html, status: 'Published'
            })
          )
        )
      ),
      toArray(),
      finalize(() => { this.isInitializing = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: () => { this.createdOrgSlug = org.slug; },
      error: (err) => {
        this.errorMessage = 'Created org, but failed to seed content: ' + (err.error?.message || err.message);
      }
    });
  }

  viewSite(): void {
    if (this.createdOrgSlug) this.router.navigate(['/site', this.createdOrgSlug]);
  }
}
