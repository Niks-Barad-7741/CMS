import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MenuItem } from './menu.service';

export interface PageContent {
  id: string;
  organizationId: string;
  menuItemId: string;
  title: string;
  bodyHtml: string;
  status: string;
  sortOrder?: number;
  templateId?: string;
  contentJson?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PageService {
  private baseUrl = 'https://localhost:7170/api';

  constructor(private http: HttpClient) {}

  // Public Viewer
  getSiteProfile(orgSlug: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sites/${orgSlug}`);
  }

  getPublicPage(orgSlug: string, pageSlug: string): Observable<PageContent> {
    return this.http.get<PageContent>(`${this.baseUrl}/sites/${orgSlug}/pages/${pageSlug}`);
  }

  getPublicMenus(orgSlug: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.baseUrl}/sites/${orgSlug}/menus`);
  }

  // Admin / Client Editor
  getPagesForOrg(orgId: string): Observable<PageContent[]> {
    return this.http.get<PageContent[]>(`${this.baseUrl}/admin/organizations/${orgId}/pages`);
  }

  savePageContent(orgId: string, menuItemId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/organizations/${orgId}/pages/${menuItemId}`, data);
  }

  // Visual Builder API
  getPageById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/content/detail/${id}`);
  }

  createPage(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/content`, data);
  }

  updatePage(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/admin/content/${id}`, data);
  }
}
