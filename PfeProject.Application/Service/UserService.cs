using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;
namespace PfeProject.Application.Services
{
    public class UserService : IUserService
    {
        public Task AddUserAsync(User user)
        {
            throw new NotImplementedException();
        }

        public Task DeleteUserAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<User>> GetAllUsersAsync()
        {
            throw new NotImplementedException();
        }

        public Task<User> GetUserByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task UpdateUserAsync(User user)
        {
            throw new NotImplementedException();
        }
    }
}
    
   
      