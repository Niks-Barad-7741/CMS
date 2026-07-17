using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
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
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _userService.GetByIdAsync(id);
            if (!result.Success)
            {
                return NotFound(new { error = result.ErrorMessage });
            }
            return Ok(result.Data);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var result = await _userService.CreateAsync(dto);
            if (!result.Success)
            {
                return BadRequest(new { error = result.ErrorMessage });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
        {
            var result = await _userService.UpdateAsync(id, dto);
            if (!result.Success)
            {
                if (result.ErrorMessage == "User not found.")
                {
                    return NotFound(new { error = result.ErrorMessage });
                }
                return BadRequest(new { error = result.ErrorMessage });
            }

            return Ok(result.Data);
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
                    return NotFound(new { error = result.ErrorMessage });
                }
                return BadRequest(new { error = result.ErrorMessage });
            }

            return NoContent();
        }
    }
}
