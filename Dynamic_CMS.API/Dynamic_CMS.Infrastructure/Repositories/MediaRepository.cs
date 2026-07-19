using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;
using Dynamic_CMS.Infrastructure.Data;

namespace Dynamic_CMS.Infrastructure.Repositories
{
    public class MediaRepository : IMediaRepository
    {
        private readonly CmsDbContext _context;

        public MediaRepository(CmsDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Media>> GetAllByOrganizationIdAsync(Guid organizationId)
        {
            return await _context.Media
                .Where(m => m.OrganizationId == organizationId)
                .OrderByDescending(m => m.UploadedAt)
                .ToListAsync();
        }

        public async Task<Media?> GetByIdAsync(Guid id)
        {
            return await _context.Media.FindAsync(id);
        }

        public async Task<Media> AddAsync(Media media)
        {
            await _context.Media.AddAsync(media);
            await _context.SaveChangesAsync();
            return media;
        }

        public async Task DeleteAsync(Media media)
        {
            _context.Media.Remove(media);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
