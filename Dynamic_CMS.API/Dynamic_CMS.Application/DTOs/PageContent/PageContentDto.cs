using System;

namespace Dynamic_CMS.Application.DTOs.PageContent
{
    public class PageContentDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid MenuItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        
        public string? TemplateId { get; set; }
        public string? ContentJson { get; set; }

        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreateDate { get; set; }
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }
}
