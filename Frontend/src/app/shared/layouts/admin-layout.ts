import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex font-sans text-gray-800">
      <!-- Sidebar -->
      <aside class="w-72 bg-[#0B1121] text-gray-300 flex flex-col shadow-2xl relative z-20 transition-all duration-300">
        <div class="h-20 flex items-center px-6 border-b border-gray-800/50 bg-[#0B1121] font-bold text-2xl space-x-4">
          <div class="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <img src="assets/logo.jpg" alt="OrgCMS" class="h-8 w-8 rounded mix-blend-screen object-cover">
          </div>
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">OrgCMS</span>
        </div>
        
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          <p class="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-2">Main Menu</p>
          
          <a routerLink="/admin/dashboard" routerLinkActive="bg-indigo-900/40 text-white border-indigo-500 shadow-sm" class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group border-l-4 border-transparent text-gray-400 hover:text-gray-100 font-medium">
            <svg class="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </a>
          
          <ng-container *ngIf="isAdmin">
            <a routerLink="/admin/client-dashboard" routerLinkActive="bg-indigo-900/40 text-white border-indigo-500 shadow-sm" class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group border-l-4 border-transparent text-gray-400 hover:text-gray-100 font-medium mt-1">
              <svg class="w-5 h-5 mr-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Client Dashboard
            </a>
            <a routerLink="/admin/organizations" routerLinkActive="bg-indigo-900/40 text-white border-indigo-500 shadow-sm" class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group border-l-4 border-transparent text-gray-400 hover:text-gray-100 font-medium mt-1">
              <svg class="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              Organizations
            </a>
            <a routerLink="/admin/menus" routerLinkActive="bg-indigo-900/40 text-white border-indigo-500 shadow-sm" class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group border-l-4 border-transparent text-gray-400 hover:text-gray-100 font-medium mt-1">
              <svg class="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              Shared Menus
            </a>
          </ng-container>

          <p class="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 mt-6">Content</p>

          <a routerLink="/admin/pages" routerLinkActive="bg-indigo-900/40 text-white border-indigo-500 shadow-sm" class="flex items-center px-4 py-3 rounded-xl hover:bg-gray-800/50 transition-all group border-l-4 border-transparent text-gray-400 hover:text-gray-100 font-medium mt-1">
            <svg class="w-5 h-5 mr-3 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Page Content
          </a>
        </nav>
        
        <div class="p-5 border-t border-gray-800/50 bg-[#070b16]">
          <div class="bg-gray-800/40 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-800/70 transition-colors border border-gray-700/50 shadow-inner">
            <div class="flex items-center space-x-3">
               <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {{ role.charAt(0).toUpperCase() }}
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-semibold text-white truncate">{{ role }}</p>
                <div class="flex items-center">
                  <span class="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                  <p class="text-xs text-gray-400">Online</p>
                </div>
              </div>
            </div>
            <button (click)="logout()" class="text-gray-400 hover:text-red-400 transition-colors p-2.5 rounded-lg hover:bg-red-400/10 focus:outline-none focus:ring-2 focus:ring-red-500/50" title="Logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        <!-- Background decorative elements -->
        <div class="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 pointer-events-none"></div>
        
        <!-- Header -->
        <header class="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200/80 shadow-sm flex items-center justify-between px-8 sticky top-0 z-10 transition-all duration-300">
          <div class="flex items-center space-x-4">
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h2>
          </div>
          
          <div class="flex items-center space-x-6">
            <!-- Search -->
            <div class="relative hidden md:block group">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input type="text" class="w-72 pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm outline-none shadow-inner text-gray-700" placeholder="Search across organization...">
              <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">⌘K</span>
              </div>
            </div>
            
            <!-- Notifications -->
            <button class="relative p-2.5 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 focus:outline-none">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
            </button>
            
            <!-- Profile -->
            <div class="flex items-center space-x-3 pl-5 border-l border-gray-200 cursor-pointer group">
              <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all ring-2 ring-white">
                {{ role.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-col hidden sm:flex">
                <span class="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{{ role }}</span>
                <span class="text-xs text-gray-400 font-medium">Workspace Admin</span>
              </div>
              <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </header>
        
        <!-- Page Content -->
        <div class="flex-1 overflow-auto p-8 relative z-0">
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  isAdmin = false;
  role = '';

  constructor(private authService: AuthService) {
    this.role = this.authService.getRole() || 'Unknown';
    this.isAdmin = this.role === 'Admin';
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login'; // Force a full reload to reset state
  }
}
