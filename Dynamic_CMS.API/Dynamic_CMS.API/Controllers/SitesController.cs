using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.Menu;
using Dynamic_CMS.Application.DTOs.PageContent;
using Dynamic_CMS.Application.Interfaces;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/sites")]
    public class SitesController : ControllerBase
    {
        private readonly ISiteProvisioningService _siteService;

        public SitesController(ISiteProvisioningService siteService)
        {
            _siteService = siteService;
        }

        [HttpGet("{orgSlug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSiteProfile(string orgSlug)
        {
            var profile = await _siteService.GetSiteProfileAsync(orgSlug);
            if (profile == null)
            {
                var failResponse = ApiResponse.FailureResponse("Site not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<SiteProfileDto>.SuccessResponse(profile, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{orgSlug}/menus")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMenus(string orgSlug)
        {
            var menus = await _siteService.GetPublicMenusAsync(orgSlug);
            if (!menus.Any())
            {
                var failResponse = ApiResponse.FailureResponse("Site not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<IEnumerable<MenuItemDto>>.SuccessResponse(menus, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet("{orgSlug}/pages/{pageSlug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPage(string orgSlug, string pageSlug, CancellationToken cancellationToken)
        {
            var page = await _siteService.GetPublicPageAsync(orgSlug, pageSlug, cancellationToken);
            if (page == null)
            {
                var failResponse = ApiResponse.FailureResponse("Page not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<PageContentDto>.SuccessResponse(page, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }
    }
}
