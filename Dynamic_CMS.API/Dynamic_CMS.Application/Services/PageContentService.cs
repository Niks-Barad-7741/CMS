using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Dynamic_CMS.Application.DTOs.PageContent;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class PageContentService : IPageContentService
    {
        private readonly IPageContentRepository _pageContentRepository;
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IMenuItemRepository _menuItemRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<PageContentService> _logger;

        public PageContentService(
            IPageContentRepository pageContentRepository,
            IOrganizationRepository organizationRepository,
            IMenuItemRepository menuItemRepository,
            IMapper mapper,
            ILogger<PageContentService> logger)
        {
            _pageContentRepository = pageContentRepository;
            _organizationRepository = organizationRepository;
            _menuItemRepository = menuItemRepository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<PageContentDto>> GetAllByOrganizationAsync(Guid organizationId, CancellationToken cancellationToken)
        {
            var contents = await _pageContentRepository.GetAllByOrganizationIdAsync(organizationId, cancellationToken);
            return _mapper.Map<IEnumerable<PageContentDto>>(contents);
        }

        public async Task<PageContentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            var content = await _pageContentRepository.GetByIdAsync(id, cancellationToken);
            if (content == null) return null;
            return _mapper.Map<PageContentDto>(content);
        }

        public async Task<PageContentDto?> GetPublicContentAsync(string orgSlug, string menuPage, CancellationToken cancellationToken)
        {
            try
            {
                var content = await _pageContentRepository.GetByOrgSlugAndMenuPageAsync(orgSlug, menuPage, cancellationToken);
                
                if (content == null || content.Status != "Published")
                {
                    _logger.LogWarning("Public content retrieval failed or not published for Org: {OrgSlug}, Menu: {MenuPage}", orgSlug, menuPage);
                    return null;
                }

                return _mapper.Map<PageContentDto>(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving public content for Org: {OrgSlug}, Menu: {MenuPage}", orgSlug, menuPage);
                throw;
            }
        }

        public async Task<PageContentDto> CreateAsync(CreatePageContentDto dto, string? userName, CancellationToken cancellationToken)
        {
            var orgId = dto.OrganizationId!.Value;
            var menuId = dto.MenuItemId!.Value;

            var org = await _organizationRepository.GetByIdAsync(orgId);
            if (org == null)
                throw new InvalidOperationException("Organization does not exist.");

            var menuItem = await _menuItemRepository.GetByIdAsync(menuId);
            if (menuItem == null)
                throw new InvalidOperationException("MenuItem does not exist.");

            var existing = await _pageContentRepository.GetByOrgAndMenuItemAsync(orgId, menuId, cancellationToken);
            if (existing != null)
                throw new InvalidOperationException("Page content for this organization and menu item already exists.");

            var targetOrder = dto.SortOrder > 0 ? dto.SortOrder : (menuItem.SortOrder > 0 ? menuItem.SortOrder : 1);

            var pageContent = new PageContent
            {
                Id = Guid.NewGuid(),
                OrganizationId = orgId,
                MenuItemId = menuId,
                Title = dto.Title,
                Status = string.IsNullOrWhiteSpace(dto.Status) ? "Published" : dto.Status,
                SortOrder = targetOrder,
                TemplateId = dto.TemplateId,
                ContentJson = dto.ContentJson,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = "Admin",
                CreateDate = DateTime.UtcNow,
                ModifiedBy = null,
                ModifiedDate = null
            };

            var created = await _pageContentRepository.AddAsync(pageContent, cancellationToken);
            await ReorderPageContentsAsync(orgId, created.Id, targetOrder, cancellationToken);

            _logger.LogInformation("Page content created with ID: {Id}", created.Id);
            return _mapper.Map<PageContentDto>(created);
        }

        public async Task<(bool success, string? error)> UpdateAsync(Guid id, UpdatePageContentDto dto, string? userName, CancellationToken cancellationToken)
        {
            var content = await _pageContentRepository.GetByIdAsync(id, cancellationToken);
            if (content == null)
            {
                return (false, "Page content not found.");
            }

            var newOrder = dto.SortOrder > 0 ? dto.SortOrder : (content.SortOrder > 0 ? content.SortOrder : 1);

            content.Title = dto.Title;
            content.Status = string.IsNullOrWhiteSpace(dto.Status) ? "Published" : dto.Status;
            content.SortOrder = newOrder;
            content.TemplateId = dto.TemplateId;
            content.ContentJson = dto.ContentJson;
            content.UpdatedAt = DateTime.UtcNow;
            content.ModifiedBy = "Admin";
            content.ModifiedDate = DateTime.UtcNow;

            await _pageContentRepository.UpdateAsync(content, cancellationToken);
            await ReorderPageContentsAsync(content.OrganizationId, content.Id, newOrder, cancellationToken);

            _logger.LogInformation("Page content updated with ID: {Id}", id);
            
            return (true, null);
        }

        private async Task ReorderPageContentsAsync(Guid orgId, Guid targetId, int requestedOrder, CancellationToken cancellationToken)
        {
            var orgPages = (await _pageContentRepository.GetAllByOrganizationIdAsync(orgId, cancellationToken))
                .Where(p => !p.IsDeleted)
                .OrderBy(p => p.SortOrder > 0 ? p.SortOrder : 999)
                .ToList();

            if (orgPages.Count == 0) return;

            var target = orgPages.FirstOrDefault(p => p.Id == targetId);
            if (target != null)
            {
                orgPages.Remove(target);
                int insertIdx = Math.Clamp(requestedOrder - 1, 0, orgPages.Count);
                orgPages.Insert(insertIdx, target);

                for (int i = 0; i < orgPages.Count; i++)
                {
                    var p = orgPages[i];
                    int expectedOrder = i + 1;
                    if (p.SortOrder != expectedOrder)
                    {
                        p.SortOrder = expectedOrder;
                        await _pageContentRepository.UpdateAsync(p, cancellationToken);
                    }
                }
            }
        }

        public async Task<PageContentDto> SaveByOrgAndMenuItemAsync(Guid organizationId, Guid menuItemId, CreatePageContentDto dto, string? userName, CancellationToken cancellationToken)
        {
            var existing = await _pageContentRepository.GetByOrgAndMenuItemAsync(organizationId, menuItemId, cancellationToken);
            if (existing != null)
            {
                var updateDto = new UpdatePageContentDto
                {
                    Title = dto.Title,
                    Status = dto.Status,
                    SortOrder = dto.SortOrder,
                    TemplateId = dto.TemplateId,
                    ContentJson = dto.ContentJson
                };
                await UpdateAsync(existing.Id, updateDto, userName, cancellationToken);
                var updated = await _pageContentRepository.GetByIdAsync(existing.Id, cancellationToken);
                return _mapper.Map<PageContentDto>(updated!);
            }
            else
            {
                dto.OrganizationId = organizationId;
                dto.MenuItemId = menuItemId;
                return await CreateAsync(dto, userName, cancellationToken);
            }
        }

        public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
        {
            var content = await _pageContentRepository.GetByIdAsync(id, cancellationToken);
            if (content == null) return false;

            await _pageContentRepository.DeleteAsync(content, cancellationToken);
            _logger.LogInformation("Page content soft-deleted with ID: {Id}", id);
            return true;
        }
    }
}
