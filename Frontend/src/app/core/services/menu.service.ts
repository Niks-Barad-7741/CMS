import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SubMenuItem {
  id: string;
  menuItemId: string;
  title: string;
  page: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface MenuItem {
  id: string;
  title: string;
  page: string;
  sortOrder: number;
  isVisible: boolean;
  subMenuItems?: SubMenuItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private publicUrl = 'https://localhost:7170/api/menus';
  private adminUrl = 'https://localhost:7170/api/admin/menus';

  constructor(private http: HttpClient) {}

  getMenus(): Observable<MenuItem[]> {
    return this.http.get<any>(this.publicUrl).pipe(
      map(res => res?.data || res || [])
    );
  }

  createMenu(data: any): Observable<MenuItem> {
    return this.http.post<MenuItem>(this.adminUrl, data);
  }

  updateMenu(id: string, data: any): Observable<any> {
    return this.http.put(`${this.adminUrl}/${id}`, data);
  }

  deleteMenu(id: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/${id}`);
  }
}
