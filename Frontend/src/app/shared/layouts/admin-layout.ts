import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 text-white flex flex-col">
        <div class="h-16 flex items-center px-6 bg-gray-950 font-bold text-xl space-x-3">
          <img src="assets/logo.jpg" alt="OrgCMS Logo" class="h-8 w-8 rounded shadow-lg border border-gray-700">
          <span>OrgCMS</span>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Dashboard
          </a>
          
          <ng-container *ngIf="isAdmin">
            <a routerLink="/admin/client-dashboard" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors text-indigo-300 font-semibold border-l-2 border-indigo-400 bg-indigo-900/20">
              👥 Client Dashboard
            </a>
            <a routerLink="/admin/organizations" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors">
              Organizations
            </a>
            <a routerLink="/admin/menus" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors">
              Shared Menus
            </a>
          </ng-container>

          <a routerLink="/admin/pages" routerLinkActive="bg-gray-800" class="block px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            Page Content
          </a>
        </nav>
        <div class="p-4 bg-gray-950">
          <button (click)="logout()" class="w-full text-left px-4 py-2 rounded hover:bg-gray-800 transition-colors text-red-400">
           Logout
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <header class="h-16 bg-white shadow-sm flex flex-col justify-center px-6">
          <span class="text-sm text-gray-500">Logged in as: <strong class="text-gray-900">{{ role }}</strong></span>
        </header>
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
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
