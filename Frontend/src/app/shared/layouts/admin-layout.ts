import { Component, OnInit, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen flex transition-colors duration-300"
         style="background: var(--bg-base); color: var(--text-primary);">

      <!-- ── Sidebar ─────────────────────────────────────── -->
      <aside
        class="flex flex-col shadow-2xl transition-all duration-300 relative z-20"
        [class.w-72]="!sidebarCollapsed()"
        [class.w-16]="sidebarCollapsed()"
        style="background: var(--bg-sidebar);">

        <!-- Logo -->
        <div class="h-16 flex items-center gap-3 px-4 border-b shrink-0"
             style="border-color: rgba(255,255,255,.06);">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
               style="background: linear-gradient(135deg,#6366F1,#8B5CF6); box-shadow: 0 4px 12px rgba(99,102,241,.4);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
          </div>
          <span *ngIf="!sidebarCollapsed()"
                class="font-bold text-lg tracking-tight text-white whitespace-nowrap overflow-hidden transition-all">
            CMS
          </span>
          <!-- Collapse toggle -->
          <button (click)="toggleSidebar()" class="ml-auto p-1.5 rounded-lg transition-colors"
                  style="color:#64748B;"
                  onmouseenter="this.style.color='#F1F5F9'; this.style.background='rgba(255,255,255,.06)'"
                  onmouseleave="this.style.color='#64748B'; this.style.background=''">
            <svg class="w-4 h-4 transition-transform" [class.rotate-180]="sidebarCollapsed()"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">

          <!-- Main -->
          <p *ngIf="!sidebarCollapsed()"
             class="px-3 text-[10px] font-bold uppercase tracking-widest mb-2"
             style="color:#475569;">Main</p>

          <ng-container *ngFor="let item of mainNav">
            <a *ngIf="!item.adminOnly || isAdmin"
               [routerLink]="item.route"
               routerLinkActive="active"
               class="sidebar-link group"
               [title]="sidebarCollapsed() ? item.label : ''">
              <svg class="shrink-0" [class.mr-0]="sidebarCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   [style.marginRight]="sidebarCollapsed() ? '0' : ''">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()" class="truncate">{{ item.label }}</span>
            </a>
          </ng-container>

          <!-- Content -->
          <p *ngIf="!sidebarCollapsed()"
             class="px-3 text-[10px] font-bold uppercase tracking-widest mb-2 mt-5"
             style="color:#475569;">Content</p>

          <ng-container *ngFor="let item of contentNav">
            <a [routerLink]="item.route"
               routerLinkActive="active"
               class="sidebar-link group"
               [title]="sidebarCollapsed() ? item.label : ''">
              <svg class="shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   [style.marginRight]="sidebarCollapsed() ? '0' : '0.75rem'">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="item.icon"/>
              </svg>
              <span *ngIf="!sidebarCollapsed()" class="truncate">{{ item.label }}</span>
            </a>
          </ng-container>

        </nav>

        <!-- User Panel -->
        <div class="p-3 border-t shrink-0" style="border-color: rgba(255,255,255,.06); background: rgba(0,0,0,.2);">
          <div class="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors cursor-default"
               onmouseenter="this.style.background='rgba(255,255,255,.05)'"
               onmouseleave="this.style.background=''">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                 style="background: linear-gradient(135deg,#6366F1,#8B5CF6);">
              {{ roleInitial }}
            </div>
            <div *ngIf="!sidebarCollapsed()" class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ role }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
                <p class="text-xs" style="color:#64748B;">Online</p>
              </div>
            </div>
            <button *ngIf="!sidebarCollapsed()" (click)="logout()"
                    title="Logout"
                    class="p-2 rounded-lg transition-all"
                    style="color:#64748B;"
                    onmouseenter="this.style.color='#F87171'; this.style.background='rgba(239,68,68,.1)'"
                    onmouseleave="this.style.color='#64748B'; this.style.background=''">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- ── Main ────────────────────────────────────────── -->
      <main class="flex-1 flex flex-col overflow-hidden min-w-0">

        <!-- Topbar -->
        <header class="h-16 flex items-center justify-between px-6 sticky top-0 z-10 shrink-0 backdrop-blur-md transition-all"
                style="background: var(--bg-card); border-bottom: 1px solid var(--border-card);">

          <!-- Page Title -->
          <div class="flex items-center gap-3">
            <!-- Mobile menu (hidden on desktop) -->
            <button class="lg:hidden p-2 rounded-lg mr-1" (click)="toggleSidebar()"
                    style="color:var(--text-muted); background:var(--bg-base);">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <div>
              <h2 class="text-base font-bold" style="color:var(--text-primary)">{{ currentPageTitle }}</h2>
            </div>
          </div>

          <!-- Right actions -->
          <div class="flex items-center gap-3">
            <!-- Profile Info with Online Status & Logout -->
            <div class="hidden sm:flex items-center gap-3 pl-3"
                 style="border-left:1px solid var(--border-card);">
              <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                   style="background: linear-gradient(135deg,#6366F1,#8B5CF6);">
                {{ roleInitial }}
              </div>
              <div class="hidden md:block text-left min-w-0">
                <p class="text-sm font-semibold truncate" style="color:var(--text-primary);">{{ role }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot"></span>
                  <p class="text-xs" style="color:var(--text-muted);">Online</p>
                </div>
              </div>
              
              <!-- Logout Button -->
              <button (click)="logout()" title="Logout" class="p-2 rounded-lg transition-all ml-1"
                      style="color:var(--text-muted);"
                      onmouseenter="this.style.color='#F87171'; this.style.background='rgba(239,68,68,.1)'"
                      onmouseleave="this.style.color='var(--text-muted)'; this.style.background=''">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-auto bg-[var(--bg-base)]">
          <div class="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <router-outlet/>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  role        = '';
  roleInitial = '';
  isAdmin     = false;
  currentPageTitle = 'Dashboard Overview';

  sidebarCollapsed = signal(false);

  readonly mainNav: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
    },
    {
      label: 'Client Dashboard',
      route: '/admin/client-dashboard',
      adminOnly: true,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      label: 'Organizations',
      route: '/admin/organizations',
      adminOnly: true,
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },

    {
      label: 'Menus',
      route: '/admin/menus',
      adminOnly: true,
      icon: 'M4 6h16M4 12h16M4 18h16'
    }
  ];

  readonly contentNav: NavItem[] = [
    {
      label: 'Page Content',
      route: '/admin/pages',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    }
  ];

  private readonly routeTitleMap: Record<string, string> = {
    '/admin/dashboard':       'Dashboard Overview',
    '/admin/client-dashboard':'Client Dashboard',
    '/admin/organizations':   'Organizations',
    '/admin/users':           'User Management',
    '/admin/menus':           'Menu Manager',
    '/admin/pages':           'Page Content',
    '/admin/media':           'Media Library',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.role        = this.authService.getRole() || 'User';
    this.roleInitial = this.role.charAt(0).toUpperCase();
    this.isAdmin     = this.role === 'Admin';

    // Sync page title with route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url = e.urlAfterRedirects?.split('?')[0];
      this.currentPageTitle = this.routeTitleMap[url] || 'Admin Panel';
    });

    // Set initial title
    const current = this.router.url.split('?')[0];
    this.currentPageTitle = this.routeTitleMap[current] || 'Admin Panel';

    // Restore sidebar state
    if (isPlatformBrowser(this.platformId)) {
      this.sidebarCollapsed.set(localStorage.getItem('cms_sidebar_collapsed') === 'true');
    }
  }

  toggleSidebar(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cms_sidebar_collapsed', String(next));
    }
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
