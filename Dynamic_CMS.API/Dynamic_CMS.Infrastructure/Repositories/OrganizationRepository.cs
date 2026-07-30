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
    public class OrganizationRepository : IOrganizationRepository
    {
        private readonly CmsDbContext _context;

        public OrganizationRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Organization>> GetAllAsync()
        {
            return await _context.Organizations.ToListAsync();
        }

        public async Task<IEnumerable<Organization>> GetAllActiveAsync()
        {
            return await _context.Organizations
                .Where(o => o.IsActive)
                .ToListAsync();
        }

        public async Task<Organization?> GetByIdAsync(Guid id)
        {
            return await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Organization?> GetBySlugAsync(string slug)
        {
            return await _context.Organizations
                .FirstOrDefaultAsync(o => o.Slug == slug);
        }

        public async Task AddAsync(Organization organization)
        {
            await _context.Organizations.AddAsync(organization);
        }

        public void Update(Organization organization)
        {
            _context.Organizations.Update(organization);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
