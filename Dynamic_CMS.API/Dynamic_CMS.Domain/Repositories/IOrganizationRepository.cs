using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface IOrganizationRepository
    {
        Task<IEnumerable<Organization>> GetAllAsync();
        Task<IEnumerable<Organization>> GetAllActiveAsync();
        Task<Organization?> GetByIdAsync(Guid id);
        Task<Organization?> GetBySlugAsync(string slug);
        Task AddAsync(Organization organization);
        void Update(Organization organization);
        Task SaveChangesAsync();
    }
}
