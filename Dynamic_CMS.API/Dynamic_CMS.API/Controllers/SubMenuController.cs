using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.DTOs.SubMenu;
using Dynamic_CMS.Application.Interfaces;

namespace Dynamic_CMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api")]
    public class SubMenuController : ControllerBase
    {
        private readonly ISubMenuItemService _service;

        public SubMenuController(ISubMenuItemService service)
        {
            _service = service;
        }

        // GET /api/admin/menus/{menuItemId}/submenus
        [HttpGet("admin/menus/{menuItemId:guid}/submenus")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByMenuItem(Guid menuItemId)
        {
            var subMenus = await _service.GetSubMenusByMenuItemIdAsync(menuItemId);
            var response = ApiResponse<IEnumerable<SubMenuItemDto>>.SuccessResponse(subMenus, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        // GET /api/admin/submenus/{id}
        [HttpGet("admin/submenus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var subMenu = await _service.GetSubMenuByIdAsync(id);
            if (subMenu == null)
            {
                var failResponse = ApiResponse.FailureResponse("Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse<SubMenuItemDto>.SuccessResponse(subMenu, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }

        // POST /api/admin/submenus
        [HttpPost("admin/submenus")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateSubMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            try
            {
                var created = await _service.CreateSubMenuAsync(dto);
                var response = ApiResponse<SubMenuItemDto>.SuccessResponse(created, "Sub-menu created successfully.");
                return StatusCode(201, response);
            }
            catch (InvalidOperationException ex)
            {
                var failResponse = ApiResponse.FailureResponse(ex.Message, 400);
                return StatusCode(failResponse.StatusCode, failResponse);
            }
        }

        // PUT /api/admin/submenus/{id}
        [HttpPut("admin/submenus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSubMenuItemDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResponse.FailureResponse("Validation failed.", 400));

            var (success, error) = await _service.UpdateSubMenuAsync(id, dto);
            if (!success)
            {
                var failResponse = ApiResponse.FailureResponse(error ?? "Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse.SuccessResponse("Updated successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // DELETE /api/admin/submenus/{id}
        [HttpDelete("admin/submenus/{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _service.DeleteSubMenuAsync(id);
            if (!success)
            {
                var failResponse = ApiResponse.FailureResponse("Resource not found.", 404);
                return StatusCode(failResponse.StatusCode, failResponse);
            }

            var response = ApiResponse.SuccessResponse("Deleted successfully.");
            return StatusCode(response.StatusCode, response);
        }

        // PUBLIC: GET /api/menus/{menuItemId}/submenus (for public site)
        [HttpGet("menus/{menuItemId:guid}/submenus")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicByMenuItem(Guid menuItemId)
        {
            var subMenus = await _service.GetSubMenusByMenuItemIdAsync(menuItemId);
            var response = ApiResponse<IEnumerable<SubMenuItemDto>>.SuccessResponse(subMenus, "Operation successful");
            return StatusCode(response.StatusCode, response);
        }
    }
}
