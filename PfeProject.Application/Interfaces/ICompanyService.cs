using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface ICompanyService
    {
        Task<IReadOnlyList<Company>> GetAllCompaniesAsync();
        Task<Company> GetCompanyByIdAsync(int id);
        Task<Company> GetCompanyByCodeAsync(string code);
        Task<Company> CreateCompanyAsync(string name, string description, string code);
        Task UpdateCompanyAsync(int id, string name, string description, string code);
        Task DeleteCompanyAsync(int id);
        Task<bool> CompanyExistsAsync(int id);
        Task<bool> CompanyCodeExistsAsync(string code);
    }
}
