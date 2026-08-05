using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Application.Interfaces;
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

            var siteProvisioning = scope.ServiceProvider.GetRequiredService<ISiteProvisioningService>();
            var activeOrganizations = context.Organizations.Where(o => o.IsActive).ToList();
            foreach (var org in activeOrganizations)
            {
                await siteProvisioning.EnsureDefaultMenusAsync(org.Id);
                await siteProvisioning.EnsureDefaultPagesForOrganizationAsync(org.Id, org.Slug, org.Name);

                // Migrate legacy PageContents (pages linked to old global menus) to the newly created org-specific menus
                var orgMenus = context.MenuItems.Where(m => m.OrganizationId == org.Id).ToList();
                var legacyPageContents = context.PageContents
                    .Include(p => p.MenuItem)
                    .Where(p => p.OrganizationId == org.Id && p.MenuItem.OrganizationId == null)
                    .ToList();

                foreach (var legacyPage in legacyPageContents)
                {
                    var oldMenu = legacyPage.MenuItem;
                    if (oldMenu != null)
                    {
                        var newMenu = orgMenus.FirstOrDefault(m => m.Page == oldMenu.Page || m.Title.ToLower() == oldMenu.Title.ToLower());
                        if (newMenu != null)
                        {
                            // Check if a PageContent already exists for the new Menu
                            bool alreadyExists = context.PageContents.Any(p => p.OrganizationId == org.Id && p.MenuItemId == newMenu.Id);
                            if (alreadyExists)
                            {
                                // If the user already saved a new page content for this menu, just delete the legacy one
                                context.PageContents.Remove(legacyPage);
                            }
                            else
                            {
                                // Otherwise, migrate it
                                legacyPage.MenuItemId = newMenu.Id;
                            }
                        }
                    }
                }

                if (legacyPageContents.Any())
                {
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
