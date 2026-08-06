using System;
using System.Collections.Generic;

namespace Dynamic_CMS.Domain.Entities
{
    public class Organization
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string? ModifiedBy { get; set; }

        // Footer & Contact Customization Fields
        public string? FooterDescription { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? Address { get; set; }
        public string? SocialTwitter { get; set; }
        public string? SocialFacebook { get; set; }
        public string? SocialInstagram { get; set; }
        public string? LogoUrl { get; set; }
        public string NavbarLayout { get; set; } = "LogoLeft";

        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<PageContent> PageContents { get; set; } = new List<PageContent>();
        public ICollection<Media> Media { get; set; } = new List<Media>();
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
        public ICollection<SubMenuItem> SubMenuItems { get; set; } = new List<SubMenuItem>();
    }
}
