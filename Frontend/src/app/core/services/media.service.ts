import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Media {
  id: string;
  organizationId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSizeBytes: number;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private baseUrl = 'https://localhost:7170/api/admin';

  constructor(private http: HttpClient) {}

  getMediaForOrg(orgId: string): Observable<Media[]> {
    return this.http.get<any>(`${this.baseUrl}/Media/organization/${orgId}`).pipe(map(res => res.data));
  }

  uploadMedia(orgId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('OrganizationId', orgId);
    formData.append('File', file);
    return this.http.post<any>(`${this.baseUrl}/Media/upload`, formData);
  }
}
