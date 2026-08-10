

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

export const ECOMMERCE_TEMPLATE_SECTIONS: any[] = [
  // 1. Hero
  makeSection({ backgroundColor: '#fdf2f8' }, [
    makeBlock('hero', {
      title: 'Summer Collection 2024',
      subtitle: 'New Arrivals',
      text: 'Discover the latest trends in our new summer collection. Fresh styles, bold colors.',
      primaryBtnText: 'Shop Now',
      primaryBtnUrl: '#shop',
      align: 'center'
    }, {}, 0)
  ], 0),

  // 2. Featured Categories (Columns)
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Shop by Category', level: 2, align: 'center' }, { fontSize: 'text-3xl' }, 0),
    makeBlock('columns', {
      columns: [
        { title: 'Women\'s Apparel', text: 'Dresses, tops, and more.', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400', btnText: 'Shop Women', btnUrl: '#' },
        { title: 'Men\'s Apparel', text: 'Shirts, pants, and accessories.', imageUrl: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=400', btnText: 'Shop Men', btnUrl: '#' },
        { title: 'Accessories', text: 'Bags, hats, and jewelry.', imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400', btnText: 'Shop Accessories', btnUrl: '#' }
      ]
    }, {}, 1)
  ], 1),

  // 3. Featured Product (Row layout)
  makeSection({ backgroundColor: '#f8fafc', blockLayout: 'row' }, [
    makeBlock('image', {
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
      caption: 'Premium Running Shoes'
    }, { borderRadius: 'Medium' }, 0),
    makeBlock('heading', { text: 'Premium Running Shoes', level: 2, align: 'left' }, { fontSize: 'text-4xl' }, 1),
    makeBlock('paragraph', { text: 'Experience ultimate comfort and performance with our latest premium running shoes. Engineered for speed and durability.', align: 'left' }, { fontSize: 'text-lg' }, 2),
    makeBlock('button', { label: 'Add to Cart - $129', url: '#cart', style: 'primary', align: 'left' }, {}, 3)
  ], 2),

  // 4. Testimonial
  makeSection({ backgroundColor: '#ffffff' }, [
    makeBlock('quote', {
      text: 'Best quality clothes I have ever bought online. Fast shipping and excellent customer service!',
      author: 'Sarah Johnson',
      avatarUrl: ''
    }, {}, 0)
  ], 3),

  // 5. Newsletter CTA
  makeSection({ backgroundColor: '#4f46e5', textColor: '#ffffff' }, [
    makeBlock('heading', { text: 'Get 20% Off Your First Order', level: 2, align: 'center' }, { fontSize: 'text-3xl', textColor: '#ffffff' }, 0),
    makeBlock('paragraph', { text: 'Subscribe to our newsletter for exclusive offers and updates.', align: 'center' }, { textColor: '#e0e7ff' }, 1),
    makeBlock('button', { label: 'Subscribe Now', url: '#subscribe', style: 'secondary', align: 'center' }, {}, 2)
  ], 4)
];
