using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface ISubMenuItemRepository
    {
        Task<IEnumerable<SubMenuItem>> GetAllAsync();
        Task<IEnumerable<SubMenuItem>> GetByMenuItemIdAsync(Guid menuItemId);
        Task<SubMenuItem?> GetByIdAsync(Guid id);
        Task<SubMenuItem?> GetByPageAsync(string page);
        Task<SubMenuItem?> GetByTitleAsync(string title, Guid menuItemId);
        Task<SubMenuItem> AddAsync(SubMenuItem subMenuItem);
        Task UpdateAsync(SubMenuItem subMenuItem);
        Task DeleteAsync(SubMenuItem subMenuItem);
    }
}
