export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'url' | 'email' | 'array' | 'select';

export interface TemplateField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for 'select' type
  arrayFields?: TemplateField[]; // for 'array' type items
}

export interface TemplateSection {
  key: string;
  label: string;
  fields: TemplateField[];
}

export interface TemplateSchema {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  sections: TemplateSection[];
}

export const SITE_BUILDER_TEMPLATES: TemplateSchema[] = [
  {
    id: 'business-corporate',
    name: 'Business Corporate',
    description: 'A modern, professional template for businesses and agencies.',
    thumbnail: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&q=80',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text', required: true },
          { key: 'subheadline', label: 'Subheadline', type: 'textarea' },
          { key: 'backgroundImage', label: 'Background Image', type: 'image' },
          { key: 'ctaText', label: 'CTA Button Text', type: 'text' },
          { key: 'ctaLink', label: 'CTA Button Link', type: 'url' }
        ]
      },
      {
        key: 'about',
        label: 'About Section',
        fields: [
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'content', label: 'Content', type: 'richtext' },
          { key: 'image', label: 'Side Image', type: 'image' }
        ]
      },
      {
        key: 'services',
        label: 'Services',
        fields: [
          { key: 'heading', label: 'Section Heading', type: 'text' },
          {
            key: 'items',
            label: 'Service Items',
            type: 'array',
            arrayFields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'iconUrl', label: 'Icon Image', type: 'image' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Perfect for cafes, restaurants, and food delivery services.',
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'restaurantName', label: 'Restaurant Name', type: 'text', required: true },
          { key: 'tagline', label: 'Tagline', type: 'text' },
          { key: 'heroImage', label: 'Hero Image', type: 'image', required: true }
        ]
      },
      {
        key: 'menu',
        label: 'Menu Highlights',
        fields: [
          { key: 'heading', label: 'Menu Heading', type: 'text' },
          {
            key: 'categories',
            label: 'Menu Categories',
            type: 'array',
            arrayFields: [
              { key: 'categoryName', label: 'Category Name', type: 'text' },
              {
                key: 'items',
                label: 'Menu Items',
                type: 'array',
                arrayFields: [
                  { key: 'name', label: 'Dish Name', type: 'text' },
                  { key: 'price', label: 'Price', type: 'text' },
                  { key: 'description', label: 'Description', type: 'textarea' }
                ]
              }
            ]
          }
        ]
      },
      {
        key: 'contact',
        label: 'Location & Hours',
        fields: [
          { key: 'address', label: 'Address', type: 'textarea' },
          { key: 'phone', label: 'Phone Number', type: 'text' },
          { key: 'hours', label: 'Opening Hours (Rich Text)', type: 'richtext' }
        ]
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    description: 'Showcase your work and skills with a minimalist design.',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&q=80',
    sections: [
      {
        key: 'intro',
        label: 'Introduction',
        fields: [
          { key: 'name', label: 'Your Name', type: 'text', required: true },
          { key: 'role', label: 'Your Role / Title', type: 'text' },
          { key: 'bio', label: 'Short Bio', type: 'textarea' },
          { key: 'profilePicture', label: 'Profile Picture', type: 'image' }
        ]
      },
      {
        key: 'projects',
        label: 'Projects Gallery',
        fields: [
          {
            key: 'items',
            label: 'Projects',
            type: 'array',
            arrayFields: [
              { key: 'title', label: 'Project Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'image', label: 'Project Image', type: 'image' },
              { key: 'link', label: 'Project URL', type: 'url' }
            ]
          }
        ]
      },
      {
        key: 'contact',
        label: 'Contact Information',
        fields: [
          { key: 'email', label: 'Email Address', type: 'email' },
          { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
          { key: 'github', label: 'GitHub URL', type: 'url' }
        ]
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog Article',
    description: 'Clean reading layout for editorial content and posts.',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&q=80',
    sections: [
      {
        key: 'header',
        label: 'Article Header',
        fields: [
          { key: 'title', label: 'Article Title', type: 'text', required: true },
          { key: 'category', label: 'Category', type: 'text' },
          { key: 'authorName', label: 'Author Name', type: 'text' },
          { key: 'publishDate', label: 'Publish Date', type: 'text' },
          { key: 'coverImage', label: 'Cover Image', type: 'image' }
        ]
      },
      {
        key: 'content',
        label: 'Article Content',
        fields: [
          { key: 'body', label: 'Body Text', type: 'richtext', required: true }
        ]
      }
    ]
  }
];
