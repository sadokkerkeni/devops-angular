using PfeProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using BCrypt.Net;

namespace PfeProject.Infrastructure.Persistence
{
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;

        public DataSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedAsync()
        {
            // ✅ Ensure a default company exists
            Company defaultCompany;
            if (!await _context.Companies.AnyAsync())
            {
                defaultCompany = new Company
                {
                    Name = "Default Company",
                    Description = "Default company for system initialization",
                    Code = "DEFAULT",
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };
                _context.Companies.Add(defaultCompany);
                await _context.SaveChangesAsync();
            }
            else
            {
                defaultCompany = await _context.Companies.FirstAsync();
            }

            // ✅ Seed per-company default statuses if missing
            async Task EnsureCompanyStatusesAsync(int companyId)
            {
                // Examples: Draft, Ready, Shipping, Completed, Cancelled, Returned, Servie, Non Servie
                var wanted = new[]
                {
                    "Draft","Ready","Shipping","Completed","Cancelled","Returned","Servie","Non Servie"
                };
                var existing = await _context.Statuses
                    .AsNoTracking()
                    .Where(s => s.CompanyId == companyId)
                    .Select(s => s.Description)
                    .ToListAsync();

                foreach (var name in wanted)
                {
                    if (!existing.Contains(name))
                    {
                        _context.Statuses.Add(new Status
                        {
                            Description = name,
                            CompanyId = companyId
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }

            await EnsureCompanyStatusesAsync(defaultCompany.Id);

            // ✅ Create roles if not exist
            if (!await _context.Roles.AnyAsync())
            {
                _context.Roles.AddRange(
                    new Role { Name = "Admin", State = true },
                    new Role { Name = "User", State = true }
                );
                await _context.SaveChangesAsync();
            }

            // ✅ Create default admin user
            var adminEmail = "sadokkerkeni@gmail.com";
            if (!await _context.Users.AnyAsync(u => u.Email == adminEmail))
            {
                var admin = new User
                {
                    FirstName = "Admin",
                    LastName = "System",
                    Matricule = "ADM001",
                    Email = adminEmail,
                    Password = BCrypt.Net.BCrypt.HashPassword("11099536"),
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    State = true,
                    CompanyId = defaultCompany.Id
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();

                var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");

                _context.UserRoles.Add(new UserRole
                {
                    UserId = admin.Id,
                    RoleId = adminRole.Id,
                    IsActive = true,
                    AssignmentDate = DateTime.UtcNow,
                    Note = "Admin créé automatiquement",
                    AssignedById = null
                });

                await _context.SaveChangesAsync();
            }
        }
    }
}
