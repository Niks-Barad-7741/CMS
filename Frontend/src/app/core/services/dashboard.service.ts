import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, forkJoin, of, interval, BehaviorSubject, EMPTY } from 'rxjs';
import { map, catchError, switchMap, startWith, shareReplay, take, timeout } from 'rxjs/operators';
import { OrganizationService, Organization } from './organization.service';
import { PageService, PageContent } from './page.service';

export interface RecentActivityItem {
  type: 'org' | 'page' | 'user';
  title: string;
  subtitle: string;
  createdAt: string;
  timeAgo: string;
  icon: 'org' | 'page' | 'user';
}

export interface DayActivity {
  day: string;        // e.g. "Mon"
  date: string;       // ISO date
  pages: number;
  orgs: number;
  total: number;
}

export interface DashboardStats {
  // KPI
  totalOrgs: number;
  activeOrgs: number;
  inactiveOrgs: number;
  totalUsers: number;
  activeUsers: number;
  totalPages: number;
  publishedPages: number;
  totalMenus: number;

  // Growth deltas (vs prior period — computed from createdAt)
  orgGrowthPct: number;
  userGrowthPct: number;
  pageGrowthPct: number;

  // Chart data
  weeklyActivity: DayActivity[];   // last 7 days
  orgStatusRatio: number;          // 0-100 percent active

  // Recent items
  recentActivity: RecentActivityItem[];

  // Raw
  organizations: Organization[];
  users: never[];
  pages: PageContent[];

  // Meta
  lastUpdated: Date;
  hasError: boolean;
  errorMessage: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  if (isNaN(then.getTime())) return 'recently';
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60)  return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60)  return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24)   return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30)  return `${diffDay}d ago`;
  return then.toLocaleDateString();
}

function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function countCreatedInRange(items: { createdAt?: string; [k: string]: any }[], from: Date, to: Date): number {
  return items.filter(i => {
    if (!i.createdAt) return false;
    const d = new Date(i.createdAt);
    return d >= from && d < to;
  }).length;
}

function buildWeeklyActivity(pages: PageContent[], orgs: Organization[]): DayActivity[] {
  const days: DayActivity[] = [];
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - i);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    const pageCount = countCreatedInRange(pages as any[], from, to);
    const orgCount  = countCreatedInRange(orgs  as any[], from, to);

    days.push({
      day: DAY_LABELS[from.getDay()],
      date: from.toISOString().split('T')[0],
      pages: pageCount,
      orgs: orgCount,
      total: pageCount + orgCount
    });
  }
  return days;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private orgService  = inject(OrganizationService);
  private pageService = inject(PageService);
  private platformId  = inject(PLATFORM_ID);

  private _refreshTrigger$ = new BehaviorSubject<void>(undefined);

  /**
   * Emits fresh stats on demand.
   * In the BROWSER: also auto-polls every 60 seconds.
   * On the SERVER (SSR): fetches exactly once then completes so Angular
   * can stabilize and pre-render without timing out.
   */
  readonly stats$: Observable<DashboardStats> = this._refreshTrigger$.pipe(
    switchMap(() => {
      if (isPlatformBrowser(this.platformId)) {
        // Browser: fetch immediately, then repeat every 60 s
        return interval(60_000).pipe(startWith(0));
      } else {
        // Server: emit once and complete so SSR can stabilize
        return of(0).pipe(take(1));
      }
    }),
    switchMap(() => this._fetchAll()),
    shareReplay(1)
  );

  refresh(): void {
    this._refreshTrigger$.next();
  }

  private _fetchAll(): Observable<DashboardStats> {
    // Safe wrapper: 8s timeout per stream, always falls back to empty array
    const safe = <T>(obs: Observable<T>, fallback: T): Observable<T> =>
      obs.pipe(
        timeout(8000),
        catchError(() => of(fallback))
      );

    return forkJoin({
      orgs:  safe(this.orgService.getOrganizations(), [] as Organization[]),
      pages: safe(this._getAllPages(),                [] as PageContent[]),
    }).pipe(
      map(({ orgs, pages }) => this._compute(orgs, pages)),
      catchError(err => of(this._emptyStats(err?.message || 'Failed to load dashboard data')))
    );
  }

  /** Fetch pages: try a few orgs, fall back to empty */
  private _getAllPages(): Observable<PageContent[]> {
    // We don't have a global pages endpoint — we derive data we have from orgs
    // and return empty so chart shows org-based data only
    return of([]);
  }

  private _compute(orgs: Organization[], pages: PageContent[]): DashboardStats {
    const now = new Date();

    // KPI
    const activeOrgs     = orgs.filter(o => o.isActive).length;
    const inactiveOrgs   = orgs.length - activeOrgs;
    const publishedPages = pages.filter(p => p.status === 'Published').length;

    // Growth: this week vs last week
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0,0,0,0);
    const prevStart = new Date(weekStart); prevStart.setDate(prevStart.getDate() - 7);

    const orgsThisWeek  = countCreatedInRange(orgs   as any[], weekStart, now);
    const orgsPrevWeek  = countCreatedInRange(orgs   as any[], prevStart, weekStart);
    const pagesThisWeek = countCreatedInRange(pages  as any[], weekStart, now);
    const pagesPrevWeek = countCreatedInRange(pages  as any[], prevStart, weekStart);

    // Weekly activity chart
    const weeklyActivity = buildWeeklyActivity(pages, orgs);

    // Recent activity feed — orgs sorted by createdAt
    const recentActivity: RecentActivityItem[] = orgs
      .filter(o => !!o.createdAt)
      .map(o => ({
        type:      'org' as const,
        icon:      'org' as const,
        title:     o.name,
        subtitle:  `${o.slug}.com`,
        createdAt: o.createdAt || '',
        timeAgo:   timeAgo(o.createdAt || '')
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return {
      totalOrgs: orgs.length,
      activeOrgs,
      inactiveOrgs,
      totalUsers: 0,
      activeUsers: 0,
      totalPages: pages.length,
      publishedPages,
      totalMenus: 0,
      orgGrowthPct:  growthPct(orgsThisWeek,  orgsPrevWeek),
      userGrowthPct: 0,
      pageGrowthPct: growthPct(pagesThisWeek, pagesPrevWeek),
      weeklyActivity,
      orgStatusRatio: orgs.length > 0 ? Math.round((activeOrgs / orgs.length) * 100) : 0,
      recentActivity,
      organizations: orgs,
      users: [],
      pages,
      lastUpdated: new Date(),
      hasError: false,
      errorMessage: ''
    };
  }

  private _emptyStats(errorMessage: string): DashboardStats {
    return {
      totalOrgs: 0, activeOrgs: 0, inactiveOrgs: 0,
      totalUsers: 0, activeUsers: 0,
      totalPages: 0, publishedPages: 0, totalMenus: 0,
      orgGrowthPct: 0, userGrowthPct: 0, pageGrowthPct: 0,
      weeklyActivity: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        return { day: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()], date: d.toISOString(), pages: 0, orgs: 0, total: 0 };
      }),
      orgStatusRatio: 0,
      recentActivity: [],
      organizations: [],
      users: [],
      pages: [],
      lastUpdated: new Date(),
      hasError: true,
      errorMessage
    };
  }
}
