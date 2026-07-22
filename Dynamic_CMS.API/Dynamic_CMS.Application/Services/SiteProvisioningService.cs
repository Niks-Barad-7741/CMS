using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.Menu;
using Dynamic_CMS.Application.DTOs.PageContent;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Application.Services;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class SiteProvisioningService : ISiteProvisioningService
    {
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMenuItemRepository _menuItemRepository;
        private readonly IPageContentRepository _pageContentRepository;

        public SiteProvisioningService(
            IOrganizationRepository organizationRepository,
            IMenuItemRepository menuItemRepository,
            IPageContentRepository pageContentRepository)
        {
            _organizationRepository = organizationRepository;
            _menuItemRepository = menuItemRepository;
            _pageContentRepository = pageContentRepository;
        }

        public async Task EnsureDefaultMenusAsync()
        {
            foreach (var menu in DefaultSitePages.Menus)
            {
                var existing = await _menuItemRepository.GetByPageAsync(menu.Page);
                if (existing != null) continue;

                await _menuItemRepository.AddAsync(new MenuItem
                {
                    Id = Guid.NewGuid(),
                    Title = menu.Title,
                    Page = menu.Page,
                    SortOrder = menu.SortOrder,
                    IsVisible = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                });
            }
        }

        public async Task EnsureDefaultPagesForOrganizationAsync(Guid organizationId, string orgSlug, string orgName)
        {
            await EnsureDefaultMenusAsync();

            var allMenus = await _menuItemRepository.GetAllAsync();
            var menuByPage = allMenus.ToDictionary(m => m.Page, StringComparer.OrdinalIgnoreCase);

            foreach (var page in DefaultSitePages.Pages)
            {
                if (!menuByPage.TryGetValue(page.Page, out var menuItem)) continue;

                var existing = await _pageContentRepository.GetByOrgAndMenuItemAsync(
                    organizationId, menuItem.Id, CancellationToken.None);

                if (existing != null) continue;

                var bodyHtml = DefaultSitePages.PersonalizeHtml(page.BodyHtml, orgSlug, orgName);

                await _pageContentRepository.AddAsync(new PageContent
                {
                    Id = Guid.NewGuid(),
                    OrganizationId = organizationId,
                    MenuItemId = menuItem.Id,
                    Title = page.Title,
                    BodyHtml = bodyHtml,
                    Status = "Published",
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = "System",
                    CreateDate = DateTime.UtcNow
                }, CancellationToken.None);
            }
        }

        public async Task<SiteProfileDto?> GetSiteProfileAsync(string orgSlug)
        {
            var organization = await _organizationRepository.GetBySlugAsync(orgSlug);
            if (organization == null || !organization.IsActive) return null;

            await EnsureDefaultPagesForOrganizationAsync(
                organization.Id, organization.Slug, organization.Name);

            return new SiteProfileDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Slug = organization.Slug,
                IsActive = organization.IsActive
            };
        }

        public async Task<IEnumerable<MenuItemDto>> GetPublicMenusAsync(string orgSlug)
        {
            var organization = await _organizationRepository.GetBySlugAsync(orgSlug);
            if (organization == null || !organization.IsActive)
                return Enumerable.Empty<MenuItemDto>();

            await EnsureDefaultMenusAsync();

            var menus = await _menuItemRepository.GetAllAsync();
            return menus
                .Where(m => m.IsVisible)
                .OrderBy(m => m.SortOrder)
                .Select(m => new MenuItemDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Page = m.Page,
                    SortOrder = m.SortOrder,
                    IsVisible = m.IsVisible
                });
        }

        public async Task<PageContentDto?> GetPublicPageAsync(
            string orgSlug, string pageSlug, CancellationToken cancellationToken = default)
        {
            var organization = await _organizationRepository.GetBySlugAsync(orgSlug);
            if (organization == null || !organization.IsActive) return null;

            await EnsureDefaultPagesForOrganizationAsync(
                organization.Id, organization.Slug, organization.Name);

            var normalizedSlug = pageSlug.ToLowerInvariant();
            var content = await _pageContentRepository.GetByOrgSlugAndMenuPageAsync(
                orgSlug, normalizedSlug, cancellationToken);

            if (content != null && content.Status == "Published")
            {
                return MapToDto(content);
            }

            var defaultHtml = DefaultSitePages.GetBodyHtml(normalizedSlug);
            var defaultTitle = DefaultSitePages.GetTitle(normalizedSlug);
            if (defaultHtml == null || defaultTitle == null) return null;

            return new PageContentDto
            {
                Id = Guid.Empty,
                OrganizationId = organization.Id,
                MenuItemId = Guid.Empty,
                Title = defaultTitle,
                BodyHtml = DefaultSitePages.PersonalizeHtml(defaultHtml, orgSlug, organization.Name),
                Status = "Published",
                UpdatedAt = DateTime.UtcNow
            };
        }

        private static PageContentDto MapToDto(PageContent content) => new()
        {
            Id = content.Id,
            OrganizationId = content.OrganizationId,
            MenuItemId = content.MenuItemId,
            Title = content.Title,
            BodyHtml = content.BodyHtml,
            Status = content.Status,
            TemplateId = content.TemplateId,
            ContentJson = content.ContentJson,
            UpdatedAt = content.UpdatedAt,
            CreatedBy = content.CreatedBy,
            CreateDate = content.CreateDate,
            ModifiedBy = content.ModifiedBy,
            ModifiedDate = content.ModifiedDate
        };
    }
}
