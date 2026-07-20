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
        [Authorize(Roles = "Admin")]
        //[AllowAnonymous]
        public async Task<IActionResult> GetAllPublic()
        {
            var menus = await _service.GetAllMenusAsync();
            if (menus == null || !menus.Any())
            {
                var failResponse = ApiResponse.FailureResponse("No records found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
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
            var exists = await _service.MenuExistsAsync(dto.Page);
            if (exists)
                return Conflict(ApiResponse.FailureResponse("A menu item with this page name already exists.", 409));

            var created = await _service.CreateMenuAsync(dto);
            var response = ApiResponse.CreatedResponse("Created successfully.");
            return StatusCode(response.StatusCode, response);
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
