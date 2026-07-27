using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs.Menu;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;



namespace Dynamic_CMS.Application.Services
{
    public class MenuItemService : IMenuItemService
    {
        private readonly IMenuItemRepository _repository;

        public MenuItemService(IMenuItemRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MenuItemDto>> GetAllMenusAsync()
        {
            var menus = await _repository.GetAllAsync();
            
            // Map Entity to Dto manually (or use AutoMapper)
            return menus.Select(m => new MenuItemDto
            {
                Id = m.Id,
                Title = m.Title,
                Page = m.Page,
                SortOrder = m.SortOrder,
                IsVisible = m.IsVisible,
                CreatedAt = m.CreatedAt,
                CreatedBy = m.CreatedBy,
                ModifiedAt = m.ModifiedAt,
                ModifiedBy = m.ModifiedBy
            }).OrderBy(m => m.SortOrder);
        }

        public async Task<MenuItemDto?> GetMenuByIdAsync(Guid id)
        {
            var menu = await _repository.GetByIdAsync(id);
            if (menu == null) return null;

            return new MenuItemDto
            {
                Id = menu.Id,
                Title = menu.Title,
                Page = menu.Page,
                SortOrder = menu.SortOrder,
                IsVisible = menu.IsVisible,
                CreatedAt = menu.CreatedAt,
                CreatedBy = menu.CreatedBy,
                ModifiedAt = menu.ModifiedAt,
                ModifiedBy = menu.ModifiedBy
            };
        }

        public async Task<bool> MenuExistsAsync(string page)
        {
            var menu = await _repository.GetByPageAsync(page);
            return menu != null;
        }

        public async Task<MenuItemDto> CreateMenuAsync(CreateMenuItemDto dto, string userName = "Admin")
        {
            var existingWithTitle = await _repository.GetByTitleAsync(dto.Title);
            if (existingWithTitle != null)
            {
                throw new InvalidOperationException($"A menu item with the title '{dto.Title}' already exists.");
            }

            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Page = dto.Page.ToLower(),
                SortOrder = dto.SortOrder,
                IsVisible = dto.IsVisible,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userName
            };

            await _repository.AddAsync(menuItem);
            await ReorderMenuItemsAsync(menuItem.Id, dto.SortOrder);

            return new MenuItemDto
            {
                Id = menuItem.Id,
                Title = menuItem.Title,
                Page = menuItem.Page,
                SortOrder = menuItem.SortOrder,
                IsVisible = menuItem.IsVisible,
                CreatedAt = menuItem.CreatedAt,
                CreatedBy = menuItem.CreatedBy
            };
        }

        public async Task<(bool success, string? error)> UpdateMenuAsync(Guid id, UpdateMenuItemDto dto, string userName = "Admin")
        {
            var menu = await _repository.GetByIdAsync(id);
            if (menu == null) return (false, "Menu item not found.");

            var existingWithPage = await _repository.GetByPageAsync(dto.Page.ToLower());
            if (existingWithPage != null && existingWithPage.Id != id)
            {
                return (false, "Another menu item is already using this page name.");
            }

            var existingWithTitle = await _repository.GetByTitleAsync(dto.Title);
            if (existingWithTitle != null && existingWithTitle.Id != id)
            {
                return (false, $"A menu item with the title '{dto.Title}' already exists.");
            }

            menu.Title = dto.Title;
            menu.Page = dto.Page.ToLower();
            menu.SortOrder = dto.SortOrder;
            menu.IsVisible = dto.IsVisible;
            menu.ModifiedAt = DateTime.UtcNow;
            menu.ModifiedBy = userName;

            await _repository.UpdateAsync(menu);
            await ReorderMenuItemsAsync(menu.Id, dto.SortOrder);

            return (true, null);
        }

        private async Task ReorderMenuItemsAsync(Guid targetId, int requestedOrder)
        {
            var allMenus = (await _repository.GetAllAsync())
                .Where(m => !m.IsDeleted)
                .OrderBy(m => m.SortOrder > 0 ? m.SortOrder : 999)
                .ToList();

            if (allMenus.Count == 0) return;

            var target = allMenus.FirstOrDefault(m => m.Id == targetId);
            if (target != null)
            {
                allMenus.Remove(target);
                int insertIdx = Math.Clamp(requestedOrder - 1, 0, allMenus.Count);
                allMenus.Insert(insertIdx, target);

                for (int i = 0; i < allMenus.Count; i++)
                {
                    var m = allMenus[i];
                    int expectedOrder = i + 1;
                    if (m.SortOrder != expectedOrder)
                    {
                        m.SortOrder = expectedOrder;
                        await _repository.UpdateAsync(m);
                    }
                }
            }
        }

        public async Task<bool> DeleteMenuAsync(Guid id, string userName = "Admin")
        {
            var menu = await _repository.GetByIdAsync(id);
            if (menu == null) return false;

            menu.IsDeleted = true;
            menu.ModifiedAt = DateTime.UtcNow;
            menu.ModifiedBy = userName;
            await _repository.UpdateAsync(menu);
            
            return true;
        }
    }
}
