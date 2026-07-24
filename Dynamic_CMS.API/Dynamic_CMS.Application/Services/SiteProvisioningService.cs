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
            // No default pages inserted into PageContents table automatically.
            // PageContent table remains empty until explicitly saved by admin/user.
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
                IsActive = organization.IsActive,
                FooterDescription = organization.FooterDescription,
                ContactEmail = organization.ContactEmail,
                ContactPhone = organization.ContactPhone,
                Address = organization.Address,
                SocialTwitter = organization.SocialTwitter,
                SocialLinkedin = organization.SocialLinkedin,
                SocialGithub = organization.SocialGithub
            };
        }

        public async Task<IEnumerable<MenuItemDto>> GetPublicMenusAsync(string orgSlug)
        {
            var organization = await _organizationRepository.GetBySlugAsync(orgSlug);
            if (organization == null || !organization.IsActive)
                return Enumerable.Empty<MenuItemDto>();

            await EnsureDefaultMenusAsync();

            var orgPageContents = await _pageContentRepository.GetAllByOrganizationIdAsync(organization.Id, CancellationToken.None);
            var savedMenuItemIds = orgPageContents
                .Where(p => !p.IsDeleted)
                .Select(p => p.MenuItemId)
                .ToHashSet();

            var allMenus = await _menuItemRepository.GetAllAsync();
            return allMenus
                .Where(m => m.IsVisible && savedMenuItemIds.Contains(m.Id))
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

            if (content == null)
            {
                var alias = normalizedSlug switch
                {
                    "about" => "about-us",
                    "about-us" => "about",
                    "contact" => "contact-us",
                    "contact-us" => "contact",
                    _ => null
                };
                if (alias != null)
                {
                    content = await _pageContentRepository.GetByOrgSlugAndMenuPageAsync(
                        orgSlug, alias, cancellationToken);
                }
            }

            if (content != null && content.Status == "Published")
            {
                return MapToDto(content);
            }

            // No saved page content in database -> return null (do not return demo website HTML)
            return null;
        }

        private static PageContentDto MapToDto(PageContent content) => new()
        {
            Id = content.Id,
            OrganizationId = content.OrganizationId,
            MenuItemId = content.MenuItemId,
            Title = content.Title,
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
