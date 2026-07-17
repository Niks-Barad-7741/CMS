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
                IsVisible = m.IsVisible
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
                IsVisible = menu.IsVisible
            };
        }

        public async Task<bool> MenuExistsAsync(string slug)
        {
            var menu = await _repository.GetBySlugAsync(slug);
            return menu != null;
        }

        public async Task<MenuItemDto> CreateMenuAsync(CreateMenuItemDto dto)
        {
            var menuItem = new MenuItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                Slug = dto.Slug.ToLower(), // ensure slug is lower
                SortOrder = dto.SortOrder,
                IsVisible = dto.IsVisible
            };

            await _repository.AddAsync(menuItem);

            return new MenuItemDto
            {
                Id = menuItem.Id,
                Title = menuItem.Title,
                Slug = menuItem.Slug,
                SortOrder = menuItem.SortOrder,
                IsVisible = menuItem.IsVisible
            };
        }

        public async Task<(bool success, string? error)> UpdateMenuAsync(Guid id, UpdateMenuItemDto dto)
        {
            var menu = await _repository.GetByIdAsync(id);
            if (menu == null) return (false, "Menu item not found.");

            // Check if slug is taken by another menu item
            var existingWithSlug = await _repository.GetBySlugAsync(dto.Slug.ToLower());
            if (existingWithSlug != null && existingWithSlug.Id != id)
            {
                return (false, "Another menu item is already using this slug.");
            }

            menu.Title = dto.Title;
            menu.Slug = dto.Slug.ToLower();
            menu.SortOrder = dto.SortOrder;
            menu.IsVisible = dto.IsVisible;

            await _repository.UpdateAsync(menu);

            return (true, null);
        }

        public async Task<bool> DeleteMenuAsync(Guid id)
        {
            var menu = await _repository.GetByIdAsync(id);
            if (menu == null) return false;

            await _repository.DeleteAsync(menu);
            return true;
        }
    }
}
