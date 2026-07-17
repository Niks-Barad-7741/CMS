using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Infrastructure.Data
{
    public class CmsDbContext : DbContext
    {
        public CmsDbContext(DbContextOptions<CmsDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Organization> Organizations { get; set; } = null!;
        public DbSet<MenuItem> MenuItems { get; set; } = null!;
        public DbSet<PageContent> PageContents { get; set; } = null!;
        public DbSet<Media> Media { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.IsActive).HasDefaultValue(true);

                // Navigation
                entity.HasOne(u => u.Organization)
                    .WithMany(o => o.Users)
                    .HasForeignKey(u => u.OrganizationId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Organization>(entity =>
            {
                entity.ToTable("Organizations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            modelBuilder.Entity<MenuItem>(entity =>
            {
                entity.ToTable("MenuItems");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<PageContent>(entity =>
            {
                entity.ToTable("PageContents");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                
                // Unique constraint
                entity.HasIndex(p => new { p.OrganizationId, p.MenuItemId }).IsUnique();

                // Navigations
                entity.HasOne(p => p.Organization)
                    .WithMany(o => o.PageContents)
                    .HasForeignKey(p => p.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(p => p.MenuItem)
                    .WithMany(m => m.PageContents)
                    .HasForeignKey(p => p.MenuItemId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Media>(entity =>
            {
                entity.ToTable("Media");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FilePath).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.FileType).IsRequired().HasMaxLength(100);

                // Navigations
                entity.HasOne(m => m.Organization)
                    .WithMany(o => o.Media)
                    .HasForeignKey(m => m.OrganizationId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(m => m.UploadedByUser)
                    .WithMany()
                    .HasForeignKey(m => m.UploadedByUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
