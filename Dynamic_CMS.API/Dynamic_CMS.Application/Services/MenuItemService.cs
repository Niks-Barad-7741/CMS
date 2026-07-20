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
                Slug = m.Slug,
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
                Slug = menu.Slug,
                SortOrder = menu.SortOrder,
                IsVisible = menu.IsVisible,
                CreatedAt = menu.CreatedAt,
                CreatedBy = menu.CreatedBy,
                ModifiedAt = menu.ModifiedAt,
                ModifiedBy = menu.ModifiedBy
            };
        }

        public async Task<bool> MenuExistsAsync(string slug)
        {
            var menu = await _repository.GetBySlugAsync(slug);
            return menu != null;
        }

        public async Task<MenuItemDto> CreateMenuAsync(CreateMenuItemDto dto, string userName = "Admin")
        {
            var existingWithTitle = await _repository.GetByTitleAsync(dto.Title);
            if (existingWithTitle != null)
            {
                throw new InvalidOperationException($"A menu item with the title '{dto.Title}' already exists.");
            }

            var existingWithSortOrder = await _repository.GetBySortOrderAsync(dto.SortOrder);
            if (existingWithSortOrder != null)
            {
                // This could throw an exception and get caught by the controller, or we just return an error.
                // However, the interface Task<MenuItemDto> doesn't return an error string. Let's throw an InvalidOperationException.
                throw new InvalidOperationException($"A menu item with SortOrder {dto.SortOrder} already exists.");
            }

            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Slug = dto.Slug.ToLower(), // ensure slug is lower
                SortOrder = dto.SortOrder,
                IsVisible = dto.IsVisible,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userName
            };

            await _repository.AddAsync(menuItem);

            return new MenuItemDto
            {
                Id = menuItem.Id,
                Title = menuItem.Title,
                Slug = menuItem.Slug,
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

            // Check if slug is taken by another menu item
            var existingWithSlug = await _repository.GetBySlugAsync(dto.Slug.ToLower());
            if (existingWithSlug != null && existingWithSlug.Id != id)
            {
                return (false, "Another menu item is already using this slug.");
            }

            var existingWithTitle = await _repository.GetByTitleAsync(dto.Title);
            if (existingWithTitle != null && existingWithTitle.Id != id)
            {
                return (false, $"A menu item with the title '{dto.Title}' already exists.");
            }

            var existingWithSortOrder = await _repository.GetBySortOrderAsync(dto.SortOrder);
            if (existingWithSortOrder != null && existingWithSortOrder.Id != id)
            {
                return (false, $"A menu item with SortOrder {dto.SortOrder} already exists.");
            }

            menu.Title = dto.Title;
            menu.Slug = dto.Slug.ToLower();
            menu.SortOrder = dto.SortOrder;
            menu.IsVisible = dto.IsVisible;
            menu.ModifiedAt = DateTime.UtcNow;
            menu.ModifiedBy = userName;

            await _repository.UpdateAsync(menu);

            return (true, null);
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
