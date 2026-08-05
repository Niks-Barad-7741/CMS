using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs.SubMenu;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface ISubMenuItemService
    {
        Task<IEnumerable<SubMenuItemDto>> GetAllSubMenusAsync();
        Task<IEnumerable<SubMenuItemDto>> GetSubMenusByMenuItemIdAsync(Guid menuItemId);
        Task<SubMenuItemDto?> GetSubMenuByIdAsync(Guid id);
        Task<SubMenuItemDto> CreateSubMenuAsync(CreateSubMenuItemDto dto, Guid organizationId, string userName = "Admin");
        Task<(bool success, string? error)> UpdateSubMenuAsync(Guid id, UpdateSubMenuItemDto dto, string userName = "Admin");
        Task<bool> DeleteSubMenuAsync(Guid id, string userName = "Admin");
    }
}
