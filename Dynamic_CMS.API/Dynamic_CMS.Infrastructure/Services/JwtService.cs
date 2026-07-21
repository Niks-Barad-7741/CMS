using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Dynamic_CMS.Application.Interfaces;
using Dynamic_CMS.Domain.Entities;

namespace Dynamic_CMS.Infrastructure.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var jwtSection = _configuration.GetSection("Jwt");
            var privateKeyPath = jwtSection["PrivateKeyPath"] ?? throw new InvalidOperationException("JWT PrivateKeyPath is not configured.");

            // Resolve path robustly
            var resolvedPath = File.Exists(privateKeyPath)
                ? privateKeyPath
                : Path.Combine(AppContext.BaseDirectory, privateKeyPath);

            if (!File.Exists(resolvedPath))
            {
                throw new FileNotFoundException($"JWT Private Key file not found at: {resolvedPath}");
            }

            var privateKeyText = File.ReadAllText(resolvedPath);
            var rsa = RSA.Create();
            rsa.ImportFromPem(privateKeyText);
            
            var key = new RsaSecurityKey(rsa)
            {
                CryptoProviderFactory = new CryptoProviderFactory { CacheSignatureProviders = false }
            };

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim("UserId", user.Id.ToString()),
                new Claim("Email", user.Email),
                new Claim(ClaimTypes.Role, user.Role), // Required for [Authorize(Roles = "...")]
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            if (user.OrganizationId.HasValue)
            {
                claims.Add(new Claim("OrganizationId", user.OrganizationId.Value.ToString()));
            }

            var creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

            var expiryMinutesStr = jwtSection["ExpiryMinutes"];
            var expiryMinutes = double.TryParse(expiryMinutesStr, out var minutes) ? minutes : 15;

            var token = new JwtSecurityToken(
                issuer: jwtSection["Issuer"],
                audience: jwtSection["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }
}
