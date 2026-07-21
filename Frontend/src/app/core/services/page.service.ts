import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PageContent {
  id: string;
  organizationId: string;
  menuItemId: string;
  title: string;
  bodyHtml: string;
  status: string;
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
    return this.http.get<any>(`${this.baseUrl}/sites/${orgSlug}/pages/${pageSlug}`).pipe(map(res => res.data));
  }

  // Admin / Client Editor
  getPagesForOrg(orgId: string): Observable<PageContent[]> {
    return this.http.get<any>(`${this.baseUrl}/admin/organizations/${orgId}/pages`).pipe(map(res => res.data));
  }

  savePageContent(orgId: string, menuItemId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/organizations/${orgId}/pages/${menuItemId}`, data);
  }
}
