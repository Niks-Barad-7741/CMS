using System;

namespace Dynamic_CMS.Application.DTOs
{
    public class UpdateUserDto
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Client";
        public Guid? OrganizationId { get; set; }
        public bool IsActive { get; set; }
    }
}
