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

        // PUBLIC: GET /api/menus
        [HttpGet("menus")]
        [Authorize(Roles = "Admin")]
        //[AllowAnonymous]
        public async Task<IActionResult> GetAllPublic()
        {
            var menus = await _service.GetAllMenusAsync();
            if (menus == null || !menus.Any())
            {
                var failResponse = GetApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = GetApiResponse.SuccessResponse("Menus retrieved successfully");
            return StatusCode(response.StatusCode, response);
        }

        // ADMIN: POST /api/admin/menus
        [HttpPost("admin/menus")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid payload", 400));

            var exists = await _service.MenuExistsAsync(dto.Slug);
            if (exists)
            {
                var existsResponse = ApiResponse<object>.Create(ResponseStatus.MenuAlreadyExists, "A menu with this slug already exists");
                return StatusCode(existsResponse.StatusCodes, existsResponse);
            }

            try
            {
                var created = await _service.CreateMenuAsync(dto);
                var response = ApiResponse<MenuItemDto>.Create(ResponseStatus.MenuCreatedSuccessfully, created);
                return StatusCode(response.StatusCodes, response);
            }
            catch (InvalidOperationException ex)
            {
                var failResponse = ApiResponse<object>.FailureResponse(ex.Message, 400);
                return StatusCode(failResponse.StatusCodes, failResponse);
            }
        }

        // ADMIN: PUT /api/admin/menus/{id}
        [HttpPut("admin/menus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse<object>.FailureResponse("Invalid payload", 400));

            var (success, error) = await _service.UpdateMenuAsync(id, dto);
            if (!success)
            {
                var failResponse = ApiResponse<object>.FailureResponse(error ?? "Update failed", 400);
                return StatusCode(failResponse.StatusCodes, failResponse);
            }

            var response = ApiResponse<object>.Create(ResponseStatus.MenuUpdatedSuccessfully);
            return StatusCode(response.StatusCodes, response);
        }

        // ADMIN: DELETE /api/admin/menus/{id}
        [HttpDelete("admin/menus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteMenuAsync(id);
            if (!success)
            {
                var failResponse = ApiResponse<object>.Create(ResponseStatus.MenuNotFound, "Menu not found");
                return StatusCode(failResponse.StatusCodes, failResponse);
            }

            var response = ApiResponse<object>.Create(ResponseStatus.MenuDeletedSuccessfully);
            return StatusCode(response.StatusCodes, response);
        }
    }
}
