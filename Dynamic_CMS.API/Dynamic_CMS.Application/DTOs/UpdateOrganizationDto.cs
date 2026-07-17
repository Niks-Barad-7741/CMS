using System;

namespace Dynamic_CMS.Application.DTOs
{
    public class UpdateOrganizationDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
