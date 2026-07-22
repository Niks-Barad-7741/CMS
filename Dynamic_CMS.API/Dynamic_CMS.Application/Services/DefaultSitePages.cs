using System.Linq;

namespace Dynamic_CMS.Application.Services
{
    public static class DefaultSitePages
    {
        public record DefaultMenu(string Title, string Page, int SortOrder);

        public record DefaultPage(string Title, string Page, int SortOrder, string BodyHtml);

        public static readonly DefaultMenu[] Menus =
        [
            new("Home", "home", 1),
            new("About Us", "about-us", 2),
            new("Services", "services", 3),
            new("Contact Us", "contact-us", 4)
        ];

        public static readonly DefaultPage[] Pages =
        [
            new("Home", "home", 1, HomeHtml),
            new("About Us", "about-us", 2, AboutHtml),
            new("Services", "services", 3, ServicesHtml),
            new("Contact Us", "contact-us", 4, ContactHtml)
        ];

        public static string? GetBodyHtml(string pageSlug) =>
            Pages.FirstOrDefault(p => p.Page.Equals(pageSlug, StringComparison.OrdinalIgnoreCase))?.BodyHtml;

        public static string? GetTitle(string pageSlug) =>
            Pages.FirstOrDefault(p => p.Page.Equals(pageSlug, StringComparison.OrdinalIgnoreCase))?.Title;

        private const string HomeHtml = """
            <div class="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-12 md:p-24 text-center rounded-3xl mb-12 shadow-2xl">
              <h1 class="text-4xl md:text-6xl font-black mb-6 tracking-tight">Innovating the Future</h1>
              <p class="text-lg md:text-xl opacity-90 max-w-2xl mx-auto mb-10">We are dedicated to providing the best services for our clients. Discover how we can help you achieve your goals today.</p>
              <a href="/site/{ORG_SLUG}/services" class="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">Get Started</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="p-8 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 class="text-2xl text-gray-900 mb-4 font-bold">Our Mission</h3>
                <p class="text-gray-600 leading-relaxed text-lg">To empower businesses with cutting-edge technology and unparalleled support.</p>
              </div>
              <div class="p-8 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 class="text-2xl text-gray-900 mb-4 font-bold">Our Vision</h3>
                <p class="text-gray-600 leading-relaxed text-lg">A world where digital transformation is seamless, accessible, and drives true value.</p>
              </div>
            </div>
            """;

        private const string AboutHtml = """
            <div class="text-center mb-16">
              <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Founded in 2026, we have grown from a small team of passionate developers into a global leader in software solutions. We believe in transparency, innovation, and putting our customers first.</p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" alt="Our Team" class="w-full rounded-3xl shadow-2xl">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 mb-8">Our Core Values</h2>
                <ul class="space-y-6">
                  <li class="flex items-start">
                    <span class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4">✓</span>
                    <span class="text-gray-700 text-lg"><strong class="text-gray-900">Integrity:</strong> We do what is right, always.</span>
                  </li>
                  <li class="flex items-start">
                    <span class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4">✓</span>
                    <span class="text-gray-700 text-lg"><strong class="text-gray-900">Excellence:</strong> We strive for the best quality in everything.</span>
                  </li>
                  <li class="flex items-start">
                    <span class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4">✓</span>
                    <span class="text-gray-700 text-lg"><strong class="text-gray-900">Innovation:</strong> We continuously learn and adapt.</span>
                  </li>
                </ul>
              </div>
            </div>
            """;

        private const string ServicesHtml = """
            <p class="text-center text-xl text-gray-600 mb-16 max-w-3xl mx-auto">We offer a wide range of professional services tailored to meet your unique needs and drive your business forward.</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="border border-gray-200 p-8 rounded-3xl text-center bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="text-5xl mb-6">💻</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Web Development</h3>
                <p class="text-gray-600">Custom, responsive websites built with the latest technologies.</p>
              </div>
              <div class="border border-gray-200 p-8 rounded-3xl text-center bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="text-5xl mb-6">📱</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Mobile Apps</h3>
                <p class="text-gray-600">Native and cross-platform applications for iOS and Android.</p>
              </div>
              <div class="border border-gray-200 p-8 rounded-3xl text-center bg-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div class="text-5xl mb-6">☁️</div>
                <h3 class="text-xl font-bold text-gray-900 mb-4">Cloud Hosting</h3>
                <p class="text-gray-600">Secure and scalable cloud infrastructure management.</p>
              </div>
            </div>
            """;

        private const string ContactHtml = """
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 class="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
                <p class="text-gray-600 text-lg mb-10">Have a question or want to work together? Fill out the form or reach out to us directly.</p>
                <div class="space-y-6">
                  <div class="flex items-center text-lg">
                    <span class="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl mr-4 text-xl">📍</span>
                    <span class="text-gray-700">123 Business Rd, Tech City, 10010</span>
                  </div>
                  <div class="flex items-center text-lg">
                    <span class="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl mr-4 text-xl">📞</span>
                    <span class="text-gray-700">+1 (555) 987-6543</span>
                  </div>
                  <div class="flex items-center text-lg">
                    <span class="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl mr-4 text-xl">✉️</span>
                    <span class="text-gray-700">hello@ourcompany.com</span>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                <div class="space-y-6">
                  <input type="text" placeholder="Your Name" class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 bg-white shadow-sm">
                  <input type="email" placeholder="Your Email" class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 bg-white shadow-sm">
                  <textarea placeholder="Your Message" rows="5" class="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 bg-white shadow-sm resize-none"></textarea>
                  <button type="button" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">Send Message</button>
                </div>
              </div>
            </div>
            """;

        public static string PersonalizeHtml(string html, string orgSlug, string orgName)
        {
            return html
                .Replace("{ORG_SLUG}", orgSlug, StringComparison.Ordinal)
                .Replace("{ORG_NAME}", orgName, StringComparison.Ordinal);
        }
    }
}
