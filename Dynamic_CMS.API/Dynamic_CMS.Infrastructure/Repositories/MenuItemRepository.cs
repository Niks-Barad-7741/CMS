using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;
using Dynamic_CMS.Infrastructure.Data;

namespace Dynamic_CMS.Infrastructure.Repositories
{
    public class MenuItemRepository : IMenuItemRepository
    {
        private readonly CmsDbContext _context;

        public MenuItemRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuItem>> GetAllAsync()
        {
            return await _context.MenuItems.ToListAsync();
        }

        public async Task<MenuItem?> GetByIdAsync(Guid id)
        {
            return await _context.MenuItems.FindAsync(id);
        }

        public async Task<MenuItem?> GetByPageAsync(string page)
        {
            return await _context.MenuItems
                .FirstOrDefaultAsync(m => m.Page == page);
        }

        public async Task<MenuItem?> GetBySortOrderAsync(int sortOrder)
        {
            return await _context.MenuItems.FirstOrDefaultAsync(m => m.SortOrder == sortOrder);
        }

        public async Task<MenuItem?> GetByTitleAsync(string title)
        {
            return await _context.MenuItems.FirstOrDefaultAsync(m => m.Title.ToLower() == title.ToLower());
        }

        public async Task<MenuItem> AddAsync(MenuItem menuItem)
        {
            await _context.MenuItems.AddAsync(menuItem);
            await _context.SaveChangesAsync();
            return menuItem;
        }

        public async Task UpdateAsync(MenuItem menuItem)
        {
            _context.MenuItems.Update(menuItem);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(MenuItem menuItem)
        {
            _context.MenuItems.Remove(menuItem);
            await _context.SaveChangesAsync();
        }
    }
}
