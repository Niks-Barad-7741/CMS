using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Dynamic_CMS.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationDI(this IServiceCollection services)
        {
            // 1. Register AutoMapper — scans this assembly for all Profile classes
            services.AddAutoMapper(cfg => cfg.AddMaps(Assembly.GetExecutingAssembly()));

            // 2. Register FluentValidation
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // 3. Register Application Services
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IMenuItemService, Dynamic_CMS.Application.Services.MenuItemService>();
            
            // 3. Register Application Services (will be added as we build them)
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IUserService, Dynamic_CMS.Application.Services.UserService>();
            // services.AddScoped<IAuthService, AuthService>();
            // services.AddScoped<IThemeService, ThemeService>();
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IOrganizationService, Dynamic_CMS.Application.Services.OrganizationService>();
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IPageContentService, Dynamic_CMS.Application.Services.PageContentService>();

            return services;
        }
    }
}
