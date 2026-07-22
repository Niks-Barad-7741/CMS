export interface SiteTemplate {
  id: string;
  name: string;
  description: string;
  iconSvg: string;
  html: string;
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with a completely blank page.',
    iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`,
    html: `<style>body { font-family: sans-serif; margin: 0; padding: 0; }</style><section style="padding: 4rem; text-align: center;"><h1 style="color: #333; font-size: 2.5rem; margin-bottom: 1rem;">Welcome to your new page</h1><p style="color: #666; font-size: 1.125rem;">Drag and drop blocks from the right panel to get started.</p></section>`
  },
  {
    id: 'corporate',
    name: 'SaaS Corporate',
    description: 'Modern landing page for software and businesses.',
    iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>`,
    html: `
      <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background: #ffffff; }
      </style>
      <header style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a;">TechNova</div>
        <nav>
          <a href="#" style="margin-right: 1.5rem; color: #475569; text-decoration: none; font-weight: 500;">Features</a>
          <a href="#" style="margin-right: 1.5rem; color: #475569; text-decoration: none; font-weight: 500;">Pricing</a>
          <a href="#" style="background: #2563eb; color: white; padding: 0.5rem 1.25rem; border-radius: 0.375rem; text-decoration: none; font-weight: 600;">Get Started</a>
        </nav>
      </header>
      
      <section style="padding: 6rem 2rem; text-align: center; background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);">
        <h1 style="font-size: 3.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem; max-width: 800px; margin-left: auto; margin-right: auto; line-height: 1.2;">
          Build Software Faster Than Ever Before
        </h1>
        <p style="font-size: 1.25rem; color: #475569; margin-bottom: 2.5rem; max-width: 600px; margin-left: auto; margin-right: auto;">
          The ultimate platform for modern teams to collaborate, deploy, and scale. Join over 10,000 businesses today.
        </p>
        <div>
          <a href="#" style="background: #2563eb; color: white; padding: 0.75rem 2rem; border-radius: 0.375rem; text-decoration: none; font-weight: 600; font-size: 1.125rem; margin-right: 1rem;">Start Free Trial</a>
          <a href="#" style="background: white; color: #0f172a; padding: 0.75rem 2rem; border-radius: 0.375rem; text-decoration: none; font-weight: 600; font-size: 1.125rem; border: 1px solid #cbd5e1;">View Demo</a>
        </div>
      </section>

      <section style="padding: 5rem 2rem; background: white;">
        <div style="max-width: 1200px; margin: 0 auto;">
          <h2 style="font-size: 2.25rem; font-weight: 700; color: #0f172a; text-align: center; margin-bottom: 3rem;">Why Choose TechNova?</h2>
          <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: #f8fafc;">
              <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem;">Lightning Fast</h3>
              <p style="color: #475569; line-height: 1.6;">Our globally distributed edge network ensures your data is delivered in milliseconds anywhere in the world.</p>
            </div>
            <div style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: #f8fafc;">
              <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem;">Secure by Default</h3>
              <p style="color: #475569; line-height: 1.6;">Enterprise-grade security features built-in. Rest easy knowing your customer data is fully encrypted.</p>
            </div>
            <div style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 1rem; border: 1px solid #e2e8f0; background: #f8fafc;">
              <h3 style="font-size: 1.25rem; font-weight: 600; color: #0f172a; margin-bottom: 1rem;">24/7 Support</h3>
              <p style="color: #475569; line-height: 1.6;">Our dedicated team of engineers is always on standby to help you solve problems whenever they arise.</p>
            </div>
          </div>
        </div>
      </section>

      <footer style="background: #0f172a; padding: 3rem 2rem; color: #94a3b8; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 1rem;">TechNova</div>
        <p>&copy; 2026 TechNova Inc. All rights reserved.</p>
      </footer>
    `
  },
  {
    id: 'portfolio',
    name: 'Personal Portfolio',
    description: 'Sleek portfolio for freelancers and creatives.',
    iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`,
    html: `
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #000000; color: #ffffff; }
      </style>
      <nav style="padding: 2rem; display: flex; justify-content: space-between; max-width: 1000px; margin: 0 auto;">
        <div style="font-size: 1.25rem; font-weight: bold; letter-spacing: 2px;">JANE DOE</div>
        <div style="display: flex; gap: 2rem;">
          <a href="#" style="color: #a1a1aa; text-decoration: none; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 1px;">Work</a>
          <a href="#" style="color: #a1a1aa; text-decoration: none; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 1px;">About</a>
          <a href="#" style="color: #ffffff; text-decoration: none; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 1px; font-weight: bold;">Contact</a>
        </div>
      </nav>

      <header style="padding: 8rem 2rem; max-width: 1000px; margin: 0 auto;">
        <h1 style="font-size: 4.5rem; font-weight: 300; line-height: 1.1; margin-bottom: 2rem;">
          Digital Designer<br/>& Developer based<br/>in New York.
        </h1>
        <p style="font-size: 1.5rem; color: #a1a1aa; max-width: 600px; line-height: 1.5; margin-bottom: 4rem;">
          I craft digital experiences that combine minimal design with powerful underlying technology.
        </p>
        <a href="#" style="display: inline-block; border-bottom: 2px solid #ffffff; padding-bottom: 0.5rem; color: #ffffff; text-decoration: none; font-size: 1.25rem; font-weight: bold; letter-spacing: 1px;">View Latest Projects &rarr;</a>
      </header>

      <section style="background: #18181b; padding: 6rem 2rem;">
        <div style="max-width: 1000px; margin: 0 auto;">
          <h2 style="font-size: 2rem; margin-bottom: 3rem; border-bottom: 1px solid #3f3f46; padding-bottom: 1rem;">Featured Work</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
            <div style="aspect-ratio: 4/3; background: #27272a; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #52525b;">Project Alpha Image</div>
            <div style="aspect-ratio: 4/3; background: #27272a; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #52525b;">Project Beta Image</div>
            <div style="aspect-ratio: 4/3; background: #27272a; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #52525b;">Project Gamma Image</div>
            <div style="aspect-ratio: 4/3; background: #27272a; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #52525b;">Project Delta Image</div>
          </div>
        </div>
      </section>

      <footer style="padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; color: #71717a;">
        <div>&copy; 2026 Jane Doe</div>
        <div>Made with passion</div>
      </footer>
    `
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Product-focused layout to drive sales.',
    iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>`,
    html: `
      <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background: #fafafa; color: #111; }
        .product-card { background: white; padding: 1rem; text-align: center; border: 1px solid #eaeaea; transition: transform 0.3s ease; }
        .product-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      </style>
      <header style="background: white; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eaeaea;">
        <div style="font-size: 1.75rem; font-weight: bold; font-family: sans-serif; letter-spacing: -1px;">LUXE.</div>
        <nav style="font-family: sans-serif; font-size: 0.875rem;">
          <a href="#" style="margin: 0 1rem; color: #111; text-decoration: none;">New Arrivals</a>
          <a href="#" style="margin: 0 1rem; color: #111; text-decoration: none;">Collections</a>
          <a href="#" style="margin: 0 1rem; color: #111; text-decoration: none;">Cart (0)</a>
        </nav>
      </header>

      <section style="background: #efebe7; padding: 8rem 2rem; text-align: center;">
        <h1 style="font-size: 4rem; margin-bottom: 1rem; font-style: italic;">The Summer Collection</h1>
        <p style="font-family: sans-serif; font-size: 1.125rem; color: #555; margin-bottom: 3rem; text-transform: uppercase; letter-spacing: 2px;">Elevate your everyday wardrobe</p>
        <a href="#" style="background: #111; color: white; padding: 1rem 3rem; text-decoration: none; font-family: sans-serif; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 1px;">Shop Now</a>
      </section>

      <section style="padding: 6rem 2rem; max-width: 1200px; margin: 0 auto;">
        <h2 style="font-family: sans-serif; font-size: 1.5rem; text-align: center; margin-bottom: 3rem; text-transform: uppercase; letter-spacing: 2px;">Featured Pieces</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          
          <div class="product-card">
            <div style="aspect-ratio: 3/4; background: #f4f4f4; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #aaa;">Image Placeholder</div>
            <h3 style="font-family: sans-serif; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 500;">Linen Blend Shirt</h3>
            <p style="font-family: sans-serif; color: #777; margin-bottom: 1rem;">$85.00</p>
            <button style="width: 100%; padding: 0.75rem; background: white; border: 1px solid #111; color: #111; cursor: pointer; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Add to Cart</button>
          </div>

          <div class="product-card">
            <div style="aspect-ratio: 3/4; background: #f4f4f4; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #aaa;">Image Placeholder</div>
            <h3 style="font-family: sans-serif; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 500;">Pleated Trousers</h3>
            <p style="font-family: sans-serif; color: #777; margin-bottom: 1rem;">$120.00</p>
            <button style="width: 100%; padding: 0.75rem; background: white; border: 1px solid #111; color: #111; cursor: pointer; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Add to Cart</button>
          </div>

          <div class="product-card">
            <div style="aspect-ratio: 3/4; background: #f4f4f4; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center; color: #aaa;">Image Placeholder</div>
            <h3 style="font-family: sans-serif; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 500;">Classic Tote Bag</h3>
            <p style="font-family: sans-serif; color: #777; margin-bottom: 1rem;">$195.00</p>
            <button style="width: 100%; padding: 0.75rem; background: white; border: 1px solid #111; color: #111; cursor: pointer; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 1px;">Add to Cart</button>
          </div>

        </div>
      </section>
    `
  },
  {
    id: 'blog',
    name: 'Blog / Article',
    description: 'Clean reading layout for editorial content.',
    iconSvg: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14"></path></svg>`,
    html: `
      <style>
        body { font-family: 'Merriweather', serif; margin: 0; padding: 0; background: #ffffff; color: #333333; line-height: 1.8; }
        p { margin-bottom: 1.5rem; font-size: 1.125rem; }
      </style>
      
      <header style="background: #fafafa; border-bottom: 1px solid #eee; padding: 1rem 0;">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <div style="font-family: sans-serif; font-size: 1.5rem; font-weight: bold; letter-spacing: 2px;">THE JOURNAL</div>
        </div>
      </header>

      <article style="max-width: 800px; margin: 0 auto; padding: 4rem 2rem;">
        <div style="text-align: center; margin-bottom: 3rem;">
          <span style="font-family: sans-serif; text-transform: uppercase; color: #888; font-size: 0.875rem; font-weight: bold; letter-spacing: 1px;">Technology & Design</span>
          <h1 style="font-size: 3rem; margin: 1rem 0; line-height: 1.2;">The Future of Digital Creation is No-Code</h1>
          <p style="font-family: sans-serif; color: #888; font-size: 0.875rem;">By <strong>Author Name</strong> &bull; July 22, 2026</p>
        </div>

        <div style="width: 100%; aspect-ratio: 16/9; background: #eee; margin-bottom: 3rem; display: flex; align-items: center; justify-content: center; color: #999; border-radius: 0.5rem;">
          Hero Image Placeholder
        </div>

        <div style="padding: 0 1rem;">
          <p>The landscape of web development has fundamentally changed over the past decade. What once required a team of specialized engineers, database administrators, and frontend designers can now be accomplished by a single creator with a powerful idea.</p>
          
          <h2 style="font-family: sans-serif; font-size: 1.75rem; margin-top: 3rem; margin-bottom: 1.5rem;">The Democratization of Software</h2>
          
          <p>No-code platforms are doing to software engineering what the printing press did to literature. By removing the technical barrier to entry, we are unlocking an unprecedented wave of innovation across every industry.</p>
          
          <blockquote style="font-style: italic; border-left: 4px solid #333; padding-left: 1.5rem; margin: 2rem 0; font-size: 1.5rem; color: #555;">
            "The future of coding is no coding at all. The tools will become invisible, leaving only pure creation."
          </blockquote>
          
          <p>As these tools become more sophisticated, the distinction between a "developer" and a "creator" will continue to blur. The Multi-Tenant CMS architecture allows organizations to scale rapidly, serving personalized experiences to thousands of users simultaneously.</p>
        </div>
      </article>

      <footer style="background: #111; color: white; padding: 3rem 0; text-align: center; font-family: sans-serif; font-size: 0.875rem;">
        <p>&copy; 2026 The Journal Publications.</p>
      </footer>
    `
  }
];
