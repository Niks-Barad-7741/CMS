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

        public MenuController(IMenuItemService service)
        {
            _service = service;
        }

        // PUBLIC: GET /api/menus
        [HttpGet("menus")]
        public async Task<IActionResult> GetAllPublic()
        {
            var menus = await _service.GetAllMenusAsync();
            var response = ApiResponse<IEnumerable<MenuItemDto>>.SuccessResponse(menus, "Menus retrieved successfully");
            return StatusCode(response.StatusCodes, response);
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

            var created = await _service.CreateMenuAsync(dto);
            var response = ApiResponse<MenuItemDto>.Create(ResponseStatus.MenuCreatedSuccessfully, created);
            return StatusCode(response.StatusCodes, response);
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
