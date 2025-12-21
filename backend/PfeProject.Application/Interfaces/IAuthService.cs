using PfeProject.Application.Models;
using PfeProject.Application.Models.Invitations;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);

        // 🔁 Mot de passe oublié
        Task<AuthResponse> SendResetPasswordTokenAsync(string email);

        // 🔐 Réinitialisation du mot de passe avec token
        Task<AuthResponse> ResetPasswordAsync(string token, string newPassword);

        // 🏢 Invite user to company
        Task<AuthResponse> InviteUserToCompanyAsync(InviteUserRequest request);
    }
}
