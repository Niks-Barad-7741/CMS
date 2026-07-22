import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationService, Organization } from '../../../core/services/organization.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-dashboard.component.html'
})
export class ClientDashboardComponent implements OnInit {
  organizations: Organization[] = [];
  loading = true;

  constructor(
    private orgService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load organizations', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  managePages(orgId: string) {
    this.router.navigate(['/admin/pages'], { queryParams: { orgId } });
  }
}
