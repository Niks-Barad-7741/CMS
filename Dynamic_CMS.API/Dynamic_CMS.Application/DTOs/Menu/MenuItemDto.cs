using System;

namespace Dynamic_CMS.Application.DTOs.Menu
{
    public class MenuItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsVisible { get; set; }
    }
}
