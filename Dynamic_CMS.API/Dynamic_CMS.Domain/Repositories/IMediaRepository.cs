using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface IMediaRepository
    {
        Task<IEnumerable<Media>> GetAllByOrganizationIdAsync(Guid organizationId);
        Task<Media?> GetByIdAsync(Guid id);
        Task<Media> AddAsync(Media media);
        Task DeleteAsync(Media media);
        Task SaveChangesAsync();
    }
}
