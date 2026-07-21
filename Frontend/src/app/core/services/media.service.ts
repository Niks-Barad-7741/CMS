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
  private baseUrl = 'https://localhost:7170/api/admin/organizations';

  constructor(private http: HttpClient) {}

  getMediaForOrg(orgId: string): Observable<Media[]> {
    return this.http.get<any>(`${this.baseUrl}/${orgId}/media`).pipe(map(res => res.data));
  }

  uploadMedia(orgId: string, file: File): Observable<Media> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.baseUrl}/${orgId}/media`, formData).pipe(map(res => res.data));
  }
}
