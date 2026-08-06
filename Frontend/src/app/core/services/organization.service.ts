import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  logoUrl?: string;
  footerDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialTwitter?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  navbarLayout?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl = 'https://localhost:7170/api/admin/organizations';

  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.baseUrl);
  }

  getOrganization(id: string): Observable<Organization> {
    return this.http.get<Organization>(`${this.baseUrl}/${id}`);
  }

  createOrganization(data: any): Observable<Organization> {
    return this.http.post<Organization>(this.baseUrl, data);
  }

  updateOrganization(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteOrganization(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  deactivateOrganization(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  updateLogo(orgId: string, logoUrl: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${orgId}/logo`, { logoUrl });
  }
}
