using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;
using BCrypt.Net;

namespace Dynamic_CMS.Infrastructure.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<CmsDbContext>();

            // Ensure the database is created
            await context.Database.MigrateAsync();

            // Check if any Admin user exists
            if (!context.Users.Any(u => u.Role == "Admin"))
            {
                var adminUser = new User
                {
                    Id = Guid.NewGuid(),
                    Name = "Super Admin",
                    Email = "admin@admin.com", // You can change this later
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@1234"),
                    Role = "Admin",
                    OrganizationId = null, // Admin is not tied to a specific organization
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                context.Users.Add(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}
