import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, forkJoin, of, interval, BehaviorSubject, EMPTY, combineLatest } from 'rxjs';
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
  weeklyActivity: DayActivity[];   // 24hrs, 7 days, or 30 days
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
  const then = parseUtcDate(dateStr);
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

function parseUtcDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  let dStr = dateStr;
  if (/T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(dStr)) {
    dStr += 'Z';
  }
  return new Date(dStr);
}

function countCreatedInRange(items: { createdAt?: string; [k: string]: any }[], from: Date, to: Date): number {
  return items.filter(i => {
    if (!i.createdAt) return false;
    const d = parseUtcDate(i.createdAt);
    return d >= from && d < to;
  }).length;
}

function buildActivityChart(pages: PageContent[], orgs: Organization[], period: 'Day' | 'Week' | 'Month'): DayActivity[] {
  const points: DayActivity[] = [];
  const now = new Date();

  if (period === 'Day') {
    for (let i = 23; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(now.getHours() - i, 0, 0, 0);
      const to = new Date(from);
      to.setHours(to.getHours() + 1);

      const pageCount = countCreatedInRange(pages as any[], from, to);
      const orgCount  = countCreatedInRange(orgs  as any[], from, to);

      let label = from.getHours() + ':00';
      if (from.getHours() === 0) label = '12am';
      else if (from.getHours() === 12) label = '12pm';
      else if (from.getHours() > 12) label = (from.getHours() - 12) + 'pm';
      else label = from.getHours() + 'am';

      points.push({
        day: label,
        date: from.toISOString(),
        pages: pageCount,
        orgs: orgCount,
        total: pageCount + orgCount
      });
    }
  } else if (period === 'Week') {
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - i);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);

      const pageCount = countCreatedInRange(pages as any[], from, to);
      const orgCount  = countCreatedInRange(orgs  as any[], from, to);

      points.push({
        day: DAY_LABELS[from.getDay()],
        date: from.toISOString().split('T')[0],
        pages: pageCount,
        orgs: orgCount,
        total: pageCount + orgCount
      });
    }
  } else {
    for (let i = 29; i >= 0; i--) {
      const from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - i);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);

      const pageCount = countCreatedInRange(pages as any[], from, to);
      const orgCount  = countCreatedInRange(orgs  as any[], from, to);

      points.push({
        day: from.getDate().toString(),
        date: from.toISOString().split('T')[0],
        pages: pageCount,
        orgs: orgCount,
        total: pageCount + orgCount
      });
    }
  }
  return points;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private orgService  = inject(OrganizationService);
  private pageService = inject(PageService);
  private platformId  = inject(PLATFORM_ID);

  private _refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private _period$ = new BehaviorSubject<'Day' | 'Week' | 'Month'>('Week');

  setPeriod(period: 'Day' | 'Week' | 'Month'): void {
    this._period$.next(period);
  }

  private _raw$ = this._refreshTrigger$.pipe(
    switchMap(() => {
      if (isPlatformBrowser(this.platformId)) {
        return interval(60_000).pipe(startWith(0));
      } else {
        return of(0).pipe(take(1));
      }
    }),
    switchMap(() => {
      const safe = <T>(obs: Observable<T>, fallback: T): Observable<T> =>
        obs.pipe(
          timeout(8000),
          catchError(() => of(fallback))
        );
      return forkJoin({
        orgs:  safe(this.orgService.getOrganizations(), [] as Organization[]),
        pages: safe(this._getAllPages(),                [] as PageContent[]),
      });
    }),
    shareReplay(1)
  );

  readonly stats$: Observable<DashboardStats> = combineLatest([
    this._raw$,
    this._period$
  ]).pipe(
    map(([{ orgs, pages }, period]) => this._compute(orgs, pages, period)),
    catchError(err => of(this._emptyStats(err?.message || 'Failed to load dashboard data')))
  );

  refresh(): void {
    this._refreshTrigger$.next();
  }

  /** Fetch pages: try a few orgs, fall back to empty */
  private _getAllPages(): Observable<PageContent[]> {
    return of([]);
  }

  private _compute(orgs: Organization[], pages: PageContent[], period: 'Day'|'Week'|'Month'): DashboardStats {
    const now = new Date();

    // KPI
    const activeOrgs     = orgs.filter(o => o.isActive).length;
    const inactiveOrgs   = orgs.length - activeOrgs;
    const publishedPages = pages.filter(p => p.status === 'Published').length;

    // Growth: calculate based on period
    let currentStart = new Date(now);
    let prevStart = new Date(now);

    if (period === 'Day') {
      currentStart.setHours(now.getHours() - 24);
      prevStart.setHours(currentStart.getHours() - 24);
    } else if (period === 'Week') {
      currentStart.setDate(now.getDate() - 7);
      prevStart.setDate(currentStart.getDate() - 7);
    } else {
      currentStart.setDate(now.getDate() - 30);
      prevStart.setDate(currentStart.getDate() - 30);
    }

    const orgsCurrent  = countCreatedInRange(orgs   as any[], currentStart, now);
    const orgsPrev     = countCreatedInRange(orgs   as any[], prevStart, currentStart);
    const pagesCurrent = countCreatedInRange(pages  as any[], currentStart, now);
    const pagesPrev    = countCreatedInRange(pages  as any[], prevStart, currentStart);

    // Chart
    const weeklyActivity = buildActivityChart(pages, orgs, period);

    // Recent activity feed — orgs sorted by createdAt
    const recentActivity: RecentActivityItem[] = orgs
      .filter(o => !!o.createdAt)
      .map(o => ({
        type:      'org' as const,
        icon:      'org' as const,
        title:     o.name,
        subtitle: `${o.slug}.com`,
        createdAt: o.createdAt || '',
        timeAgo:   timeAgo(o.createdAt || '')
      }))
      .sort((a, b) => parseUtcDate(b.createdAt).getTime() - parseUtcDate(a.createdAt).getTime())
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
      orgGrowthPct:  growthPct(orgsCurrent,  orgsPrev),
      userGrowthPct: 0,
      pageGrowthPct: growthPct(pagesCurrent, pagesPrev),
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
