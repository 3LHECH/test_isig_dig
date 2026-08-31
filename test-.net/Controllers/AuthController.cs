using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CommercialManagement.API.DTOs;
using CommercialManagement.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace CommercialManagement.API.Controllers;

public class UserLogin{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IClientService _clientService;
    private readonly IConfiguration _configuration;

    public AuthController(IClientService clientService, IConfiguration configuration)
    {
        _clientService = clientService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLogin user)
    {
        var client = await _clientService.GetByEmailAsync(user.Email);

        if (client == null || !BCrypt.Net.BCrypt.Verify(user.Password, client.Password))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = GenerateJwtToken(client.Email);

        // Append token into HttpOnly Cookie
        Response.Cookies.Append("jwt", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true when running on HTTPS
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(30)
        });

        return Ok(new { message = "Login successful" });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt");
        return Ok(new { message = "Logged out successfully" });
    }

    private string GenerateJwtToken(string email)
    {
        var secretKey = _configuration["Jwt:Key"] 
            ?? throw new InvalidOperationException("JWT Secret Key 'Jwt:Key' is missing in appsettings.json.");

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "yourdomain.com",
            audience: _configuration["Jwt:Audience"] ?? "yourdomain.com",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}