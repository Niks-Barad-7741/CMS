

let idCounter = 0;
function genId(prefix: 'sec' | 'blk'): string {
  idCounter++;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

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
      paddingTop: 'Large',
      paddingBottom: 'Large',
      containerWidth: 'boxed',
      blockLayout: 'stack',
      ...style
    },
    blocks
  };
}

function makeBlock(type: string, content: any, style: any, sortOrder: number): any {
  return {
    id: genId('blk'),
    type,
    sortOrder,
    content: { ...content },
    style: { ...style }
  };
}

export const PORTFOLIO_TEMPLATE_SECTIONS: any[] = [
  // 1. Hero
  makeSection({ backgroundColor: '#fafafa' }, [
    makeBlock('hero', {
      title: 'Hi, I am Alex.',
      subtitle: 'Creative Developer & Designer',
      text: 'I build digital experiences that live at the intersection of design and technology.',
      primaryBtnText: 'View My Work',
      primaryBtnUrl: '#work',
      align: 'left'
    }, {}, 0)
  ], 0),

  // 2. About Me
  makeSection({ backgroundColor: '#ffffff', blockLayout: 'row' }, [
    makeBlock('image', {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600',
      caption: 'Alex Smith'
    }, { borderRadius: 'Medium', maxWidth: 'Small' }, 0),
    makeBlock('heading', { text: 'About Me', level: 2, align: 'left' }, { fontSize: 'text-3xl' }, 1),
    makeBlock('paragraph', { text: 'With over 5 years of experience in front-end development and UI/UX design, I am passionate about creating accessible, beautiful, and performant web applications.', align: 'left' }, { fontSize: 'text-lg' }, 2)
  ], 1),

  // 3. Selected Work (Gallery)
  makeSection({ backgroundColor: '#f8fafc' }, [
    makeBlock('heading', { text: 'Selected Work', level: 2, align: 'center' }, { fontSize: 'text-3xl' }, 0),
    makeBlock('gallery', {
      images: [
        { url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400', caption: 'Web App Redesign' },
        { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400', caption: 'Data Visualization Dashboard' },
        { url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=400', caption: 'Mobile E-Commerce' },
        { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400', caption: 'Corporate Landing Page' }
      ]
    }, { gridCols: 'grid-cols-2' }, 1)
  ], 2),

  // 4. Skills (Columns)
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Core Skills', level: 2, align: 'center' }, { fontSize: 'text-3xl' }, 0),
    makeBlock('columns', {
      columns: [
        { title: 'Front-End Development', text: 'React, Angular, Vue, and modern JavaScript.', align: 'center' },
        { title: 'UI/UX Design', text: 'Figma, Prototyping, Wireframing, and User Testing.', align: 'center' },
        { title: 'Back-End Integration', text: 'Node.js, REST APIs, GraphQL, and Firebase.', align: 'center' }
      ]
    }, {}, 1)
  ], 3),

  // 5. Contact CTA
  makeSection({ backgroundColor: '#1e293b', textColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Let\'s work together', level: 2, align: 'center' }, { fontSize: 'text-4xl', textColor: '#ffffff' }, 0),
    makeBlock('paragraph', { text: 'I am currently available for freelance projects and full-time opportunities.', align: 'center' }, { textColor: '#cbd5e1' }, 1),
    makeBlock('button', { label: 'Get in Touch', url: '#contact', style: 'primary', align: 'center' }, {}, 2)
  ], 4)
];
