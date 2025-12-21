using PfeProject.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
 
        public interface IUserService
        {
            Task<List<User>> GetAllUsersAsync();
            Task<User> GetUserByIdAsync(int id);
            Task AddUserAsync(User user);
            Task UpdateUserAsync(User user);
            Task DeleteUserAsync(int id);
        }
    }
