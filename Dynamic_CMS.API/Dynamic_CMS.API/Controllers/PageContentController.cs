using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.PageContent;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Enums;

namespace Dynamic_CMS.API.Controllers
{
    [Authorize]
    [ApiController]
    public class PageContentController : ControllerBase
    {
        private readonly IPageContentService _service;

        public PageContentController(IPageContentService service)
        {
            _service = service;
        }

        private string? GetCurrentUserName()
        {
            var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var name = User.Identity?.Name;
            
            if (!string.IsNullOrEmpty(name)) return name;
            if (!string.IsNullOrEmpty(role)) return role;
            
            return "Admin"; // Fallback if no specific user claim is found
        }

        /*
        // PUBLIC: GET /api/content/{orgSlug}/{menuPage}
        [HttpGet("api/content/{orgSlug}/{menuPage}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic(string orgSlug, string menuPage, CancellationToken cancellationToken)
        {
            var content = await _service.GetPublicContentAsync(orgSlug, menuPage, cancellationToken);
            
            if (content == null)
            {
                var failResponse = ApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<PageContentDto>.SuccessResponse(content, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }
        */

        // ADMIN/CLIENT: GET /api/admin/content/{organizationId} or /api/admin/organizations/{organizationId}/pages
        [HttpGet("api/admin/content/{organizationId:guid}")]
       // [HttpGet("api/admin/organizations/{organizationId:guid}/pages")]
        [Authorize]
        public async Task<IActionResult> GetAllByOrganization(Guid organizationId, CancellationToken cancellationToken)
        {
            var contents = await _service.GetAllByOrganizationAsync(organizationId, cancellationToken);
            if (contents == null || !contents.Any())
            {
                var failResponse = ApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<IEnumerable<PageContentDto>>.SuccessResponse(contents, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN/CLIENT: PUT /api/admin/organizations/{organizationId}/pages/{menuItemId}
        [HttpPut("api/admin/organizations/{organizationId:guid}/pages/{menuItemId:guid}")]
        [Authorize]
        public async Task<IActionResult> SaveByOrgAndMenuItem(Guid organizationId, Guid menuItemId, [FromBody] CreatePageContentDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            var result = await _service.SaveByOrgAndMenuItemAsync(organizationId, menuItemId, dto, GetCurrentUserName(), cancellationToken);
            var response = ApiResponse<PageContentDto>.SuccessResponse(result, "Saved successfully.");
            return StatusCode(200, response);
        }

        // ADMIN/CLIENT: GET /api/admin/content/detail/{id}
        [HttpGet("api/admin/content/detail/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var content = await _service.GetByIdAsync(id, cancellationToken);
            if (content == null)
            {
                var failResponse = ApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<PageContentDto>.SuccessResponse(content, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN/CLIENT: POST /api/admin/content
        [HttpPost("api/admin/content")]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreatePageContentDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            try
            {
                var created = await _service.CreateAsync(dto, GetCurrentUserName(), cancellationToken);
                var response = ApiResponse<PageContentDto>.SuccessResponse(created, "Created successfully.");
                return StatusCode(201, response);
            }
            catch (InvalidOperationException ex)
            {
                var failResponse = ApiResponse.FailureResponse(ex.Message, 400);
                if (ex.Message.Contains("already exists"))
                {
                    failResponse = ApiResponse.FailureResponse(ex.Message, 400);
                    return StatusCode(failResponse.StatusCode, failResponse);
                }
                return StatusCode(failResponse.StatusCode, failResponse);
            }
        }

        // ADMIN/CLIENT: PUT /api/admin/content/{id}
        [HttpPut("api/admin/content/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePageContentDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            var (success, error) = await _service.UpdateAsync(id, dto, GetCurrentUserName(), cancellationToken);
            if (!success)
            {
                var failResponse = ApiResponse.FailureResponse("Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse.SuccessResponse("Updated successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: DELETE /api/admin/content/{id}
        [HttpDelete("api/admin/content/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var success = await _service.DeleteAsync(id, cancellationToken);
            if (!success)
            {
                var failResponse = ApiResponse.FailureResponse("Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse.SuccessResponse("Deleted successfully.");
            return StatusCode(response.StatusCode, response);
        }
    }
}
