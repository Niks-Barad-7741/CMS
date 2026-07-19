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
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 days expiry

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            var response = new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken
            };

            return Ok(response);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.Token) || string.IsNullOrEmpty(dto.RefreshToken))
            {
                return BadRequest(new { error = "Invalid client request" });
            }

            // We could decode the JWT to find the user id, but for simplicity we will just 
            // find the user by their RefreshToken since it is a cryptographically secure 64-byte string.
            // However, our IUserRepository doesn't have GetByRefreshToken. 
            // So we need to decode the token.
            
            var principal = GetPrincipalFromExpiredToken(dto.Token);
            if (principal == null)
            {
                return BadRequest(new { error = "Invalid access token or refresh token" });
            }

            var userIdString = principal.FindFirst("UserId")?.Value;
            if (!Guid.TryParse(userIdString, out Guid userId))
            {
                return BadRequest(new { error = "Invalid token claims" });
            }

            var user = await _userRepository.GetByIdAsync(userId);

            if (user == null || user.RefreshToken != dto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return BadRequest(new { error = "Invalid access token or refresh token" });
            }

            var newAccessToken = _jwtService.GenerateToken(user);
            var newRefreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return Ok(new AuthResponseDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        private System.Security.Claims.ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
            {
                ValidateAudience = false, // You might want to validate this in production
                ValidateIssuer = false,
                ValidateIssuerSigningKey = false,
                ValidateLifetime = false, // Here we are saying that we don't care about the token's expiration date
                SignatureValidator = delegate (string t, Microsoft.IdentityModel.Tokens.TokenValidationParameters parameters)
                {
                    var jwt = new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(t);
                    return jwt;
                }
            };

            var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
                var jwtSecurityToken = securityToken as System.IdentityModel.Tokens.Jwt.JwtSecurityToken;
                if (jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(Microsoft.IdentityModel.Tokens.SecurityAlgorithms.RsaSha256, StringComparison.InvariantCultureIgnoreCase))
                    return null;

                return principal;
            }
            catch
            {
                return null;
            }
        }
    }
}
