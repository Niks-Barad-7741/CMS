using System;
using System.Threading.Tasks;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Domain.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task AddAsync(User user);
        Task SaveChangesAsync();
    }
}
