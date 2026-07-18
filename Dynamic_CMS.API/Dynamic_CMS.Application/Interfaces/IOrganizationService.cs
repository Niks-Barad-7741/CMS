using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IOrganizationService
    {
        Task<IEnumerable<OrganizationDto>> GetAllActiveAsync();
        Task<OrganizationDto?> GetByIdAsync(Guid id);
        Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto);
        Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
