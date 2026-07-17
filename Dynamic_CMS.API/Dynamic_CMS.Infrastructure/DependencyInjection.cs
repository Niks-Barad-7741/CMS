using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using Dynamic_CMS.Domain.Repositories;
using Dynamic_CMS.Infrastructure.Repositories;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Infrastructure.Services;

namespace Dynamic_CMS.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureDI(this IServiceCollection services,
             IConfiguration configuration)
        {
            // 1. Register DbContext with SQL Server
            services.AddDbContext<Data.CmsDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("CmsDatabase"),
                    b => b.MigrationsAssembly("Dynamic_CMS.Infrastructure")));

            // 2. Register Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IMenuItemRepository, MenuItemRepository>();
            // services.AddScoped<ITemplateRepository, TemplateRepository>();
            // services.AddScoped<IClientSiteRepository, ClientSiteRepository>();
            // services.AddScoped<IContentRepository, ContentRepository>();
            // services.AddScoped<IMediaRepository, MediaRepository>();

            // 3. Register External Infrastructure Services
            services.AddScoped<IJwtService, JwtService>();

            // 4. Configure JWT Authentication using RSA Public/Private Keys
            var jwtSection = configuration.GetSection("Jwt");
            var publicKeyPath = jwtSection["PublicKeyPath"] ?? throw new InvalidOperationException("JWT PublicKeyPath is not configured.");

            var publicKeyText = File.ReadAllText(publicKeyPath);
            var rsa = RSA.Create();
            rsa.ImportFromPem(publicKeyText);
            var rsaParameters = rsa.ExportParameters(false);
            var rsaSecurityKey = new RsaSecurityKey(rsaParameters);

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSection["Issuer"],
                    ValidAudience = jwtSection["Audience"],
                    IssuerSigningKey = rsaSecurityKey,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // 5. Configure Dynamic Permission-Based Authorization
            // This will be set up with a custom IAuthorizationPolicyProvider
            // so we never hardcode [Authorize(Roles="SuperAdmin")] — always permission claims.

            return services;
        }
    }
}
