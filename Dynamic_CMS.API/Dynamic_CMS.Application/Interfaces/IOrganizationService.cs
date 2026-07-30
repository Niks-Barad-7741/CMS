using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Interfaces
{
    public interface IOrganizationService
    {
        Task<IEnumerable<OrganizationDto>> GetAllAsync();
        Task<IEnumerable<OrganizationDto>> GetAllActiveAsync();
        Task<OrganizationDto?> GetByIdAsync(Guid id);
        Task<OrganizationDto?> GetBySlugAsync(string slug);
        Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, string? userName = null);
        Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationDto dto, string? userName = null);
        Task<OrganizationDto> UpdateLogoAsync(Guid id, UpdateLogoDto dto, string? userName = null);
        Task<bool> DeleteAsync(Guid id, string? userName = null);
    }
}
