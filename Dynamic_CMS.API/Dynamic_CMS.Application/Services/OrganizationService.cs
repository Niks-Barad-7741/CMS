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
        private readonly IMapper _mapper;

        public OrganizationService(IOrganizationRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
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

        public async Task<OrganizationDto> CreateAsync(CreateOrganizationDto dto)
        {
            var organization = _mapper.Map<Organization>(dto);
            organization.Id = Guid.NewGuid();
            organization.CreatedAt = DateTime.UtcNow;
            organization.IsActive = true;

            await _repository.AddAsync(organization);
            await _repository.SaveChangesAsync();

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<OrganizationDto> UpdateAsync(Guid id, UpdateOrganizationDto dto)
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

            _mapper.Map(dto, organization);

            _repository.Update(organization);
            await _repository.SaveChangesAsync();

            return _mapper.Map<OrganizationDto>(organization);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var organization = await _repository.GetByIdAsync(id);
            if (organization == null) return false;

            if (!organization.IsActive)
            {
                throw new InvalidOperationException("Organization is already deleted.");
            }

            organization.IsActive = false;
            _repository.Update(organization);
            await _repository.SaveChangesAsync();

            return true;
        }
    }
}
