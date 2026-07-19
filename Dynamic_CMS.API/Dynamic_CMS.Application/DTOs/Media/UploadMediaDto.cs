using System;
using Microsoft.AspNetCore.Http;

namespace Dynamic_CMS.Application.DTOs.Media
{
    public class UploadMediaDto
    {
        public Guid? OrganizationId { get; set; }
        public IFormFile File { get; set; } = null!;
    }
}
