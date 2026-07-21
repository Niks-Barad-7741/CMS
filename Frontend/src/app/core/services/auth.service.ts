import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:7170'; // Changed to HTTP to avoid SSL certificate errors

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/Auth/login`, credentials);
  }

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  private decodeToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      let payload = token.split('.')[1];
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad) {
        payload += '='.repeat(4 - pad);
      }
      
      // Standard robust decoding for utf-8 inside JWT
      const binary = atob(payload);
      let utf8 = '';
      for (let i = 0; i < binary.length; i++) {
          utf8 += '%' + ('00' + binary.charCodeAt(i).toString(16)).slice(-2);
      }
      const decoded = decodeURIComponent(utf8);
      
      return JSON.parse(decoded);
    } catch (e) {
      console.error('JWT Decode Error:', e);
      return null;
    }
  }

  getRole(): string | null {
    const decoded = this.decodeToken();
    console.log('Decoded JWT Token:', decoded);
    const role = decoded ? (decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) : null;
    console.log('Evaluated Role:', role);
    return role;
  }

  getOrganizationId(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.OrganizationId : null;
  }
}
