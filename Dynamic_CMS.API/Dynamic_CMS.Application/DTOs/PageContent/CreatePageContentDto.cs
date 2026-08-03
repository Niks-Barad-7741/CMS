using System;

namespace Dynamic_CMS.Application.DTOs.PageContent
{
    public class CreatePageContentDto
    {
        public Guid? OrganizationId { get; set; }
        public Guid? MenuItemId { get; set; }
        public Guid? SubMenuItemId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        
        public string? TemplateId { get; set; }
        public string? ContentJson { get; set; }
    }
}
