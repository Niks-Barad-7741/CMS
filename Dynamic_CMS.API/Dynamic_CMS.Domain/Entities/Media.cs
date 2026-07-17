using System;

namespace Dynamic_CMS.Domain.Entities
{
    public class Media
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        public Guid UploadedByUserId { get; set; }

        // Navigation properties
        public Organization Organization { get; set; } = null!;
        public User UploadedByUser { get; set; } = null!;
    }
}
