using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface IMenuItemRepository
    {
        Task<IEnumerable<MenuItem>> GetAllAsync(Guid organizationId);
        Task<MenuItem?> GetByIdAsync(Guid id);
        Task<MenuItem?> GetByPageAsync(Guid organizationId, string page);
        Task<MenuItem?> GetByTitleAsync(Guid organizationId, string title);
        Task<MenuItem?> GetBySortOrderAsync(Guid organizationId, int sortOrder);
        Task<MenuItem> AddAsync(MenuItem menuItem);
        Task UpdateAsync(MenuItem menuItem);
        Task DeleteAsync(MenuItem menuItem);
    }
}
