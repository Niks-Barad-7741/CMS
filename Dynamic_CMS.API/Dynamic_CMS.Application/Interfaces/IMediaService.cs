using Dynamic_CMS.Application.DTOs.Media;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IMediaService
    {
        Task<IEnumerable<MediaDto>> GetAllByOrganizationAsync(Guid organizationId);
        Task<MediaDto?> GetByIdAsync(Guid id);
        Task<(bool success, string? error, MediaDto? data)> UploadMediaAsync(UploadMediaDto dto, string webRootPath, Guid userId);
        Task<(bool success, string? error)> DeleteMediaAsync(Guid id, string webRootPath);
    }
}
