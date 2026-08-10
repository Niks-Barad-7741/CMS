  /**
 * Corporate Services Template — Section[] data constant.
 *
 * This is PLAIN DATA, not a function. When applied to a page,
 * it MUST be cloned via cloneSectionsWithFreshIds() (Part 0)
 * to get unique IDs per page. See Part 5 (selectTemplate).
 *
 * 7 sections: Hero → Stats → Services → About → Testimonial → Gallery → CTA
 */

import { genId } from '../../utils/id-generator.util';

// --- Authoring helpers (only used to define the data below) ---

function makeSection(style: any, blocks: any[], sortOrder: number): any {
  return {
    id: genId('sec'),
    sortOrder,
    style: {
      backgroundType: 'color',
      backgroundColor: '#ffffff',
      backgroundImageUrl: '',
      overlayOpacity: 0,
      backgroundSize: 'cover',
      textColor: '#1a1a1a',
      paddingY: 'py-16',
      blockLayout: 'stack',
      ...style
    },
    blocks
  };
}

function makeBlock(type: string, content: any, style: any, sortOrder: number): any {
  return { id: genId('blk'), type, sortOrder, content, style };
}

// --- Template data ---

export const CORPORATE_TEMPLATE_SECTIONS: any[] = [
  // 1. Hero
  makeSection({ backgroundColor: '#0f172a', textColor: '#ffffff' }, [
    makeBlock('hero', {
      bgImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
      heading: 'Solutions Built for Growing Businesses',
      subtext: 'We help companies streamline operations and scale with confidence.',
      ctaText: 'Get a Free Consultation',
      ctaUrl: '#contact',
      overlayOpacity: 55
    }, {}, 0)
  ], 0),

  // 2. Why Choose Us — stats row
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Why Choose Us', level: 2, align: 'center' }, { fontSize: 'text-3xl', textColor: '#1a1a1a' }, 0),
    makeBlock('columns', {
      columns: [
        { title: '500+', text: 'Projects Delivered', cardLook: true },
        { title: '98%', text: 'Client Retention', cardLook: true },
        { title: '15+', text: 'Years of Experience', cardLook: true },
        { title: '24/7', text: 'Dedicated Support', cardLook: true }
      ],
      animation: 'None',
      staggerDelay: 100
    }, { gridCols: 'grid-cols-4', gapSize: 'Medium', valign: 'Top' }, 1)
  ], 1),

  // 3. Services (3-column grid)
  makeSection({ backgroundColor: '#f8fafc' }, [
    makeBlock('heading', { text: 'Our Services', level: 2, align: 'center' }, { fontSize: 'text-3xl', textColor: '#1a1a1a' }, 0),
    makeBlock('columns', {
      columns: [
        { title: 'Strategy Consulting', text: 'Roadmaps that align teams and cut wasted effort.', imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400', cardLook: true },
        { title: 'Implementation', text: 'Hands-on delivery from planning through launch.', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400', cardLook: true },
        { title: 'Ongoing Support', text: '24/7 monitoring and continuous optimization.', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400', cardLook: true }
      ],
      animation: 'None',
      staggerDelay: 150
    }, { gridCols: 'grid-cols-3', gapSize: 'Medium', valign: 'Top', imageAspectRatio: '4/3' }, 1)
  ], 2),

  // 4. About / Mission — image + text side-by-side via blockLayout:'row'
  makeSection({ backgroundColor: '#f8fafc', blockLayout: 'row' }, [
    makeBlock('image', {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800',
      caption: '', alt: 'Our team collaborating', title: '', linkUrl: '', linkNewTab: false,
      lightbox: false, animation: 'None', customCss: ''
    }, {
      displayMode: 'inline', objectFit: 'cover', aspectRatio: '4/3', maxWidth: 'Medium',
      borderRadius: 'Medium', boxShadow: 'Large', filterEffect: 'None', alignment: 'center',
      padding: 'None', margin: 'None', border: 'None', backgroundColor: '',
      responsiveBehavior: 'responsive', additionalClasses: '', hoverEffect: 'Subtle Zoom'
    }, 0),
    makeBlock('heading', { text: 'Built on Trust and Results', level: 2, align: 'left' }, { fontSize: 'text-3xl', textColor: '#1a1a1a' }, 1),
    makeBlock('paragraph', {
      text: 'For over a decade we\'ve partnered with growing companies to solve their toughest operational challenges, combining hands-on expertise with genuine investment in every client\'s success.',
      align: 'left'
    }, { fontSize: 'text-base', textColor: '#4b5563' }, 2)
  ], 3),

  // 5. Testimonial video card — sibling blocks + blockLayout:'row'
  makeSection({ backgroundColor: '#1a5c6b', textColor: '#ffffff', blockLayout: 'row' }, [
    makeBlock('video', {
      embedUrl: '',
      videoSource: 'SelfHosted',
      selfHostedUrl: '',
      posterUrl: '',
      autoplay: false, muted: false, loop: false, controls: true,
      lightboxMode: true,
      caption: '',
      animation: 'None'
    }, { aspectRatio: '1:1', maxWidth: 'Small', borderRadius: 'Full', customCss: 'border: 4px solid #cbd5e1;' }, 0),
    makeBlock('heading', { text: 'Jane Doe', level: 3, align: 'left' }, { fontSize: 'text-2xl', textColor: '#ffffff' }, 1),
    makeBlock('paragraph', { text: 'VP of Operations, Example Co.', align: 'left' }, { fontSize: 'text-base', textColor: '#e2e8f0' }, 2)
  ], 4),

  // 6. Recent Work — gallery
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Recent Work', level: 2, align: 'center' }, { fontSize: 'text-3xl', textColor: '#1a1a1a' }, 0),
    makeBlock('gallery', {
      images: [
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400', caption: 'Project One' },
        { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400', caption: 'Project Two' },
        { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400', caption: 'Project Three' }
      ]
    }, { gridCols: 'grid-cols-3' }, 1)
  ], 5),

  // 7. Closing CTA
  makeSection({ backgroundColor: '#0f172a', textColor: '#ffffff' }, [
    makeBlock('quote', {
      text: 'A satisfied customer is the best business strategy of all.',
      author: 'Michael LeBoeuf',
      avatarUrl: ''
    }, {}, 0),
    makeBlock('button', { label: 'Start Your Project', url: '#contact', style: 'primary', align: 'center' }, {}, 1)
  ], 6)
];
