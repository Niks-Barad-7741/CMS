using AutoMapper;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Application.DTOs.PageContent;

namespace Dynamic_CMS.Application.Mappings
{
    public class PageContentProfile : Profile
    {
        public PageContentProfile()
        {
            CreateMap<PageContent, PageContentDto>();
        }
    }
}
