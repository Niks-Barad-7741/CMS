using AutoMapper;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Application.DTOs;

namespace Dynamic_CMS.Application.Mappings
{
    public class OrganizationProfile : Profile
    {
        public OrganizationProfile()
        {
            CreateMap<Organization, OrganizationDto>();
            CreateMap<CreateOrganizationDto, Organization>();
            CreateMap<UpdateOrganizationDto, Organization>();
        }
    }
}
