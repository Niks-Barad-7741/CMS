using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;
using Dynamic_CMS.Infrastructure.Data;

namespace Dynamic_CMS.Infrastructure.Repositories
{
    public class PageContentRepository : IPageContentRepository
    {
        private readonly CmsDbContext _context;

        public PageContentRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PageContent>> GetAllByOrganizationIdAsync(Guid organizationId, CancellationToken cancellationToken)
        {
            return await _context.PageContents
                .AsNoTracking()
                .Where(p => p.OrganizationId == organizationId && p.Status == "Published")
                .ToListAsync(cancellationToken);
        }

        public async Task<PageContent?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.PageContents
                .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
        }

        public async Task<PageContent?> GetByOrgAndMenuItemAsync(Guid organizationId, Guid menuItemId, CancellationToken cancellationToken)
        {
            return await _context.PageContents
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.OrganizationId == organizationId && p.MenuItemId == menuItemId, cancellationToken);
        }

        public async Task<PageContent?> GetByOrgSlugAndMenuPageAsync(string orgSlug, string menuPage, CancellationToken cancellationToken)
        {
            return await _context.PageContents
                .AsNoTracking()
                .Include(p => p.Organization)
                .Include(p => p.MenuItem)
                .FirstOrDefaultAsync(p => p.Organization.Slug == orgSlug && p.MenuItem.Page == menuPage, cancellationToken);
        }

        public async Task<PageContent> AddAsync(PageContent pageContent, CancellationToken cancellationToken)
        {
            await _context.PageContents.AddAsync(pageContent, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
            return pageContent;
        }

        public async Task UpdateAsync(PageContent pageContent, CancellationToken cancellationToken)
        {
            _context.PageContents.Update(pageContent);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(PageContent pageContent, CancellationToken cancellationToken)
        {
            pageContent.IsDeleted = true;
            _context.PageContents.Update(pageContent);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
