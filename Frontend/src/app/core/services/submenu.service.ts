import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SubMenuItem } from './menu.service';

@Injectable({
  providedIn: 'root'
})
export class SubMenuService {
  private adminUrl = 'https://localhost:7170/api/admin/submenus';
  private publicUrl = 'https://localhost:7170/api/menus';

  constructor(private http: HttpClient) {}

  getSubMenus(menuItemId: string): Observable<SubMenuItem[]> {
    return this.http.get<any>(`${this.publicUrl}/${menuItemId}/submenus`).pipe(
      map(res => res?.data || res || [])
    );
  }

  createSubMenu(orgId: string, data: any): Observable<SubMenuItem> {
    data.organizationId = orgId;
    return this.http.post<any>(this.adminUrl, data).pipe(
      map(res => res?.data || res)
    );
  }

  updateSubMenu(id: string, data: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/${id}`, data);
  }

  deleteSubMenu(id: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }
}
