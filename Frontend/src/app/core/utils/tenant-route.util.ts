import { ActivatedRoute } from '@angular/router';

export function resolveOrgSlug(route: ActivatedRoute, subdomainSlug: string | null): string {
  let current: ActivatedRoute | null = route;
  while (current) {
    const slug = current.snapshot.paramMap.get('orgSlug');
    if (slug) return slug;
    current = current.parent;
  }
  return subdomainSlug || '';
}

export function isPathBasedSite(route: ActivatedRoute): boolean {
  let current: ActivatedRoute | null = route;
  while (current) {
    if (current.snapshot.paramMap.has('orgSlug')) return true;
    current = current.parent;
  }
  return false;
}
