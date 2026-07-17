using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
