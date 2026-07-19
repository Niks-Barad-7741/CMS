using System;

namespace Dynamic_CMS.Domain.Entities
{
    public class PageContent
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid MenuItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public string Status { get; set; } = "Draft"; // "Draft" or "Published"
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;

        // Navigation properties
        public Organization Organization { get; set; } = null!;
        public MenuItem MenuItem { get; set; } = null!;
    }
}
