// ✅ AuthController.cs - avec mot de passe oublié & réinitialisation
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models;
using System.Threading.Tasks;

namespace PfeProject.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var result = await _authService.RegisterAsync(request);
                
                if (!result.Success)
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
            {
                // Catch any database constraint violations (e.g., duplicate matricule)
                if (ex.InnerException is Npgsql.PostgresException pgEx && pgEx.SqlState == "23505")
                {
                    return BadRequest(new { 
                        Success = false, 
                        Message = "Une erreur de contrainte unique s'est produite. Vérifiez que l'email et le matricule sont uniques." 
                    });
                }
                throw; // Re-throw if it's a different exception
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);

            if (result.Message == "Email ou mot de passe invalide ❌")
                return Unauthorized(result);

            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var result = await _authService.SendResetPasswordTokenAsync(request.Email);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            var result = await _authService.ResetPasswordAsync(request.Token, request.NewPassword);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        // ⚠️ ENDPOINT TEMPORAIRE - À SUPPRIMER EN PRODUCTION
        // Génère un hash BCrypt pour un mot de passe (pour tests)
        [HttpGet("generate-hash")]
        public IActionResult GenerateHash([FromQuery] string password = "Test123!")
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(11));
            var sql = $"UPDATE \"Users\" SET \"Password\" = '{hash}' WHERE \"Email\" = 'jean.dupont@techcorp.com';";
            
            return Ok(new 
            { 
                password = password,
                hash = hash,
                sql = sql,
                message = "Copiez la commande SQL et exécutez-la dans votre base de données"
            });
        }
    }
}
