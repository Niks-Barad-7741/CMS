

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

export const BLOG_TEMPLATE_SECTIONS: any[] = [
  // 1. Article Header
  makeSection({ backgroundColor: '#ffffff', paddingTop: 'Large', paddingBottom: 'None', containerWidth: 'full' }, [
    makeBlock('heading', { text: 'The Future of Web Design in 2025', level: 1, align: 'center' }, { fontSize: 'text-5xl' }, 0),
    makeBlock('paragraph', { text: 'Published on August 15, 2024 • By Editorial Team', align: 'center' }, { textColor: '#64748b' }, 1),
    makeBlock('image', {
      url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200',
      caption: ''
    }, { borderRadius: 'Medium', maxWidth: 'Large' }, 2)
  ], 0),

  // 2. Article Body (Narrow container for reading)
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('paragraph', { text: 'Web design is constantly evolving. What was considered cutting edge yesterday is often the standard today. As we look towards 2025, several key trends are emerging that will shape how we build and experience the digital world.', align: 'left' }, { fontSize: 'text-lg' }, 0),
    makeBlock('heading', { text: '1. Immersive 3D Experiences', level: 2, align: 'left' }, { fontSize: 'text-2xl' }, 1),
    makeBlock('paragraph', { text: 'With the continuous improvement of web technologies like WebGL and WebGPU, integrating lightweight, interactive 3D elements into websites is becoming easier than ever. These elements aren\'t just for show—they enhance storytelling and product visualization.', align: 'left' }, { fontSize: 'text-lg' }, 2),
    makeBlock('quote', {
      text: 'Good design is obvious. Great design is transparent.',
      author: 'Joe Sparano',
      avatarUrl: ''
    }, {}, 3),
    makeBlock('heading', { text: '2. AI-Driven Personalization', level: 2, align: 'left' }, { fontSize: 'text-2xl' }, 4),
    makeBlock('paragraph', { text: 'Artificial Intelligence is moving from backend data processing to frontend user experience. Websites in 2025 will dynamically adjust their layouts, content, and even color schemes based on user behavior and preferences in real-time.', align: 'left' }, { fontSize: 'text-lg' }, 5)
  ], 1),

  // 3. Author Bio / Share
  makeSection({ backgroundColor: '#f8fafc', blockLayout: 'row' }, [
    makeBlock('image', {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150',
      caption: ''
    }, { borderRadius: 'Full', maxWidth: 'Small' }, 0),
    makeBlock('heading', { text: 'About the Author', level: 3, align: 'left' }, { fontSize: 'text-xl' }, 1),
    makeBlock('paragraph', { text: 'Editorial Team is a group of passionate designers and developers writing about the future of tech.', align: 'left' }, {}, 2)
  ], 2)
];
