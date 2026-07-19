using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs.PageContent;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IPageContentService
    {
        Task<IEnumerable<PageContentDto>> GetAllByOrganizationAsync(Guid organizationId, CancellationToken cancellationToken);
        Task<PageContentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<PageContentDto?> GetPublicContentAsync(string orgSlug, string menuSlug, CancellationToken cancellationToken);
        Task<PageContentDto> CreateAsync(CreatePageContentDto dto, CancellationToken cancellationToken);
        Task<(bool success, string? error)> UpdateAsync(Guid id, UpdatePageContentDto dto, CancellationToken cancellationToken);
        Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
    }
}
