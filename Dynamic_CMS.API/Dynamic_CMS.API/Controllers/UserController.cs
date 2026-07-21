/*

using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            if (users == null || !users.Any())
                return NotFound(GetApiResponse.FailureResponse("No records found.", 404));

            return Ok(GetApiResponse.SuccessResponse("Users retrieved successfully."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _userService.GetByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(GetApiResponse.FailureResponse("No records found.", 404));
            }
            return Ok(GetApiResponse.SuccessResponse("User retrieved successfully."));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var result = await _userService.CreateAsync(dto);
            if (!result.Success)
            {
                return BadRequest(ApiResponse<UserResponseDto>.FailureResponse(result.ErrorMessage, 400));
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, ApiResponse<UserResponseDto>.SuccessResponse(result.Data));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateAsync(id, dto);
            if (!result.Success)
            {
                if (result.ErrorMessage == "User not found.")
                {
                    return NotFound(ApiResponse<UserResponseDto>.FailureResponse(result.ErrorMessage, 404));
                }
                return BadRequest(ApiResponse<UserResponseDto>.FailureResponse(result.ErrorMessage, 400));
            }

            return Ok(ApiResponse<UserResponseDto>.SuccessResponse(result.Data!));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currentUserId = User.FindFirst("UserId")?.Value ?? string.Empty;
            
            var result = await _userService.DeleteAsync(id, currentUserId);
            if (!result.Success)
            {
                if (result.ErrorMessage == "User not found.")
                {
                    return NotFound(ApiResponse<bool>.FailureResponse(result.ErrorMessage, 404));
                }
                return BadRequest(ApiResponse<bool>.FailureResponse(result.ErrorMessage, 400));
            }

            return NoContent();
        }
    }
}
*/