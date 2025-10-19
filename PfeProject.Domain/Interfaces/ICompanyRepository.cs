using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface ICompanyRepository
    {
        Task<IReadOnlyList<Company>> GetAllCompaniesAsync();
        Task<Company> GetCompanyByIdAsync(int id);
        Task<Company> GetCompanyByCodeAsync(string code);
        Task AddCompanyAsync(Company company);
        Task UpdateCompanyAsync(Company company);
        Task DeleteCompanyAsync(int id);
        Task<bool> CompanyExistsAsync(int id);
        Task<bool> CompanyCodeExistsAsync(string code);
    }
}
