using System;

namespace Dynamic_CMS.Application.DTOs.PageContent
{
    public class PageContentDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid MenuItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }
}
