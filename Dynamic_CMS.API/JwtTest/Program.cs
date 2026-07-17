using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.IdentityModel.Tokens;

public class Program
{
    public static void Main()
    {
        var privateKeyPath = @"C:\Users\meet1\OneDrive\Desktop\Pro\CMS\Dynamic_CMS.API\Dynamic_CMS.API\Keys\private.key";
        var privateKeyText = File.ReadAllText(privateKeyPath);
        using var rsa = RSA.Create();
        rsa.ImportFromPem(privateKeyText);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, Guid.NewGuid().ToString()),
            new Claim("UserId", Guid.NewGuid().ToString()),
            new Claim("Email", "test@test.com"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new RsaSecurityKey(rsa);
        var creds = new SigningCredentials(key, SecurityAlgorithms.RsaSha256);

        var token = new JwtSecurityToken(
            issuer: "DynamicCMS",
            audience: "DynamicCMS",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: creds
        );

        try
        {
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            Console.WriteLine("Success: " + tokenString);
        }
        catch (Exception ex)
        {
            Console.WriteLine("Error: " + ex.ToString());
        }
    }
}
