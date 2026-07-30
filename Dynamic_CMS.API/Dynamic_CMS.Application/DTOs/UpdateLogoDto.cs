using System;
using System.ComponentModel.DataAnnotations;

namespace Dynamic_CMS.Application.DTOs
{
    public class UpdateLogoDto
    {
        [Required]
        public string LogoUrl { get; set; } = string.Empty;
    }
}
