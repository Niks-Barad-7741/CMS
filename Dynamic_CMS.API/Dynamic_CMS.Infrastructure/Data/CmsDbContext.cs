using Microsoft.EntityFrameworkCore;

namespace Dynamic_CMS.Infrastructure.Data
{
    public class CmsDbContext : DbContext
    {
        public CmsDbContext(DbContextOptions<CmsDbContext> options) : base(options)
        {
        }

        // ========================
        // RBAC Tables
        // ========================
        // public DbSet<Role> Roles { get; set; }
        // public DbSet<Permission> Permissions { get; set; }
        // public DbSet<RolePermission> RolePermissions { get; set; }
        // public DbSet<User> Users { get; set; }
        // public DbSet<RefreshToken> RefreshTokens { get; set; }

        // ========================
        // Template Engine Tables
        // ========================
        // public DbSet<Template> Templates { get; set; }
        // public DbSet<Section> Sections { get; set; }
        // public DbSet<SectionField> SectionFields { get; set; }

        // ========================
        // Client Site Tables
        // ========================
        // public DbSet<ClientSite> ClientSites { get; set; }
        // public DbSet<SiteSection> SiteSections { get; set; }
        // public DbSet<SectionItem> SectionItems { get; set; }
        // public DbSet<ContentValue> ContentValues { get; set; }
        // public DbSet<ThemeConfig> ThemeConfigs { get; set; }
        // public DbSet<NavMenuItem> NavMenuItems { get; set; }
        // public DbSet<Media> Media { get; set; }
        // public DbSet<SiteTeamMember> SiteTeamMembers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Fluent API configurations and seed data will go here
            // modelBuilder.ApplyConfigurationsFromAssembly(typeof(CmsDbContext).Assembly);
        }
    }
}
