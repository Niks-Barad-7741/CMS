export function buildCorporateServicesTemplate(): any[] {
  const ts = Date.now();
  const secId = (n: number) => `sec-${ts}-${n}`;
  const blkId = (s: number, b: number) => `blk-${ts}-${s}-${b}`;

  return [
    // ── Section 1: Hero ──
    {
      id: secId(1),
      sortOrder: 1,
      style: {
        backgroundType: 'color',
        backgroundColor: '#0f172a',
        paddingTop: 'pt-0',
        paddingBottom: 'pb-0',
        textColor: '#ffffff'
      },
      blocks: [
        {
          id: blkId(1, 1),
          type: 'hero',
          sortOrder: 1,
          content: {
            bgType: 'image',
            bgImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
            overlayOpacity: 65,
            overlayColor: '#0f172a',
            headingTag: 'h1',
            eyebrow: 'Enterprise Solutions',
            heading: 'Build something extraordinary',
            subtext: 'We help ambitious companies scale with custom technology, strategic consulting, and world-class engineering talent.',
            ctaText: 'Get Started',
            ctaUrl: '/contact',
            ctaStyle: 'primary',
            secCtaText: 'Our Services',
            secCtaUrl: '#services',
            secCtaStyle: 'outline',
            align: 'center',
            animation: 'Slide Up'
          },
          style: {
            minHeightType: '100vh',
            headingFontSize: 'X-Large',
            contentMaxWidth: 'Full'
          }
        }
      ]
    },

    // ── Section 2: Stats Bar ──
    {
      id: secId(2),
      sortOrder: 2,
      style: {
        backgroundType: 'color',
        backgroundColor: '#0f172a',
        paddingTop: 'pt-16',
        paddingBottom: 'pb-16',
        textColor: '#ffffff'
      },
      blocks: [
        {
          id: blkId(2, 1),
          type: 'columns',
          sortOrder: 1,
          content: {
            columns: [
              { title: '150+', text: 'Projects Delivered', align: 'center' },
              { title: '98%', text: 'Client Retention', align: 'center' },
              { title: '12+', text: 'Years of Experience', align: 'center' },
              { title: '24/7', text: 'Dedicated Support', align: 'center' }
            ]
          },
          style: {
            gridCols: 'grid-cols-4',
            colsTablet: 'md:grid-cols-2',
            colsMobile: 'grid-cols-2',
            gapSize: 'Large',
            valign: 'Middle'
          }
        }
      ]
    },

    // ── Section 3: Capabilities (split layout) ──
    {
      id: secId(3),
      sortOrder: 3,
      style: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#1e293b'
      },
      blocks: [
        {
          id: blkId(3, 1),
          type: 'columns',
          sortOrder: 1,
          content: {
            columns: [
              {
                blocks: [
                  {
                    type: 'paragraph',
                    content: { text: 'What We Do', align: 'left' },
                    style: { fontSize: 'text-sm', textColor: '#6366f1', additionalClasses: 'uppercase tracking-widest font-bold' }
                  },
                  {
                    type: 'heading',
                    content: { text: 'End-to-end capabilities for modern businesses', level: 2, align: 'left' },
                    style: { fontSize: 'text-4xl', textColor: '#0f172a' }
                  },
                  {
                    type: 'paragraph',
                    content: { text: 'From strategy and design to engineering and ongoing support, we provide a full spectrum of services that help organizations innovate faster and operate smarter.', align: 'left' },
                    style: { fontSize: 'text-lg', textColor: '#475569', lineHeight: 'Relaxed' }
                  }
                ]
              },
              {
                blocks: [
                  {
                    type: 'image',
                    content: { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', alt: 'Team collaborating' },
                    style: { borderRadius: 'Medium', boxShadow: 'Large', hoverEffect: 'Subtle Zoom' }
                  }
                ]
              }
            ]
          },
          style: {
            gridCols: 'grid-cols-2',
            colsTablet: 'md:grid-cols-1',
            colsMobile: 'grid-cols-1',
            gapSize: 'Large',
            valign: 'Middle'
          }
        }
      ]
    },

    // ── Section 4: Services Grid ──
    {
      id: secId(4),
      sortOrder: 4,
      style: {
        backgroundType: 'color',
        backgroundColor: '#f8fafc',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#1e293b'
      },
      blocks: [
        {
          id: blkId(4, 1),
          type: 'paragraph',
          sortOrder: 1,
          content: { text: 'Our Services', align: 'center' },
          style: { fontSize: 'text-sm', textColor: '#6366f1' }
        },
        {
          id: blkId(4, 2),
          type: 'heading',
          sortOrder: 2,
          content: { text: 'Solutions tailored to your goals', level: 2, align: 'center' },
          style: { fontSize: 'text-4xl', textColor: '#0f172a' }
        },
        {
          id: blkId(4, 3),
          type: 'paragraph',
          sortOrder: 3,
          content: { text: 'We combine deep industry expertise with cutting-edge technology to deliver results that matter.', align: 'center' },
          style: { fontSize: 'text-lg', textColor: '#64748b', maxWidth: 'Medium' }
        },
        {
          id: blkId(4, 4),
          type: 'columns',
          sortOrder: 4,
          content: {
            columns: [
              { title: 'Digital Strategy', text: 'Transform your vision into a clear, actionable roadmap with measurable milestones.', icon: 'Arrow', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' },
              { title: 'Cloud Engineering', text: 'Build resilient, scalable cloud infrastructure that grows with your business.', icon: 'Download', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' },
              { title: 'Product Design', text: 'Create intuitive, beautiful interfaces that delight users and drive engagement.', icon: 'Play', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' },
              { title: 'Custom Development', text: 'Full-stack engineering teams embedded in your workflow, delivering production-ready code.', icon: 'Info', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' },
              { title: 'Data & Analytics', text: 'Unlock insights from your data with modern pipelines, dashboards, and ML models.', icon: 'Envelope', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' },
              { title: 'Managed Services', text: '24/7 monitoring, maintenance, and support so you can focus on what matters most.', icon: 'Info', cardLook: true, align: 'left', btnText: 'Learn More', btnUrl: '#' }
            ],
            animation: 'Fade In',
            staggerDelay: 100
          },
          style: {
            gridCols: 'grid-cols-3',
            colsTablet: 'md:grid-cols-2',
            colsMobile: 'grid-cols-1',
            gapSize: 'Large'
          }
        }
      ]
    },

    // ── Section 5: Featured Work (Gallery) ──
    {
      id: secId(5),
      sortOrder: 5,
      style: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#1e293b'
      },
      blocks: [
        {
          id: blkId(5, 1),
          type: 'paragraph',
          sortOrder: 1,
          content: { text: 'Portfolio', align: 'center' },
          style: { fontSize: 'text-sm', textColor: '#6366f1' }
        },
        {
          id: blkId(5, 2),
          type: 'heading',
          sortOrder: 2,
          content: { text: 'Featured work we\'re proud of', level: 2, align: 'center' },
          style: { fontSize: 'text-4xl', textColor: '#0f172a' }
        },
        {
          id: blkId(5, 3),
          type: 'gallery',
          sortOrder: 3,
          content: {
            images: [
              { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', caption: 'Analytics Dashboard', category: 'Web App', alt: 'Dashboard project' },
              { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', caption: 'Developer Platform', category: 'SaaS', alt: 'Platform project' },
              { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80', caption: 'Enterprise Suite', category: 'Enterprise', alt: 'Enterprise project' }
            ],
            lightbox: true
          },
          style: {
            galleryStyle: 'Overlay Card',
            colsDesktop: 'grid-cols-3',
            colsTablet: 'md:grid-cols-2',
            colsMobile: 'grid-cols-1',
            imageGap: 'Large'
          }
        },
        {
          id: blkId(5, 4),
          type: 'button',
          sortOrder: 4,
          content: { label: 'View All Projects', url: '#', style: 'outline', align: 'center', size: 'Medium', icon: 'Arrow', iconPosition: 'Right' },
          style: { borderRadius: 'Pill', hoverEffect: 'Lift' }
        }
      ]
    },

    // ── Section 6: Why Choose Us (split layout, reversed) ──
    {
      id: secId(6),
      sortOrder: 6,
      style: {
        backgroundType: 'color',
        backgroundColor: '#f1f5f9',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#1e293b'
      },
      blocks: [
        {
          id: blkId(6, 1),
          type: 'columns',
          sortOrder: 1,
          content: {
            columns: [
              {
                blocks: [
                  {
                    type: 'image',
                    content: { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80', alt: 'Strategy session' },
                    style: { borderRadius: 'Medium', boxShadow: 'Large', hoverEffect: 'Subtle Zoom' }
                  }
                ]
              },
              {
                blocks: [
                  {
                    type: 'paragraph',
                    content: { text: 'Why Us', align: 'left' },
                    style: { fontSize: 'text-sm', textColor: '#6366f1', additionalClasses: 'uppercase tracking-widest font-bold' }
                  },
                  {
                    type: 'heading',
                    content: { text: 'A partner you can trust', level: 2, align: 'left' },
                    style: { fontSize: 'text-4xl', textColor: '#0f172a' }
                  },
                  {
                    type: 'paragraph',
                    content: { text: 'We don\'t just build software — we build relationships. Our transparent process, dedicated teams, and commitment to quality have earned us the trust of companies around the globe.', align: 'left' },
                    style: { fontSize: 'text-lg', textColor: '#475569', lineHeight: 'Relaxed' }
                  }
                ]
              }
            ]
          },
          style: {
            gridCols: 'grid-cols-2',
            colsTablet: 'md:grid-cols-1',
            colsMobile: 'grid-cols-1',
            gapSize: 'Large',
            valign: 'Middle',
            widthRatio: '40/60'
          }
        }
      ]
    },

    // ── Section 7: Testimonial (Video + Quote) ──
    {
      id: secId(7),
      sortOrder: 7,
      style: {
        backgroundType: 'color',
        backgroundColor: '#ffffff',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#1e293b'
      },
      blocks: [
        {
          id: blkId(7, 1),
          type: 'heading',
          sortOrder: 1,
          content: { text: 'What our clients say', level: 2, align: 'center' },
          style: { fontSize: 'text-4xl', textColor: '#0f172a' }
        },
        {
          id: blkId(7, 2),
          type: 'columns',
          sortOrder: 2,
          content: {
            columns: [
              {
                blocks: [
                  {
                    type: 'video',
                    content: {
                      videoSource: 'Embed',
                      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                      posterUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
                      lightboxMode: true,
                      caption: 'Hear from our clients',
                      aspectRatio: '16:9'
                    },
                    style: { maxWidth: 'Full', borderRadius: 'Medium' }
                  }
                ]
              },
              {
                blocks: [
                  {
                    type: 'quote',
                    content: {
                      text: 'Working with this team transformed our entire digital infrastructure. Their technical expertise and strategic thinking helped us achieve results we didn\'t think were possible.',
                      author: 'Alexandra Reid',
                      authorTitle: 'VP of Engineering, Nexus Corp',
                      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                      avatarPos: 'Left of Name',
                      showQuoteIcon: true,
                      rating: '5',
                      align: 'left',
                      isItalic: true
                    },
                    style: { quoteStyle: 'Card', fontSize: 'Large' }
                  }
                ]
              }
            ]
          },
          style: {
            gridCols: 'grid-cols-2',
            colsTablet: 'md:grid-cols-1',
            colsMobile: 'grid-cols-1',
            gapSize: 'Large',
            valign: 'Middle'
          }
        }
      ]
    },

    // ── Section 8: CTA Banner ──
    {
      id: secId(8),
      sortOrder: 8,
      style: {
        backgroundType: 'color',
        backgroundColor: '#0f172a',
        paddingTop: 'pt-24',
        paddingBottom: 'pb-24',
        textColor: '#ffffff'
      },
      blocks: [
        {
          id: blkId(8, 1),
          type: 'heading',
          sortOrder: 1,
          content: { text: 'Ready to transform your business?', level: 2, align: 'center' },
          style: { fontSize: 'text-5xl', textColor: '#ffffff' }
        },
        {
          id: blkId(8, 2),
          type: 'paragraph',
          sortOrder: 2,
          content: { text: 'Let\'s discuss how we can help you achieve your goals. Book a free consultation with our team today.', align: 'center' },
          style: { fontSize: 'text-xl', textColor: '#94a3b8', maxWidth: 'Medium' }
        },
        {
          id: blkId(8, 3),
          type: 'button',
          sortOrder: 3,
          content: { label: 'Schedule a Call', url: '/contact', style: 'primary', align: 'center', size: 'Large', icon: 'Arrow', iconPosition: 'Right' },
          style: { borderRadius: 'Pill', hoverEffect: 'Scale' }
        }
      ]
    }
  ];
}

export const CORPORATE_SERVICES_TEMPLATE_ENTRY = {
  id: 'corporate-services',
  name: 'Corporate / Services',
  description: 'Professional 8-section layout with hero, stats, services, portfolio, testimonials, and CTA — fully editable in the block editor.',
  iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`,
  html: '<section style="padding:4rem 2rem;text-align:center;"><h1 style="font-size:2rem;color:#0f172a;">Corporate / Services Template</h1><p style="color:#64748b;">This template generates editable sections. Select it and your page will be populated with 8 professional sections.</p></section>',
  buildSections: buildCorporateServicesTemplate
};
