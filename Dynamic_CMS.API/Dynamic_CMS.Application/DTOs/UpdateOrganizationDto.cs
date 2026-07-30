using System;

namespace Dynamic_CMS.Application.DTOs
{
    public class UpdateOrganizationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        public string? FooterDescription { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? SocialTwitter { get; set; }
        public string? SocialFacebook { get; set; }
        public string? SocialInstagram { get; set; }
    }
}
