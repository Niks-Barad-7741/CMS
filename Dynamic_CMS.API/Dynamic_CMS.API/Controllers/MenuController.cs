using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.Menu;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Enums;

namespace Dynamic_CMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuItemService _service;
        private readonly IOrganizationService _organizationService;

        public MenuController(IMenuItemService service, IOrganizationService organizationService)
        {
            _service = service;
            _organizationService = organizationService;
        }

        // ADMIN/CLIENT: GET /api/admin/organizations/{organizationId}/menus
        [HttpGet("admin/organizations/{organizationId:guid}/menus")]
        [Authorize]
        public async Task<IActionResult> GetByOrganization(Guid organizationId)
        {
            var menus = await _service.GetAllMenusAsync(organizationId);
            if (menus == null || !menus.Any())
            {
                // Return empty list instead of 404 to be consistent
                var emptyResponse = ApiResponse<IEnumerable<MenuItemDto>>.SuccessResponse(new List<MenuItemDto>(), "No records found.");
                return StatusCode(emptyResponse.StatusCode, emptyResponse);
            }

            var response = ApiResponse<IEnumerable<MenuItemDto>>.SuccessResponse(menus, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: POST /api/admin/menus
        [HttpPost("admin/menus")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            // Validate unique page name
            var exists = await _service.MenuExistsAsync(dto.OrganizationId, dto.Page);
            if (exists)
                return Conflict(ApiResponse.FailureResponse("A menu item with this page name already exists.", 409));

            try
            {
                var created = await _service.CreateMenuAsync(dto, dto.OrganizationId);
                var response = ApiResponse<MenuItemDto>.Create(ResponseStatus.MenuCreatedSuccessfully, created);
                return StatusCode(response.StatusCode, response);
            }
            catch (InvalidOperationException ex)
            {
                var failResponse = ApiResponse<object>.FailureResponse(ex.Message, 400);
                return StatusCode(failResponse.StatusCode, failResponse);
            }
        }   

        // ADMIN: PUT /api/admin/menus/{id}
        [HttpPut("admin/menus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            var (success, error) = await _service.UpdateMenuAsync(id, dto);
            if (!success)
            {
                var failResponse = ApiResponse.FailureResponse("Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse.SuccessResponse("Updated successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: DELETE /api/admin/menus/{id}
        [HttpDelete("admin/menus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteMenuAsync(id);
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
