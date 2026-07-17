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
            services.AddAutoMapper(Assembly.GetExecutingAssembly());

            // 2. Register FluentValidation
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // 3. Register Application Services
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IMenuItemService, Dynamic_CMS.Application.Services.MenuItemService>();
            
            // services.AddScoped<IAuthService, AuthService>();
            // services.AddScoped<IThemeService, ThemeService>();

            return services;
        }
    }
}
