using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;

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
        public DbSet<User> Users { get; set; }

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

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedNever();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(256);

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.Property(e => e.PasswordHash)
                    .IsRequired();

                entity.Property(e => e.CreatedAt)
                    .IsRequired();

                entity.Property(e => e.IsActive)
                    .HasDefaultValue(true);
            });
        }
    }
}
