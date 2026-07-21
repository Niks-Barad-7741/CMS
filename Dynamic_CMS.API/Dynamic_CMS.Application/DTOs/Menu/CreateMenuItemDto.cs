using System.ComponentModel.DataAnnotations;

namespace Dynamic_CMS.Application.DTOs.Menu
{
    public class CreateMenuItemDto
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Page { get; set; } = string.Empty;

        public int SortOrder { get; set; }
        public bool IsVisible { get; set; } = true;
    }
}
