using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface IPageContentRepository
    {
        Task<IEnumerable<PageContent>> GetAllByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken);
        Task<PageContent?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<PageContent?> GetByOrgAndMenuItemAsync(Guid organizationId, Guid menuItemId, CancellationToken cancellationToken);
        Task<PageContent?> GetByOrgSlugAndMenuPageAsync(string orgSlug, string menuPage, CancellationToken cancellationToken);
        Task<PageContent> AddAsync(PageContent pageContent, CancellationToken cancellationToken);
        Task UpdateAsync(PageContent pageContent, CancellationToken cancellationToken);
        Task DeleteAsync(PageContent pageContent, CancellationToken cancellationToken);
    }
}
