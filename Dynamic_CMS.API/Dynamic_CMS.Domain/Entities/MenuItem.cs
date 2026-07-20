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

        // Navigation property
        public ICollection<PageContent> PageContents { get; set; } = new List<PageContent>();
    }
}
