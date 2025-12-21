using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class JwtService
    {
        private readonly string _secretKey;
        private readonly string _issuer;
        private readonly string _audience;
        private readonly int _expiryInMinutes;

        public JwtService(IConfiguration configuration)
        {
            _secretKey = configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JwtSettings:SecretKey is not configured");
            _issuer = configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("JwtSettings:Issuer is not configured");
            _audience = configuration["JwtSettings:Audience"] ?? throw new InvalidOperationException("JwtSettings:Audience is not configured");
            _expiryInMinutes = int.Parse(configuration["JwtSettings:ExpiryInMinutes"] ?? "60");
        }

        public async Task<string> GenerateToken(string userId, string email, string role, int companyId)
        {
            return await GenerateToken(userId, email, new[] { role }, companyId);
        }

        public async Task<string> GenerateToken(string userId, string email, IEnumerable<string> roles, int companyId)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("CompanyId", companyId.ToString()), // ✅ Store Company ID in Token
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add all roles as claims (for authorization)
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                // Also add "Admin" claim if role is "Administrateur" for backward compatibility
                if (role == "Administrateur")
                {
                    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
                }
            }

            var token = new JwtSecurityToken(
                _issuer,
                _audience,
                claims,
                expires: DateTime.UtcNow.AddMinutes(_expiryInMinutes),
                signingCredentials: credentials
            );

            return await Task.FromResult(new JwtSecurityTokenHandler().WriteToken(token));
        }
    }
}
