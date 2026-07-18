using System;

namespace Dynamic_CMS.Application.DTOs.PageContent
{
    public class CreatePageContentDto
    {
        public string? OrganizationId { get; set; }
        public string? MenuItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string BodyHtml { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
