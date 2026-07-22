import { 
  HOME_TEMPLATE, 
  ABOUT_TEMPLATE, 
  SERVICES_TEMPLATE, 
  CONTACT_TEMPLATE 
} from './template-data';

export interface StaticSiteProfile {
  name: string;
  slug: string;
}

export interface StaticSitePage {
  title: string;
  bodyHtml: string;
}

export const STATIC_SITE_MENUS = [
  { id: '1', title: 'Home', page: 'home', isVisible: true, sortOrder: 1 },
  { id: '2', title: 'About', page: 'about', isVisible: true, sortOrder: 2 },
  { id: '3', title: 'Services', page: 'services', isVisible: true, sortOrder: 3 },
  { id: '4', title: 'Contact', page: 'contact', isVisible: true, sortOrder: 4 }
];

export function getStaticSiteProfile(orgSlug: string): StaticSiteProfile {
  const name = orgSlug ? orgSlug.charAt(0).toUpperCase() + orgSlug.slice(1).replace(/-/g, ' ') : 'Site';
  return { name, slug: orgSlug };
}

function homePage(orgSlug: string): StaticSitePage {
  return {
    title: 'Home',
    bodyHtml: HOME_TEMPLATE
  };
}

function aboutPage(orgSlug: string): StaticSitePage {
  return {
    title: 'About Us',
    bodyHtml: ABOUT_TEMPLATE
  };
}

function servicesPage(orgSlug: string): StaticSitePage {
  return {
    title: 'Our Services',
    bodyHtml: SERVICES_TEMPLATE
  };
}

function contactPage(orgSlug: string): StaticSitePage {
  return {
    title: 'Contact Us',
    bodyHtml: CONTACT_TEMPLATE
  };
}

const PAGE_BUILDERS: Record<string, (slug: string) => StaticSitePage> = {
  home: homePage,
  'about-us': aboutPage,
  about: aboutPage,
  services: servicesPage,
  'contact-us': contactPage,
  contact: contactPage
};

export function getStaticSitePage(orgSlug: string, pageSlug: string): StaticSitePage {
  const builder = PAGE_BUILDERS[pageSlug.toLowerCase()];
  return builder ? builder(orgSlug) : homePage(orgSlug);
}

export function useStaticSiteMode(): boolean {
  return false;
}
