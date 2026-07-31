using System;

namespace Dynamic_CMS.Domain.Entities
{
    public class SubMenuItem
    {
        public Guid Id { get; set; }
        public Guid MenuItemId { get; set; }  // FK to parent MenuItem
        public string Title { get; set; } = string.Empty;
        public string Page { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsVisible { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "Admin";
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }

        // Navigation
        public Guid? OrganizationId { get; set; }
        public Organization? Organization { get; set; }
        public MenuItem MenuItem { get; set; } = null!;
    }
}
