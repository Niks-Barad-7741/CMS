namespace Dynamic_CMS.Application.DTOs
{
    public class SiteProfileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public string? FooterDescription { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? SocialTwitter { get; set; }
        public string? SocialFacebook { get; set; }
        public string? SocialInstagram { get; set; }
        public string? LogoUrl { get; set; }
        public string? NavbarLayout { get; set; }
    }
}
