using System;
using System.Collections.Generic;

namespace Dynamic_CMS.Domain.Entities
{
    public class MenuItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Page { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsVisible { get; set; } = true;
        public bool IsDeleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "Admin";
        public DateTime? ModifiedAt { get; set; }
        public string? ModifiedBy { get; set; }

        // Navigation property
        public ICollection<PageContent> PageContents { get; set; } = new List<PageContent>();
    }
}
