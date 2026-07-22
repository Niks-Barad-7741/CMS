using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.Menu;
using Dynamic_CMS.Application.DTOs.PageContent;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface ISiteProvisioningService
    {
        Task EnsureDefaultMenusAsync();
        Task EnsureDefaultPagesForOrganizationAsync(Guid organizationId, string orgSlug, string orgName);
        Task<IEnumerable<MenuItemDto>> GetPublicMenusAsync(string orgSlug);
        Task<SiteProfileDto?> GetSiteProfileAsync(string orgSlug);
        Task<PageContentDto?> GetPublicPageAsync(string orgSlug, string pageSlug, CancellationToken cancellationToken = default);
    }
}
