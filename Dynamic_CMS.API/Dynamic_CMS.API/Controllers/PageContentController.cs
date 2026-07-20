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

        // PUBLIC: GET /api/content/{orgSlug}/{menuSlug}
        [HttpGet("api/content/{orgSlug}/{menuSlug}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublic(string orgSlug, string menuSlug, CancellationToken cancellationToken)
        {
            var content = await _service.GetPublicContentAsync(orgSlug, menuSlug, cancellationToken);
            
            if (content == null)
            {
                var failResponse = GetApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = GetApiResponse.SuccessResponse("Page content retrieved successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: GET /api/admin/content/{organizationId}
        [HttpGet("api/admin/content/{organizationId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllByOrganization(Guid organizationId, CancellationToken cancellationToken)
        {
            var contents = await _service.GetAllByOrganizationAsync(organizationId, cancellationToken);
            if (contents == null || !contents.Any())
            {
                var failResponse = GetApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = GetApiResponse.SuccessResponse("Page content retrieved successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: GET /api/admin/content/detail/{id}
        [HttpGet("api/admin/content/detail/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        {
            var content = await _service.GetByIdAsync(id, cancellationToken);
            if (content == null)
            {
                var failResponse = GetApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = GetApiResponse.SuccessResponse("Page content retrieved successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: POST /api/admin/content
        [HttpPost("api/admin/content")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreatePageContentDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid payload", 400));

            try
            {
                var created = await _service.CreateAsync(dto, cancellationToken);
                var response = ApiResponse<PageContentDto>.Create(ResponseStatus.PageContentCreatedSuccessfully, created);
                return StatusCode(response.StatusCodes, response);
            }
            catch (InvalidOperationException ex)
            {
                var failResponse = ApiResponse<object>.FailureResponse(ex.Message, 400); // Wait, duplicate is 409
                if (ex.Message.Contains("already exists"))
                {
                    failResponse = ApiResponse<object>.Create(ResponseStatus.PageContentAlreadyExists, ex.Message);
                    return StatusCode(failResponse.StatusCodes, failResponse);
                }
                return StatusCode(failResponse.StatusCodes, failResponse);
            }
        }

        // ADMIN: PUT /api/admin/content/{id}
        [HttpPut("api/admin/content/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePageContentDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid payload", 400));

            var (success, error) = await _service.UpdateAsync(id, dto, cancellationToken);
            if (!success)
            {
                var failResponse = ApiResponse<object>.FailureResponse(error ?? "Update failed", 404);
                return StatusCode(failResponse.StatusCodes, failResponse);
            }

            var response = ApiResponse<object>.Create(ResponseStatus.PageContentUpdatedSuccessfully);
            return StatusCode(response.StatusCodes, response);
        }

        // ADMIN: DELETE /api/admin/content/{id}
        [HttpDelete("api/admin/content/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            var success = await _service.DeleteAsync(id, cancellationToken);
            if (!success)
            {
                var failResponse = ApiResponse<object>.Create(ResponseStatus.PageContentNotFound, "Page content not found.");
                return StatusCode(failResponse.StatusCodes, failResponse);
            }

            var response = ApiResponse<object>.Create(ResponseStatus.PageContentDeletedSuccessfully);
            return StatusCode(response.StatusCodes, response);
        }
    }
}
