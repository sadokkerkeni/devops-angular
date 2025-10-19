using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class RoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        public async Task<IEnumerable<Role>> GetAllRolesAsync() =>
            await _roleRepository.GetAllRolesAsync();

        public async Task<Role> GetRoleByIdAsync(int id) =>
            await _roleRepository.GetRoleByIdAsync(id);

        public async Task AddRoleAsync(Role role) =>
            await _roleRepository.AddRoleAsync(role);

        public async Task UpdateRoleAsync(Role role) =>
            await _roleRepository.UpdateRoleAsync(role);

        public async Task DeleteRoleAsync(int id) =>
            await _roleRepository.DeleteRoleAsync(id);
    }
}
