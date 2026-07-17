using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using FluentValidation;
using Dynamic_CMS.Application.DTOs;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;
using Dynamic_CMS.Domain.Repositories;

namespace Dynamic_CMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IValidator<LoginDto> _loginValidator;

        public AuthController(
            IUserRepository userRepository,
            IJwtService jwtService,
            IValidator<LoginDto> loginValidator)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _loginValidator = loginValidator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var validationResult = await _loginValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.ToDictionary());
            }

            var user = await _userRepository.GetByEmailAsync(dto.Email);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { error = "Invalid email or password." });
            }

            var isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                return Unauthorized(new { error = "Invalid email or password." });
            }

            var token = _jwtService.GenerateToken(user);

            var response = new AuthResponseDto
            {
                Token = token
            };

            return Ok(response);
        }
    }
}
