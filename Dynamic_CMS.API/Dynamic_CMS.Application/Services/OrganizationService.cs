using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.Application.Services
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IOrganizationRepository _repository;
        private readonly ISiteProvisioningService _siteProvisioningService;
        private readonly IMapper _mapper;

        public OrganizationService(
            IOrganizationRepository repository,
            ISiteProvisioningService siteProvisioningService,
            IMapper mapper)
        {
            _repository = repository;
            _siteProvisioningService = siteProvisioningService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<OrganizationDto>> GetAllAsync()
        {
            var organizations = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<OrganizationDto>>(organizations);
        }

        public async Task<IEnumerable<OrganizationDto>> GetAllActiveAsync()
        {
            var organizations = await _repository.GetAllActiveAsync();
            return _mapper.Map<IEnumerable<OrganizationDto>>(organizations);
        }

        public async Task<OrganizationDto?> GetByIdAsync(Guid id)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return null;

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<OrganizationDto?> GetBySlugAsync(string slug)
        {
            var organization = await _repository.GetBySlugAsync(slug);
            if (organization == null) return null;

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto, string? userName = null)
        {
            var existingOrganization = await _repository.GetBySlugAsync(dto.Slug);
            if (existingOrganization != null)
            {
                throw new InvalidOperationException($"An organization with the slug '{dto.Slug}' already exists.");
            }

            var organization = _mapper.Map<Organization>(dto);
            organization.Id = Guid.NewGuid();
            organization.CreatedAt = DateTime.UtcNow;
            organization.CreatedBy = userName;
            organization.IsActive = true;

            await _repository.AddAsync(organization);
            await _repository.SaveChangesAsync();

            await _siteProvisioningService.EnsureDefaultPagesForOrganizationAsync(
                organization.Id, organization.Slug, organization.Name);

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationDto dto, string? userName = null)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null)
            {
                throw new KeyNotFoundException($"Organization with ID {id} not found.");
            }

            if (!organization.IsActive)
            {
                throw new InvalidOperationException("This organization has been deleted. You cannot update it.");
            }

            if (dto.Slug != organization.Slug)
            {
                var existingOrganization = await _repository.GetBySlugAsync(dto.Slug);
                if (existingOrganization != null)
                {
                    throw new InvalidOperationException($"An organization with the slug '{dto.Slug}' already exists.");
                }
            }

            _mapper.Map(dto, organization);
            organization.ModifiedDate = DateTime.UtcNow;
            organization.ModifiedBy = userName;

            _repository.Update(organization);
            await _repository.SaveChangesAsync();

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<bool> DeleteAsync(Guid id, string? userName = null)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return false;

            if (!organization.IsActive)
            {
                throw new InvalidOperationException("Organization is already deleted.");
            }

            organization.IsActive = false;
            organization.ModifiedDate = DateTime.UtcNow;
            organization.ModifiedBy = userName;
            _repository.Update(organization);
            await _repository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ToggleStatusAsync(Guid id, string? userName = null)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return false;

            organization.IsActive = !organization.IsActive;
            organization.ModifiedDate = DateTime.UtcNow;
            organization.ModifiedBy = userName;
            _repository.Update(organization);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}
