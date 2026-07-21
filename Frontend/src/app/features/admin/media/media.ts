import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MediaService, Media } from '../../../core/services/media.service';
import { OrganizationService, Organization } from '../../../core/services/organization.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './media.html'
})
export class MediaComponent implements OnInit {
  mediaFiles: Media[] = [];
  organizations: Organization[] = [];
  
  role: string | null = '';
  clientOrgId: string | null = null;
  selectedOrgId: string | null = null;

  isUploading = false;
  selectedFile: File | null = null;
  
  // Replace with the actual URL where images are served by .NET backend
  apiBaseUrl = 'https://localhost:7170'; 

  constructor(
    private mediaService: MediaService,
    private orgService: OrganizationService,
    private authService: AuthService
  ) {
    this.role = this.authService.getRole();
    this.clientOrgId = this.authService.getOrganizationId();
  }

  ngOnInit() {
    if (this.role === 'Admin') {
      this.loadOrganizations();
    } else {
      this.selectedOrgId = this.clientOrgId;
      this.loadMedia();
    }
  }

  loadOrganizations() {
    this.orgService.getOrganizations().subscribe(data => this.organizations = data);
  }

  onOrgChange() {
    if (this.selectedOrgId) {
      this.loadMedia();
    } else {
      this.mediaFiles = [];
    }
  }

  loadMedia() {
    if (!this.selectedOrgId) return;
    this.mediaService.getMediaForOrg(this.selectedOrgId).subscribe({
      next: (data) => this.mediaFiles = data
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  uploadFile() {
    if (!this.selectedOrgId || !this.selectedFile) return;

    this.isUploading = true;
    this.mediaService.uploadMedia(this.selectedOrgId, this.selectedFile).subscribe({
      next: (newMedia) => {
        this.mediaFiles.unshift(newMedia);
        this.isUploading = false;
        this.selectedFile = null;
        // reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: () => {
        alert('Failed to upload file.');
        this.isUploading = false;
      }
    });
  }

  copyUrl(path: string) {
    const url = `${this.apiBaseUrl}${path}`;
    navigator.clipboard.writeText(url).then(() => alert('Copied to clipboard!'));
  }
}
