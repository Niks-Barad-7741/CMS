using FluentValidation;
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

            // 2. Register FluentValidation — scans this assembly for all AbstractValidator<T> classes
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            // 3. Register Application Services (will be added as we build them)
            services.AddScoped<Dynamic_CMS.Application.Interfaces.IUserService, Dynamic_CMS.Application.Services.UserService>();
            // services.AddScoped<IAuthService, AuthService>();
            // services.AddScoped<IRoleService, RoleService>();
            // services.AddScoped<IPermissionService, PermissionService>();
            // services.AddScoped<ITemplateService, TemplateService>();
            // services.AddScoped<IClientSiteService, ClientSiteService>();
            // services.AddScoped<IContentService, ContentService>();
            // services.AddScoped<IMediaService, MediaService>();
            // services.AddScoped<INavMenuService, NavMenuService>();
            // services.AddScoped<IThemeService, ThemeService>();

            return services;
        }
    }
}
