using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<IReadOnlyList<User>> GetAllUsersAsync();
        Task<User> GetUserByIdAsync(int id);
        Task AddUserAsync(User user);
        Task UpdateUserAsync(User user);
        Task DeleteUserAsync(int id);

        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserWithRolesByEmailAsync(string email);
        Task<User> GetUserByResetTokenAsync(string token); // 🔐 Ajouté pour le reset password
        Task<IReadOnlyList<User>> GetAllUsersWithRolesAsync();

    }
}
