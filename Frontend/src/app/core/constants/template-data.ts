export const HOME_TEMPLATE = `
<div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
  <section class="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white overflow-hidden pb-24 pt-32 lg:pt-48 lg:pb-32">
    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
    <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[120px] pointer-events-none"></div>
    
    <div class="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
      <h1 class="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight mb-8 animate-fade-in-up leading-[1.1]">
        Build Your Digital <br class="hidden sm:block" />
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300">Empire</span>
      </h1>
      <p class="text-lg md:text-2xl text-slate-300 max-w-3xl mb-12 animate-fade-in-up delay-100 font-light leading-relaxed">
        Empower your business with our cutting-edge dynamic platform. Create, manage, and scale with unparalleled speed and beautiful design.
      </p>
      <div class="flex flex-col sm:flex-row gap-5 animate-fade-in-up delay-200">
        <a href="#services" class="px-10 py-4 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-bold rounded-2xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-1 hover:scale-[1.02]">Get Started Now</a>
        <a href="#features" class="px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white font-bold rounded-2xl transition-all transform hover:-translate-y-1">Learn More</a>
      </div>
    </div>
  </section>

  <section id="features" class="py-32 max-w-7xl mx-auto px-6 relative">
    <div class="text-center mb-20">
      <span class="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Features</span>
      <h2 class="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Why Choose Us</h2>
      <p class="text-slate-500 text-xl max-w-2xl mx-auto font-light leading-relaxed">Experience the perfect blend of performance, aesthetics, and reliability.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <div class="group p-10 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 border border-slate-100/80 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform group-hover:scale-110">
          <svg class="w-32 h-32 text-indigo-900" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/30">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-900">Lightning Fast</h3>
        <p class="text-slate-500 leading-relaxed font-light">Optimized for speed, our platform ensures your content loads instantly for users worldwide.</p>
      </div>
      <div class="group p-10 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 border border-slate-100/80 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform group-hover:scale-110">
          <svg class="w-32 h-32 text-teal-900" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-teal-500/30">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-900">Bank-Grade Security</h3>
        <p class="text-slate-500 leading-relaxed font-light">Rest easy knowing your data is protected by state-of-the-art encryption and security protocols.</p>
      </div>
      <div class="group p-10 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 transform hover:-translate-y-2 border border-slate-100/80 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity transform group-hover:scale-110">
          <svg class="w-32 h-32 text-purple-900" fill="currentColor" viewBox="0 0 24 24"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
        </div>
        <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-900">Limitless Scaling</h3>
        <p class="text-slate-500 leading-relaxed font-light">Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases.</p>
      </div>
    </div>
  </section>
</div>
`;

export const ABOUT_TEMPLATE = `
<div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
  <header class="bg-gradient-to-b from-white to-slate-50 py-32 text-center border-b border-slate-100">
    <div class="max-w-4xl mx-auto px-6">
      <span class="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Story</span>
      <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">About Us</h1>
      <p class="text-xl md:text-2xl text-slate-500 mx-auto font-light leading-relaxed">We are on a mission to transform how the world creates and interacts with digital content.</p>
    </div>
  </header>
  <section class="py-24 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
    <div class="relative group">
      <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-teal-400 rounded-[3rem] transform translate-x-6 translate-y-6 opacity-30 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop" alt="Our team working" class="relative rounded-[3rem] shadow-2xl object-cover h-[600px] w-full transform group-hover:-translate-y-2 transition-transform duration-500" />
    </div>
    <div>
      <h2 class="text-4xl font-extrabold mb-8 text-slate-900 tracking-tight">Pioneering the Future</h2>
      <div class="space-y-6 text-lg text-slate-600 font-light leading-relaxed mb-10">
        <p>Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.</p>
        <p>We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.</p>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex items-center text-slate-800 font-semibold bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          Innovation-driven approach
        </div>
        <div class="flex items-center text-slate-800 font-semibold bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div class="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mr-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          Customer-centric design
        </div>
        <div class="flex items-center text-slate-800 font-semibold bg-white p-4 rounded-2xl shadow-sm border border-slate-100 sm:col-span-2">
          <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mr-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          Commitment to excellence
        </div>
      </div>
    </div>
  </section>
</div>
`;

export const SERVICES_TEMPLATE = `
<div class="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white pb-32">
  <header class="py-32 text-center px-6 relative overflow-hidden">
    <div class="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
    <div class="absolute top-[-50%] right-[-20%] w-[800px] h-[800px] bg-teal-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
    <div class="relative z-10 max-w-4xl mx-auto">
      <span class="text-indigo-400 font-bold tracking-widest uppercase text-sm mb-4 block">What We Do</span>
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">Our Services</h1>
      <p class="text-xl md:text-2xl text-slate-400 font-light leading-relaxed">Tailored solutions designed to elevate your brand and drive unparalleled growth.</p>
    </div>
  </header>
  <section class="max-w-7xl mx-auto px-6 relative z-10">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-10 hover:bg-slate-800/80 transition-all duration-500 hover:border-indigo-500/50 group cursor-pointer hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] hover:-translate-y-2">
        <div class="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-white">Web Development</h3>
        <p class="text-slate-400 mb-6 font-light leading-relaxed">Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences.</p>
        <span class="text-indigo-400 font-semibold group-hover:text-indigo-300 flex items-center gap-2">Learn more <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
      </div>
      <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-10 hover:bg-slate-800/80 transition-all duration-500 hover:border-blue-500/50 group cursor-pointer hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:-translate-y-2">
        <div class="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-500/20 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-white">App Design</h3>
        <p class="text-slate-400 mb-6 font-light leading-relaxed">Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI/UX principles.</p>
        <span class="text-blue-400 font-semibold group-hover:text-blue-300 flex items-center gap-2">Learn more <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
      </div>
      <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-[2.5rem] p-10 hover:bg-slate-800/80 transition-all duration-500 hover:border-purple-500/50 group cursor-pointer hover:shadow-[0_0_40px_rgba(168,85,247,0.1)] hover:-translate-y-2">
        <div class="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-500/20 group-hover:text-purple-400 group-hover:border-purple-500/30 transition-all text-slate-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-white">Digital Marketing</h3>
        <p class="text-slate-400 mb-6 font-light leading-relaxed">Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers.</p>
        <span class="text-purple-400 font-semibold group-hover:text-purple-300 flex items-center gap-2">Learn more <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg></span>
      </div>
    </div>
  </section>
</div>
`;

export const CONTACT_TEMPLATE = `
<div class="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
  <div class="max-w-7xl mx-auto px-6 py-24 lg:py-32">
    <div class="text-center mb-16">
      <span class="text-indigo-600 font-bold tracking-widest uppercase text-sm mb-4 block">Let's Connect</span>
      <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">Get in Touch</h1>
      <p class="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">Have a question or ready to start a project? We'd love to hear from you.</p>
    </div>
    <div class="bg-white rounded-[3rem] shadow-[0_20px_60px_rgb(0,0,0,0.05)] overflow-hidden flex flex-col lg:flex-row border border-slate-100">
      <div class="bg-gradient-to-br from-indigo-600 to-blue-800 p-12 lg:p-16 lg:w-2/5 text-white flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div class="relative z-10">
          <h2 class="text-3xl lg:text-4xl font-bold mb-6">Contact Information</h2>
          <p class="text-indigo-100 mb-12 leading-relaxed font-light text-lg">Fill out the form and our team will get back to you within 24 hours.</p>
          <div class="space-y-8">
            <div class="flex items-center text-white/90 text-lg font-medium group">
              <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              +1 (555) 123-4567
            </div>
            <div class="flex items-center text-white/90 text-lg font-medium group">
              <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              hello@dynamiccms.com
            </div>
            <div class="flex items-center text-white/90 text-lg font-medium group">
              <div class="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mr-5 group-hover:bg-white/20 transition-colors">
                <svg class="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              123 Innovation Way, Tech City
            </div>
          </div>
        </div>
      </div>
      <div class="p-12 lg:p-16 lg:w-3/5">
        <form class="space-y-8" (submit)="$event.preventDefault()">
          <div class="grid md:grid-cols-2 gap-8">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">First Name</label>
              <input type="text" class="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="John">
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Last Name</label>
              <input type="text" class="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="Doe">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Email Address</label>
            <input type="email" class="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com">
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase">Message</label>
            <textarea rows="4" class="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" class="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-5 rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all transform hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(79,70,229,0.4)] text-lg">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
`;
