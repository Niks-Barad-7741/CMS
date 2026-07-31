using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;
using Dynamic_CMS.Infrastructure.Data;

namespace Dynamic_CMS.Infrastructure.Repositories
{
    public class SubMenuItemRepository : ISubMenuItemRepository
    {
        private readonly CmsDbContext _context;

        public SubMenuItemRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubMenuItem>> GetAllAsync()
        {
            return await _context.SubMenuItems.ToListAsync();
        }

        public async Task<IEnumerable<SubMenuItem>> GetByMenuItemIdAsync(Guid menuItemId)
        {
            return await _context.SubMenuItems
                .Where(s => s.MenuItemId == menuItemId && !s.IsDeleted)
                .OrderBy(s => s.SortOrder)
                .ToListAsync();
        }

        public async Task<SubMenuItem?> GetByIdAsync(Guid id)
        {
            return await _context.SubMenuItems.FindAsync(id);
        }

        public async Task<SubMenuItem?> GetByPageAsync(Guid organizationId, string page)
        {
            return await _context.SubMenuItems
                .FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Page == page && !s.IsDeleted);
        }

        public async Task<SubMenuItem?> GetByTitleAsync(Guid organizationId, string title, Guid menuItemId)
        {
            return await _context.SubMenuItems
                .FirstOrDefaultAsync(s => s.OrganizationId == organizationId && s.Title.ToLower() == title.ToLower() && s.MenuItemId == menuItemId && !s.IsDeleted);
        }

        public async Task<SubMenuItem> AddAsync(SubMenuItem subMenuItem)
        {
            await _context.SubMenuItems.AddAsync(subMenuItem);
            await _context.SaveChangesAsync();
            return subMenuItem;
        }

        public async Task UpdateAsync(SubMenuItem subMenuItem)
        {
            _context.SubMenuItems.Update(subMenuItem);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(SubMenuItem subMenuItem)
        {
            _context.SubMenuItems.Remove(subMenuItem);
            await _context.SaveChangesAsync();
        }
    }
}
