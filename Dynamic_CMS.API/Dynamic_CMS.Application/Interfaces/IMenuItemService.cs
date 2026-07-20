using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs.Menu;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IMenuItemService
    {
        Task<IEnumerable<MenuItemDto>> GetAllMenusAsync();
        Task<MenuItemDto?> GetMenuByIdAsync(Guid id);
        Task<bool> MenuExistsAsync(string slug);
        Task<MenuItemDto> CreateMenuAsync(CreateMenuItemDto dto, string userName = "Admin");
        Task<(bool success, string? error)> UpdateMenuAsync(Guid id, UpdateMenuItemDto dto, string userName = "Admin");
        Task<bool> DeleteMenuAsync(Guid id, string userName = "Admin");
    }
}
