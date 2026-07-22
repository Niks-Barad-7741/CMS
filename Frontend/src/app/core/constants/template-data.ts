export const HOME_TEMPLATE = `
<div class="min-h-screen bg-slate-50 text-slate-800 font-sans">
  <section class="relative bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white overflow-hidden">
    <div class="absolute inset-0 opacity-10" style="background-image: url('https://www.transparenttextures.com/patterns/cubes.png')"></div>
    <div class="max-w-7xl mx-auto px-6 py-32 relative z-10 flex flex-col items-center text-center">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up">
        Build Your Digital <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Empire</span>
      </h1>
      <p class="text-lg md:text-2xl text-blue-100 max-w-3xl mb-10 animate-fade-in-up delay-100">
        Empower your business with our cutting-edge dynamic platform. Create, manage, and scale with unparalleled speed and beautiful design.
      </p>
      <div class="flex gap-4 animate-fade-in-up delay-200">
        <a href="#services" class="px-8 py-4 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold rounded-full shadow-lg shadow-teal-500/30 transition-all transform hover:-translate-y-1">Get Started Now</a>
        <a href="#features" class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 font-bold rounded-full transition-all">Learn More</a>
      </div>
    </div>
  </section>

  <section id="features" class="py-24 max-w-7xl mx-auto px-6">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
      <p class="text-slate-500 text-lg max-w-2xl mx-auto">Experience the perfect blend of performance, aesthetics, and reliability.</p>
    </div>
    <div class="grid md:grid-cols-3 gap-10">
      <div class="group p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-3">Lightning Fast</h3>
        <p class="text-slate-600 leading-relaxed">Optimized for speed, our platform ensures your content loads instantly for users worldwide.</p>
      </div>
      <div class="group p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
        <div class="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-3">Bank-Grade Security</h3>
        <p class="text-slate-600 leading-relaxed">Rest easy knowing your data is protected by state-of-the-art encryption and security protocols.</p>
      </div>
      <div class="group p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100">
        <div class="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-3">Limitless Scaling</h3>
        <p class="text-slate-600 leading-relaxed">Our infrastructure grows with you, seamlessly handling traffic spikes and expanding databases.</p>
      </div>
    </div>
  </section>
</div>
`;

export const ABOUT_TEMPLATE = `
<div class="min-h-screen bg-white text-slate-800 font-sans">
  <header class="bg-slate-50 py-24 text-center border-b border-slate-100">
    <h1 class="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">About Us</h1>
    <p class="text-xl text-slate-500 max-w-2xl mx-auto">We are on a mission to transform how the world creates and interacts with digital content.</p>
  </header>
  <section class="py-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
    <div class="relative">
      <div class="absolute inset-0 bg-blue-400 rounded-3xl transform translate-x-4 translate-y-4 opacity-20"></div>
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2850&auto=format&fit=crop" alt="Our team working" class="relative rounded-3xl shadow-2xl object-cover h-[500px] w-full" />
    </div>
    <div>
      <h2 class="text-4xl font-bold mb-6 text-slate-900">Our Story</h2>
      <p class="text-lg text-slate-600 mb-6 leading-relaxed">Founded in 2026, we recognized a fundamental flaw in how digital platforms were built: they were either too complex for regular users or too limiting for developers.</p>
      <p class="text-lg text-slate-600 mb-8 leading-relaxed">We set out to bridge that gap. Today, our platform empowers thousands of businesses to craft stunning digital experiences without compromising on power or flexibility.</p>
      <ul class="space-y-4">
        <li class="flex items-center text-slate-700 font-medium">
          <svg class="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          Innovation-driven approach
        </li>
        <li class="flex items-center text-slate-700 font-medium">
          <svg class="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          Customer-centric design
        </li>
        <li class="flex items-center text-slate-700 font-medium">
          <svg class="w-6 h-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          Commitment to excellence
        </li>
      </ul>
    </div>
  </section>
</div>
`;

export const SERVICES_TEMPLATE = `
<div class="min-h-screen bg-slate-900 text-white font-sans selection:bg-teal-500 selection:text-white">
  <header class="py-24 text-center px-6 relative overflow-hidden">
    <div class="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div class="absolute top-[-20%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
    <div class="relative z-10">
      <h1 class="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">Our Services</h1>
      <p class="text-xl text-slate-400 max-w-2xl mx-auto">Tailored solutions designed to elevate your brand and drive unparalleled growth.</p>
    </div>
  </header>
  <section class="max-w-7xl mx-auto px-6 pb-24">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-all hover:border-teal-500/50 group cursor-pointer">
        <div class="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-all text-slate-300">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-100">Web Development</h3>
        <p class="text-slate-400 mb-6 line-clamp-3">Crafting responsive, high-performance websites with modern frameworks that captivate audiences and deliver seamless user experiences.</p>
      </div>
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-all hover:border-blue-500/50 group cursor-pointer">
        <div class="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all text-slate-300">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-100">App Design</h3>
        <p class="text-slate-400 mb-6 line-clamp-3">Designing intuitive and gorgeous mobile applications that users love, focusing on human-centric UI/UX principles.</p>
      </div>
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-all hover:border-purple-500/50 group cursor-pointer">
        <div class="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all text-slate-300">
          <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <h3 class="text-2xl font-bold mb-4 text-slate-100">Digital Marketing</h3>
        <p class="text-slate-400 mb-6 line-clamp-3">Data-driven marketing strategies that skyrocket your online presence and convert visitors into loyal customers.</p>
      </div>
    </div>
  </section>
</div>
`;

export const CONTACT_TEMPLATE = `
<div class="min-h-screen bg-slate-50 font-sans text-slate-900">
  <div class="max-w-7xl mx-auto px-6 py-24">
    <div class="text-center mb-16">
      <h1 class="text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Get in Touch</h1>
      <p class="text-xl text-slate-500 max-w-2xl mx-auto">Have a question or ready to start a project? We'd love to hear from you.</p>
    </div>
    <div class="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-800 p-12 md:w-2/5 text-white flex flex-col justify-between">
        <div>
          <h2 class="text-3xl font-bold mb-6">Contact Information</h2>
          <p class="text-blue-100 mb-10 leading-relaxed">Fill out the form and our team will get back to you within 24 hours.</p>
          <div class="space-y-6">
            <div class="flex items-center text-blue-50">
              <svg class="w-6 h-6 mr-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              +1 (555) 123-4567
            </div>
            <div class="flex items-center text-blue-50">
              <svg class="w-6 h-6 mr-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              hello@dynamiccms.com
            </div>
            <div class="flex items-center text-blue-50">
              <svg class="w-6 h-6 mr-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              123 Innovation Way, Tech City
            </div>
          </div>
        </div>
      </div>
      <div class="p-12 md:w-3/5">
        <form class="space-y-6" (submit)="$event.preventDefault()">
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="John">
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Doe">
            </div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
            <input type="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="john@example.com">
          </div>
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">Message</label>
            <textarea rows="4" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
          </div>
          <button type="button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
`;
