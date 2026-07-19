namespace Dynamic_CMS.Application.DTOs.Media
{
    public class MediaDto
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime UploadedAt { get; set; }
        public Guid UploadedByUserId { get; set; }
    }
}
