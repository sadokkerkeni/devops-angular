using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            _roleRepository = roleRepository;
        }

        // Legacy methods
        public async Task<IEnumerable<Role>> GetAllAsync() =>
            await _roleRepository.GetAllRolesAsync();

        public async Task<Role> GetByIdAsync(int id) =>
            await _roleRepository.GetRoleByIdAsync(id);

        public async Task<Role> GetByNameAsync(string name) =>
            await _roleRepository.GetByNameAsync(name);

        public async Task AddAsync(Role role) =>
            await _roleRepository.AddRoleAsync(role);

        public async Task UpdateAsync(Role role) =>
            await _roleRepository.UpdateRoleAsync(role);

        public async Task DeleteAsync(int id) =>
            await _roleRepository.DeleteRoleAsync(id);

        // Company-aware methods
        public async Task<IEnumerable<Role>> GetAllByCompanyAsync(int companyId) =>
            await _roleRepository.GetAllRolesByCompanyAsync(companyId);

        public async Task<Role> GetByIdAndCompanyAsync(int id, int companyId) =>
            await _roleRepository.GetRoleByIdAndCompanyAsync(id, companyId);

        public async Task<Role> GetByNameAndCompanyAsync(string name, int companyId) =>
            await _roleRepository.GetByNameAndCompanyAsync(name, companyId);

        public async Task AddForCompanyAsync(Role role, int companyId)
        {
            role.CompanyId = companyId; // 🏢 Set Company relationship
            await _roleRepository.AddRoleAsync(role);
        }
    }
}
