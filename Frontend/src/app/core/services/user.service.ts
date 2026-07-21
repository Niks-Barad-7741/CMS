import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://localhost:7170/api/admin/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.baseUrl).pipe(map(res => res.data));
  }

  createUser(data: any): Observable<User> {
    return this.http.post<any>(this.baseUrl, data).pipe(map(res => res.data));
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
