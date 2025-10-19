using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Infrastructure.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly ApplicationDbContext _context;

        public CompanyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Company>> GetAllCompaniesAsync()
        {
            return await _context.Companies
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Company> GetCompanyByIdAsync(int id)
        {
            return await _context.Companies
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<Company> GetCompanyByCodeAsync(string code)
        {
            return await _context.Companies
                .FirstOrDefaultAsync(c => c.Code == code && c.IsActive);
        }

        public async Task AddCompanyAsync(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateCompanyAsync(Company company)
        {
            _context.Companies.Update(company);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCompanyAsync(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company != null)
            {
                company.IsActive = false;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> CompanyExistsAsync(int id)
        {
            return await _context.Companies
                .AnyAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<bool> CompanyCodeExistsAsync(string code)
        {
            return await _context.Companies
                .AnyAsync(c => c.Code == code && c.IsActive);
        }
    }
}
