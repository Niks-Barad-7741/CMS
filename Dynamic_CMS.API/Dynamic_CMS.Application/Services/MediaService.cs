using Dynamic_CMS.Application.DTOs.Media;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class MediaService : IMediaService
    {
        private readonly IMediaRepository _repository;
        private readonly IOrganizationRepository _organizationRepository;

        public MediaService(IMediaRepository repository, IOrganizationRepository organizationRepository)
        {
            _repository = repository;
            _organizationRepository = organizationRepository;
        }

        public async Task<IEnumerable<MediaDto>> GetAllByOrganizationAsync(Guid organizationId)
        {
            var mediaList = await _repository.GetAllByOrganizationIdAsync(organizationId);

            return mediaList.Select(m => new MediaDto
            {
                Id = m.Id,
                OrganizationId = m.OrganizationId,
                FileName = m.FileName,
                FilePath = m.FilePath,
                FileType = m.FileType,
                FileSizeBytes = m.FileSizeBytes,
                UploadedAt = m.UploadedAt,
                UploadedByUserId = m.UploadedByUserId
            });
        }

        public async Task<MediaDto?> GetByIdAsync(Guid id)
        {
            var media = await _repository.GetByIdAsync(id);
            if (media == null) return null;

            return new MediaDto
            {
                Id = media.Id,
                OrganizationId = media.OrganizationId,
                FileName = media.FileName,
                FilePath = media.FilePath,
                FileType = media.FileType,
                FileSizeBytes = media.FileSizeBytes,
                UploadedAt = media.UploadedAt,
                UploadedByUserId = media.UploadedByUserId
            };
        }

        public async Task<(bool success, string? error, MediaDto? data)> UploadMediaAsync(UploadMediaDto dto, string webRootPath, Guid userId)
        {
            var organization = await _organizationRepository.GetByIdAsync(dto.OrganizationId!.Value);
            if (organization == null)
            {
                return (false, "Organization not found.", null);
            }

            if (dto.File == null || dto.File.Length == 0)
            {
                return (false, "No file uploaded.", null);
            }

            // Create a unique file name
            var fileExtension = Path.GetExtension(dto.File.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            // Determine the save path: wwwroot/uploads/{orgSlug}/{fileName}
            var orgUploadsFolder = Path.Combine(webRootPath, "uploads", organization.Slug);
            if (!Directory.Exists(orgUploadsFolder))
            {
                Directory.CreateDirectory(orgUploadsFolder);
            }

            var physicalFilePath = Path.Combine(orgUploadsFolder, uniqueFileName);

            // Save the file to disk
            using (var stream = new FileStream(physicalFilePath, FileMode.Create))
            {
                await dto.File.CopyToAsync(stream);
            }

            // Create the relative path for web access
            var relativeFilePath = $"/uploads/{organization.Slug}/{uniqueFileName}";

            var mediaEntity = new Media
            {
                Id = Guid.NewGuid(),
                OrganizationId = dto.OrganizationId!.Value,
                FileName = dto.File.FileName,
                FilePath = relativeFilePath,
                FileType = dto.File.ContentType,
                FileSizeBytes = dto.File.Length,
                UploadedAt = DateTime.UtcNow,
                UploadedByUserId = userId
            };

            await _repository.AddAsync(mediaEntity);

            var resultDto = new MediaDto
            {
                Id = mediaEntity.Id,
                OrganizationId = mediaEntity.OrganizationId,
                FileName = mediaEntity.FileName,
                FilePath = mediaEntity.FilePath,
                FileType = mediaEntity.FileType,
                FileSizeBytes = mediaEntity.FileSizeBytes,
                UploadedAt = mediaEntity.UploadedAt,
                UploadedByUserId = mediaEntity.UploadedByUserId
            };

            return (true, null, resultDto);
        }

        public async Task<(bool success, string? error)> DeleteMediaAsync(Guid id, string webRootPath)
        {
            var media = await _repository.GetByIdAsync(id);
            if (media == null) return (false, "Media file not found.");

            var organization = await _organizationRepository.GetByIdAsync(media.OrganizationId);
            if (organization == null) return (false, "Organization not found.");

            // Construct physical path to delete file
            var uniqueFileName = Path.GetFileName(media.FilePath);
            var physicalFilePath = Path.Combine(webRootPath, "uploads", organization.Slug, uniqueFileName);

            if (File.Exists(physicalFilePath))
            {
                File.Delete(physicalFilePath);
            }

            await _repository.DeleteAsync(media);
            return (true, null);
        }
    }
}
