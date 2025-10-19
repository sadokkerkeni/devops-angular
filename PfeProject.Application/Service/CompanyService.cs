using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly IStatusRepository _statusRepository;

        public CompanyService(ICompanyRepository companyRepository, IStatusRepository statusRepository)
        {
            _companyRepository = companyRepository;
            _statusRepository = statusRepository;
        }

        public async Task<IReadOnlyList<Company>> GetAllCompaniesAsync()
        {
            return await _companyRepository.GetAllCompaniesAsync();
        }

        public async Task<Company> GetCompanyByIdAsync(int id)
        {
            return await _companyRepository.GetCompanyByIdAsync(id);
        }

        public async Task<Company> GetCompanyByCodeAsync(string code)
        {
            return await _companyRepository.GetCompanyByCodeAsync(code);
        }

        public async Task<Company> CreateCompanyAsync(string name, string description, string code)
        {
            var company = new Company
            {
                Name = name,
                Description = description,
                Code = code,
                CreationDate = System.DateTime.UtcNow,
                UpdateDate = System.DateTime.UtcNow,
                IsActive = true
            };

            await _companyRepository.AddCompanyAsync(company);

            // Create default statuses for this company
            var defaults = new[] { "Draft","Ready","Shipping","Completed","Cancelled","Returned","Servie","Non Servie" };
            foreach (var d in defaults)
            {
                await _statusRepository.AddAsync(new Status { Description = d, CompanyId = company.Id });
            }

            return company;
        }

        public async Task UpdateCompanyAsync(int id, string name, string description, string code)
        {
            var company = await _companyRepository.GetCompanyByIdAsync(id);
            if (company != null)
            {
                company.Name = name;
                company.Description = description;
                company.Code = code;
                company.UpdateDate = System.DateTime.UtcNow;

                await _companyRepository.UpdateCompanyAsync(company);
            }
        }

        public async Task DeleteCompanyAsync(int id)
        {
            await _companyRepository.DeleteCompanyAsync(id);
        }

        public async Task<bool> CompanyExistsAsync(int id)
        {
            return await _companyRepository.CompanyExistsAsync(id);
        }

        public async Task<bool> CompanyCodeExistsAsync(string code)
        {
            return await _companyRepository.CompanyCodeExistsAsync(code);
        }
    }
}
