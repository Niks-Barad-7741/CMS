using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs.SubMenu;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class SubMenuItemService : ISubMenuItemService
    {
        private readonly ISubMenuItemRepository _repository;
        private readonly IMenuItemRepository _menuRepository;

        public SubMenuItemService(ISubMenuItemRepository repository, IMenuItemRepository menuRepository)
        {
            _repository = repository;
            _menuRepository = menuRepository;
        }

        public async Task<IEnumerable<SubMenuItemDto>> GetAllSubMenusAsync()
        {
            var subMenus = await _repository.GetAllAsync();
            return subMenus.Select(MapToDto).OrderBy(s => s.SortOrder);
        }

        public async Task<IEnumerable<SubMenuItemDto>> GetSubMenusByMenuItemIdAsync(Guid menuItemId)
        {
            var subMenus = await _repository.GetByMenuItemIdAsync(menuItemId);
            return subMenus.Select(MapToDto).OrderBy(s => s.SortOrder);
        }

        public async Task<SubMenuItemDto?> GetSubMenuByIdAsync(Guid id)
        {
            var subMenu = await _repository.GetByIdAsync(id);
            if (subMenu == null) return null;
            return MapToDto(subMenu);
        }

        public async Task<SubMenuItemDto> CreateSubMenuAsync(CreateSubMenuItemDto dto, Guid organizationId, string userName = "Admin")
        {
            // Validate parent menu exists
            var parentMenu = await _menuRepository.GetByIdAsync(dto.MenuItemId);
            if (parentMenu == null)
                throw new InvalidOperationException("Parent menu item not found.");

            // Validate unique title within same parent
            var existingWithTitle = await _repository.GetByTitleAsync(organizationId, dto.Title, dto.MenuItemId);
            if (existingWithTitle != null)
                throw new InvalidOperationException($"A sub-menu item with the title '{dto.Title}' already exists under this menu.");

            // Validate unique page name
            var existingWithPage = await _repository.GetByPageAsync(organizationId, dto.Page.ToLower());
            if (existingWithPage != null)
                throw new InvalidOperationException("A sub-menu item with this page name already exists.");

            var subMenuItem = new SubMenuItem
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId,
                MenuItemId = dto.MenuItemId,
                Title = dto.Title,
                Page = dto.Page.ToLower(),
                SortOrder = dto.SortOrder,
                IsVisible = dto.IsVisible,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userName
            };

            await _repository.AddAsync(subMenuItem);
            await ReorderSubMenuItemsAsync(dto.MenuItemId, subMenuItem.Id, dto.SortOrder);

            return MapToDto(subMenuItem);
        }

        public async Task<(bool success, string? error)> UpdateSubMenuAsync(Guid id, UpdateSubMenuItemDto dto, string userName = "Admin")
        {
            var subMenu = await _repository.GetByIdAsync(id);
            if (subMenu == null) return (false, "Sub-menu item not found.");
            
            var organizationId = subMenu.OrganizationId ?? Guid.Empty;

            // Validate unique page name
            var existingWithPage = await _repository.GetByPageAsync(organizationId, dto.Page.ToLower());
            if (existingWithPage != null && existingWithPage.Id != id)
                return (false, "Another sub-menu item is already using this page name.");

            // Validate unique title within same parent
            var existingWithTitle = await _repository.GetByTitleAsync(organizationId, dto.Title, subMenu.MenuItemId);
            if (existingWithTitle != null && existingWithTitle.Id != id)
                return (false, $"A sub-menu item with the title '{dto.Title}' already exists under this menu.");

            subMenu.Title = dto.Title;
            subMenu.Page = dto.Page.ToLower();
            subMenu.SortOrder = dto.SortOrder;
            subMenu.IsVisible = dto.IsVisible;
            subMenu.ModifiedAt = DateTime.UtcNow;
            subMenu.ModifiedBy = userName;

            await _repository.UpdateAsync(subMenu);
            await ReorderSubMenuItemsAsync(subMenu.MenuItemId, subMenu.Id, dto.SortOrder);

            return (true, null);
        }

        public async Task<bool> DeleteSubMenuAsync(Guid id, string userName = "Admin")
        {
            var subMenu = await _repository.GetByIdAsync(id);
            if (subMenu == null) return false;

            subMenu.IsDeleted = true;
            subMenu.ModifiedAt = DateTime.UtcNow;
            subMenu.ModifiedBy = userName;
            await _repository.UpdateAsync(subMenu);

            return true;
        }

        private async Task ReorderSubMenuItemsAsync(Guid menuItemId, Guid targetId, int requestedOrder)
        {
            var allSubMenus = (await _repository.GetByMenuItemIdAsync(menuItemId))
                .OrderBy(s => s.SortOrder > 0 ? s.SortOrder : 999)
                .ToList();

            if (allSubMenus.Count == 0) return;

            var target = allSubMenus.FirstOrDefault(s => s.Id == targetId);
            if (target != null)
            {
                allSubMenus.Remove(target);
                int insertIdx = Math.Clamp(requestedOrder - 1, 0, allSubMenus.Count);
                allSubMenus.Insert(insertIdx, target);

                for (int i = 0; i < allSubMenus.Count; i++)
                {
                    var s = allSubMenus[i];
                    int expectedOrder = i + 1;
                    if (s.SortOrder != expectedOrder)
                    {
                        s.SortOrder = expectedOrder;
                        await _repository.UpdateAsync(s);
                    }
                }
            }
        }

        private static SubMenuItemDto MapToDto(SubMenuItem s)
        {
            return new SubMenuItemDto
            {
                Id = s.Id,
                MenuItemId = s.MenuItemId,
                Title = s.Title,
                Page = s.Page,
                SortOrder = s.SortOrder,
                IsVisible = s.IsVisible,
                CreatedAt = s.CreatedAt,
                CreatedBy = s.CreatedBy,
                ModifiedAt = s.ModifiedAt,
                ModifiedBy = s.ModifiedBy
            };
        }
    }
}
