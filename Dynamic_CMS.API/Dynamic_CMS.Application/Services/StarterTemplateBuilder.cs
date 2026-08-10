using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Dynamic_CMS.Application.Services
{
    public static class StarterTemplateBuilder
    {
        private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        private static string GenerateId(string prefix) => $"{prefix}-{Guid.NewGuid().ToString("N").Substring(0, 8)}";

        public static string BuildHomeTemplate()
        {
            var content = new
            {
                schemaVersion = "1.0",
                globalTheme = new { primaryColor = "#4f46e5", fontFamily = "Inter" },
                sections = new object[]
                {
                    // 1. Premium Hero
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 1,
                        style = new { 
                            backgroundType = "image", 
                            backgroundImageUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80", 
                            paddingTop = "pt-32", paddingBottom = "pb-32", 
                            textColor = "#ffffff", overlayColor = "#0f172a", overlayOpacity = 75, minHeightType = "100vh",
                            additionalClasses = "relative"
                        },
                        blocks = new object[]
                        {
                            new
                            {
                                id = GenerateId("blk"),
                                type = "hero",
                                sortOrder = 1,
                                content = new
                                {
                                    heading = "Elevate Your Business",
                                    eyebrow = "Next-Gen Corporate Solutions",
                                    headingTag = "h1",
                                    subtext = "We build intelligent, scalable solutions for forward-thinking companies. Join the revolution of digital transformation today.",
                                    bgType = "color",
                                    bgColor = "transparent",
                                    ctaText = "Discover More",
                                    ctaStyle = "primary",
                                    ctaUrl = "/about",
                                    secCtaText = "Contact Us",
                                    secCtaStyle = "outline",
                                    secCtaUrl = "/contact",
                                    animation = "Slide Up"
                                },
                                style = new { headingFontSize = "X-Large", minHeightType = "auto" }
                            }
                        }
                    },
                    // 2. About / Introduction (Image + Text)
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 2,
                        style = new { backgroundType = "color", backgroundColor = "#ffffff", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new
                            {
                                id = GenerateId("blk"),
                                type = "columns",
                                sortOrder = 1,
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            new {
                                                type = "image",
                                                content = new { url = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80", alt = "Team" },
                                                style = new { borderRadius = "Medium", boxShadow = "Large", additionalClasses = "transform hover:scale-105 transition-transform duration-700" }
                                            }
                                        } },
                                        new { blocks = new object[] {
                                            new {
                                                type = "heading",
                                                content = new { text = "Who We Are", level = 2, align = "left" },
                                                style = new { fontSize = "text-4xl", textColor = "#0f172a", additionalClasses = "mb-6 font-black" }
                                            },
                                            new {
                                                type = "paragraph",
                                                content = new { text = "We are a team of passionate innovators dedicated to building robust, modern platforms. Our expertise spans across digital transformation, software engineering, and strategic consulting.", align = "left" },
                                                style = new { fontSize = "text-lg", textColor = "#475569", additionalClasses = "mb-6 leading-relaxed" }
                                            },
                                            new {
                                                type = "iconList",
                                                content = new { items = new[] { "Award-winning solutions", "24/7 dedicated support team", "Agile & fast delivery" }, iconColor = "#4f46e5" },
                                                style = new { fontSize = "text-base", textColor = "#1f2937", spacing = "Medium", additionalClasses = "mb-8" }
                                            },
                                            new {
                                                type = "button",
                                                content = new { label = "About Us", url = "/about", style = "primary", align = "left" },
                                                style = new { additionalClasses = "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1 transition-all" }
                                            }
                                        } }
                                    }
                                },
                                style = new { gridCols = "grid-cols-2", gapSize = "Large", valign = "Middle" }
                            }
                        }
                    },
                    // 3. Services (Premium Cards)
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 3,
                        style = new { backgroundType = "color", backgroundColor = "#f8fafc", paddingTop = "pt-24", paddingBottom = "pb-32" },
                        blocks = new object[]
                        {
                            new { type = "heading", content = new { text = "Our Expertise", level = 2, align = "center" }, style = new { fontSize = "text-4xl", textColor = "#0f172a", additionalClasses = "mb-4 font-black" } },
                            new { type = "paragraph", content = new { text = "Delivering comprehensive end-to-end solutions for enterprises.", align = "center" }, style = new { fontSize = "text-xl", textColor = "#64748b", additionalClasses = "mb-16" } },
                            new
                            {
                                type = "columns",
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { title = "Digital Strategy", text = "Navigate the digital landscape with expert guidance.", imageUrl = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80", cardLook = "imageOverlay", align = "left", additionalClasses = "group" },
                                        new { title = "Cloud Architecture", text = "Scalable and secure cloud infrastructure.", imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", cardLook = "imageOverlay", align = "left", additionalClasses = "group" },
                                        new { title = "Custom Software", text = "Tailor-made software solutions for your needs.", imageUrl = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80", cardLook = "imageOverlay", align = "left", additionalClasses = "group" }
                                    }
                                },
                                style = new { gridCols = "grid-cols-3", gapSize = "Large", additionalClasses = "max-w-6xl mx-auto" }
                            }
                        }
                    },
                    // 4. Statistics
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 4,
                        style = new { backgroundType = "image", backgroundImageUrl = "https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&w=1920&q=80", backgroundAttachment = "fixed", paddingTop = "pt-24", paddingBottom = "pb-24", overlayColor = "#4f46e5", overlayOpacity = 90, textColor = "#ffffff" },
                        blocks = new object[]
                        {
                            new
                            {
                                type = "columns",
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "10+", level = 2, align = "center" }, style = new { fontSize = "text-6xl", textColor = "#ffffff", additionalClasses = "font-black" } },
                                            new { type = "paragraph", content = new { text = "Years Experience", align = "center" }, style = new { textColor = "#c7d2fe", additionalClasses = "font-medium tracking-wide uppercase mt-2" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "500+", level = 2, align = "center" }, style = new { fontSize = "text-6xl", textColor = "#ffffff", additionalClasses = "font-black" } },
                                            new { type = "paragraph", content = new { text = "Projects Delivered", align = "center" }, style = new { textColor = "#c7d2fe", additionalClasses = "font-medium tracking-wide uppercase mt-2" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "99%", level = 2, align = "center" }, style = new { fontSize = "text-6xl", textColor = "#ffffff", additionalClasses = "font-black" } },
                                            new { type = "paragraph", content = new { text = "Client Satisfaction", align = "center" }, style = new { textColor = "#c7d2fe", additionalClasses = "font-medium tracking-wide uppercase mt-2" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "24/7", level = 2, align = "center" }, style = new { fontSize = "text-6xl", textColor = "#ffffff", additionalClasses = "font-black" } },
                                            new { type = "paragraph", content = new { text = "Support Available", align = "center" }, style = new { textColor = "#c7d2fe", additionalClasses = "font-medium tracking-wide uppercase mt-2" } }
                                        } }
                                    }
                                },
                                style = new { gridCols = "grid-cols-4", colsTablet = "grid-cols-2", colsMobile = "grid-cols-1", gapSize = "Large" }
                            }
                        }
                    },
                    // 5. Features / Benefits
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 5,
                        style = new { backgroundType = "color", backgroundColor = "#ffffff", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new { type = "heading", content = new { text = "Why Choose Us", level = 2, align = "center" }, style = new { fontSize = "text-4xl", textColor = "#0f172a", additionalClasses = "mb-4 font-black" } },
                            new { type = "paragraph", content = new { text = "We deliver results that drive growth.", align = "center" }, style = new { fontSize = "text-xl", textColor = "#64748b", additionalClasses = "mb-16" } },
                            new
                            {
                                type = "columns",
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "⚡ Lightning Fast", level = 3, align = "left" }, style = new { fontSize = "text-2xl", textColor = "#0f172a", additionalClasses = "mb-3 font-bold" } },
                                            new { type = "paragraph", content = new { text = "Optimized performance and robust architecture to ensure rapid delivery and response times.", align = "left" }, style = new { textColor = "#64748b", additionalClasses = "leading-relaxed" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "🔒 Enterprise Security", level = 3, align = "left" }, style = new { fontSize = "text-2xl", textColor = "#0f172a", additionalClasses = "mb-3 font-bold" } },
                                            new { type = "paragraph", content = new { text = "Bank-grade security protocols implemented at every layer of your application.", align = "left" }, style = new { textColor = "#64748b", additionalClasses = "leading-relaxed" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "📈 Scalable Growth", level = 3, align = "left" }, style = new { fontSize = "text-2xl", textColor = "#0f172a", additionalClasses = "mb-3 font-bold" } },
                                            new { type = "paragraph", content = new { text = "Infrastructure designed to grow seamlessly with your user base and data volume.", align = "left" }, style = new { textColor = "#64748b", additionalClasses = "leading-relaxed" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "heading", content = new { text = "🤝 Expert Support", level = 3, align = "left" }, style = new { fontSize = "text-2xl", textColor = "#0f172a", additionalClasses = "mb-3 font-bold" } },
                                            new { type = "paragraph", content = new { text = "Dedicated teams ready to assist you around the clock to ensure smooth operations.", align = "left" }, style = new { textColor = "#64748b", additionalClasses = "leading-relaxed" } }
                                        } }
                                    }
                                },
                                style = new { gridCols = "grid-cols-2", gapSize = "Large", additionalClasses = "max-w-5xl mx-auto" }
                            }
                        }
                    },
                    // 6. Testimonials
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 6,
                        style = new { backgroundType = "color", backgroundColor = "#f8fafc", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new { type = "heading", content = new { text = "Client Success Stories", level = 2, align = "center" }, style = new { fontSize = "text-4xl", textColor = "#0f172a", additionalClasses = "mb-16 font-black" } },
                            new
                            {
                                type = "columns",
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            new { type = "quote", content = new { text = "They completely transformed our digital presence. The new platform is blazing fast and incredibly reliable.", author = "Sarah Jenkins", role = "CTO, TechCorp" }, style = new { additionalClasses = "bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-2 transition-all duration-300" } }
                                        } },
                                        new { blocks = new object[] {
                                            new { type = "quote", content = new { text = "Outstanding service from start to finish. They truly understand enterprise needs and delivered beyond expectations.", author = "Michael Chen", role = "Director, Innovate LLC" }, style = new { additionalClasses = "bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-2 transition-all duration-300" } }
                                        } }
                                    }
                                },
                                style = new { gridCols = "grid-cols-2", gapSize = "Large", additionalClasses = "max-w-5xl mx-auto" }
                            }
                        }
                    },
                    // 7. Final CTA
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 7,
                        style = new { backgroundType = "color", backgroundColor = "#0f172a", paddingTop = "pt-24", paddingBottom = "pb-24", textColor = "#ffffff", additionalClasses = "border-t border-indigo-500/30 shadow-[inset_0_20px_50px_rgba(79,70,229,0.1)]" },
                        blocks = new object[]
                        {
                            new { type = "heading", content = new { text = "Ready to get started?", level = 2, align = "center" }, style = new { fontSize = "text-5xl", textColor = "#ffffff", additionalClasses = "mb-6 font-bold" } },
                            new { type = "paragraph", content = new { text = "Join hundreds of forward-thinking companies building the future with us.", align = "center" }, style = new { fontSize = "text-xl", textColor = "#94a3b8", additionalClasses = "mb-10 max-w-2xl mx-auto" } },
                            new { type = "button", content = new { label = "Contact Us Today", url = "/contact", style = "primary", align = "center" }, style = new { additionalClasses = "bg-indigo-600 border-indigo-600 text-white px-10 py-4 text-lg rounded-xl hover:bg-indigo-700 hover:border-indigo-700 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all inline-block" } }
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(content, JsonOptions);
        }

        public static string BuildAboutTemplate()
        {
            var content = new
            {
                schemaVersion = "1.0",
                globalTheme = new { primaryColor = "#0A192F", fontFamily = "Inter" },
                sections = new object[]
                {
                    // Hero Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 1,
                        style = new { backgroundType = "color", backgroundColor = "#0A192F", paddingY = "py-24", textColor = "#ffffff" },
                        blocks = new object[]
                        {
                            CreateHeading("About Us", 1, "center", "text-5xl", "#ffffff"),
                            CreateParagraph("Learn about our mission, vision, and the team behind our success.", "center", "text-xl", "Medium")
                        }
                    },
                    // Story Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 2,
                        style = new { backgroundType = "color", backgroundColor = "#ffffff", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new
                            {
                                id = GenerateId("blk"),
                                type = "columns",
                                sortOrder = 1,
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            CreateImage("https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", "Our office", "Full", "Medium")
                                        } },
                                        new { blocks = new object[] {
                                            CreateHeading("Our Story", 2, "left", "text-4xl", "#0A192F"),
                                            CreateParagraph("Founded with a vision to transform the digital landscape, we have been delivering exceptional solutions since day one. Our commitment to innovation and quality has made us a trusted partner for businesses worldwide.", "left", "text-lg", "Medium")
                                        } }
                                    }
                                },
                                style = new { desktopCols = "grid-cols-2", tabletCols = "grid-cols-1", mobileCols = "grid-cols-1", gap = "Large", alignment = "center" }
                            }
                        }
                    },
                    // Values Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 3,
                        style = new { backgroundType = "color", backgroundColor = "#f8fafc", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            CreateHeading("Core Values", 2, "center", "text-4xl", "#0A192F"),
                            CreateParagraph("The principles that guide everything we do.", "center", "text-lg", "Medium"),
                            new
                            {
                                id = GenerateId("blk"),
                                type = "columns",
                                sortOrder = 3,
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        CreateServiceCard("Innovation", "We constantly seek new and better ways to solve complex problems.", "M13 10V3L4 14h7v7l9-11h-7z"),
                                        CreateServiceCard("Quality", "We maintain the highest standards in every line of code we write.", "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"),
                                        CreateServiceCard("Integrity", "We believe in honest, transparent communication with our clients.", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z")
                                    }
                                },
                                style = new { desktopCols = "grid-cols-3", tabletCols = "grid-cols-1", mobileCols = "grid-cols-1", gap = "Large" }
                            }
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(content, JsonOptions);
        }

        public static string BuildServicesTemplate()
        {
            var content = new
            {
                schemaVersion = "1.0",
                globalTheme = new { primaryColor = "#0A192F", fontFamily = "Inter" },
                sections = new object[]
                {
                    // Hero Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 1,
                        style = new { backgroundType = "color", backgroundColor = "#0A192F", paddingY = "py-24", textColor = "#ffffff" },
                        blocks = new object[]
                        {
                            CreateHeading("Our Services", 1, "center", "text-5xl", "#ffffff"),
                            CreateParagraph("Comprehensive solutions built around your unique business needs.", "center", "text-xl", "Medium")
                        }
                    },
                    // Services Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 2,
                        style = new { backgroundType = "color", backgroundColor = "#ffffff", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new
                            {
                                id = GenerateId("blk"),
                                type = "columns",
                                sortOrder = 1,
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        CreateServiceCard("Web Development", "Custom, responsive websites built with modern technologies. We focus on performance and usability.", "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"),
                                        CreateServiceCard("Cloud Solutions", "Scalable cloud architecture and deployment to ensure your applications run smoothly and securely.", "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"),
                                        CreateServiceCard("UI/UX Design", "Beautiful, intuitive interfaces that provide exceptional user experiences and drive engagement.", "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"),
                                        CreateServiceCard("Mobile Apps", "Native and cross-platform mobile applications that keep you connected with your audience on the go.", "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"),
                                        CreateServiceCard("Consulting", "Expert advice to steer your digital strategy and help you make informed technological decisions.", "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"),
                                        CreateServiceCard("Support & Maintenance", "Ongoing support to ensure your systems stay updated, secure, and performant.", "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z")
                                    }
                                },
                                style = new { desktopCols = "grid-cols-3", tabletCols = "grid-cols-2", mobileCols = "grid-cols-1", gap = "Large" }
                            }
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(content, JsonOptions);
        }

        public static string BuildContactTemplate()
        {
            var content = new
            {
                schemaVersion = "1.0",
                globalTheme = new { primaryColor = "#0A192F", fontFamily = "Inter" },
                sections = new object[]
                {
                    // Hero Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 1,
                        style = new { backgroundType = "color", backgroundColor = "#0A192F", paddingY = "py-24", textColor = "#ffffff" },
                        blocks = new object[]
                        {
                            CreateHeading("Contact Us", 1, "center", "text-5xl", "#ffffff"),
                            CreateParagraph("We'd love to hear about your project.", "center", "text-xl", "Medium")
                        }
                    },
                    // Contact Info & Form Section
                    new
                    {
                        id = GenerateId("sec"),
                        sortOrder = 2,
                        style = new { backgroundType = "color", backgroundColor = "#f8fafc", paddingTop = "pt-24", paddingBottom = "pb-24" },
                        blocks = new object[]
                        {
                            new
                            {
                                id = GenerateId("blk"),
                                type = "columns",
                                sortOrder = 1,
                                content = new
                                {
                                    columns = new object[]
                                    {
                                        new { blocks = new object[] {
                                            CreateHeading("Get in Touch", 2, "left", "text-3xl", "#0A192F"),
                                            CreateParagraph("Fill out the form below or contact us directly using the information provided.", "left", "text-base", "Medium"),
                                            CreateIconList(new[] { "123 Business Avenue, Suite 100", "contact@yourcompany.com", "+1 (555) 123-4567", "Mon - Fri, 9am - 5pm" })
                                        } },
                                        new { blocks = new object[] {
                                            new {
                                                id = GenerateId("blk"),
                                                type = "paragraph",
                                                sortOrder = 1,
                                                content = new { text = "*(Contact Form Placeholder)*<br/>Please integrate your form component here.", align = "center" },
                                                style = new { highlightBg = "#ffffff", fontSize = "text-base", textColor = "#64748b" }
                                            }
                                        } }
                                    }
                                },
                                style = new { desktopCols = "grid-cols-2", tabletCols = "grid-cols-1", mobileCols = "grid-cols-1", gap = "Large", alignment = "top" }
                            }
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(content, JsonOptions);
        }

        // Helper Methods

        private static object CreateHeading(string text, int level, string align, string size, string color)
        {
            return new
            {
                id = GenerateId("blk"),
                type = "heading",
                sortOrder = 1,
                content = new { text = text, level = level, align = align },
                style = new { fontSize = size, textColor = color }
            };
        }

        private static object CreateParagraph(string text, string align, string size, string maxWidth)
        {
            return new
            {
                id = GenerateId("blk"),
                type = "paragraph",
                sortOrder = 2,
                content = new { text = text, align = align },
                style = new { fontSize = size, maxWidth = maxWidth, textColor = "#475569" }
            };
        }

        private static object CreateButton(string label, string url, string style, string align = "left")
        {
            return new
            {
                id = GenerateId("blk"),
                type = "button",
                sortOrder = 3,
                content = new { label = label, url = url, style = style, buttonType = "Link", size = "Medium", align = align },
                style = new { borderRadius = "Medium", hoverEffect = "Lift" }
            };
        }

        private static object CreateImage(string url, string alt, string maxWidth, string radius)
        {
            return new
            {
                id = GenerateId("blk"),
                type = "image",
                sortOrder = 4,
                content = new { url = url, alt = alt },
                style = new { maxWidth = maxWidth, borderRadius = radius, boxShadow = "Medium", objectFit = "cover" }
            };
        }

        private static object CreateIconList(string[] items)
        {
            var listItems = new List<object>();
            foreach (var item in items)
            {
                listItems.Add(new { text = item, icon = "CheckCircle" });
            }

            return new
            {
                id = GenerateId("blk"),
                type = "iconList",
                sortOrder = 5,
                content = new { items = listItems, iconColor = "#0056B3" },
                style = new { fontSize = "text-base", textColor = "#1f2937", spacing = "Medium" }
            };
        }

        private static object CreateServiceCard(string title, string description, string iconSvgPath)
        {
            // Simulating a nested structure inside a column for a service card
            return new { blocks = new object[] {
                new {
                    id = GenerateId("blk"),
                    type = "paragraph",
                    sortOrder = 1,
                    content = new { text = $"<svg class='w-12 h-12 text-[#0056B3] mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='{iconSvgPath}'></path></svg>", align = "left" },
                    style = new { highlightBg = "#ffffff", additionalClasses = "shadow-md rounded-2xl p-8 h-full transition-transform hover:-translate-y-2 hover:shadow-xl duration-300" }
                },
                CreateHeading(title, 3, "left", "text-2xl", "#0A192F"),
                CreateParagraph(description, "left", "text-base", "Full")
            } };
        }
    }
}
