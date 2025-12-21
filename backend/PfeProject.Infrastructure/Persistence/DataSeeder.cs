using PfeProject.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
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
            // ✅ Ensure CompanyId = 1 exists (for global/shared roles and statuses)
            var globalCompany = await _context.Companies.FindAsync(1);
            if (globalCompany == null)
            {
                Console.WriteLine("[DataSeeder] Creating Company ID=1 for global roles and statuses");
                _context.Companies.Add(new Company
                {
                    Id = 1,
                    Name = "Global Company",
                    Description = "Company for global roles and statuses",
                    Code = "GLOBAL",
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });
                await _context.SaveChangesAsync();
            }

            // ✅ Create all required roles if not exist (using CompanyId = 1)
            var requiredRoles = new[]
            {
                "Administrateur",      // Admin - manages users and roles
                "User",                 // Default user role for new registrations
                "Magasinier",          // Inventory Manager - manages inventories
                "Opérateur",           // Operator - manages picklists (served and non-served), receptions, returns
                "Chef de ligne",       // Line Manager - manages served and non-served picklists
                "Appro-ligne",         // Line Supply - manages returns
                "Contrôle qualité"     // Quality Control - validates returns before reintegration
            };

            var existingRoles = await _context.Roles
                .Where(r => requiredRoles.Contains(r.Name))
                .ToListAsync();

            var existingRoleNames = existingRoles.Select(r => r.Name).ToList();
            var missingRoles = requiredRoles.Where(r => !existingRoleNames.Contains(r)).ToList();

            Console.WriteLine($"[DataSeeder] Checking roles: Found {existingRoles.Count} existing roles, Missing {missingRoles.Count} roles");

            // Update existing roles to CompanyId = 1 if needed
            foreach (var role in existingRoles)
            {
                if (role.CompanyId != 1)
                {
                    Console.WriteLine($"[DataSeeder] Updating {role.Name} role CompanyId from {role.CompanyId} to 1");
                    role.CompanyId = 1;
                }
            }

            // Create missing roles
            foreach (var roleName in missingRoles)
            {
                Console.WriteLine($"[DataSeeder] Creating {roleName} role with CompanyId = 1");
                _context.Roles.Add(new Role 
                { 
                    Name = roleName, 
                    State = true, 
                    CompanyId = 1,
                    CreationDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            // Also keep "Admin" for backward compatibility (map it to Administrateur)
            var existingAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin");
            if (existingAdminRole != null && existingAdminRole.CompanyId != 1)
            {
                Console.WriteLine($"[DataSeeder] Updating Admin role CompanyId from {existingAdminRole.CompanyId} to 1");
                existingAdminRole.CompanyId = 1;
            }

            if (missingRoles.Any() || existingRoles.Any(r => r.CompanyId != 1) || 
                (existingAdminRole != null && existingAdminRole.CompanyId != 1))
            {
                await _context.SaveChangesAsync();
                Console.WriteLine("[DataSeeder] Roles created/updated successfully");
            }
            else
            {
                Console.WriteLine("[DataSeeder] All roles already exist with CompanyId = 1");
            }

            // ✅ Get or create admin user (always use CompanyId = 1)
            var adminEmail = "sadokkerkeni@gmail.com";
            var adminUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);

            if (adminUser == null)
            {
                Console.WriteLine("[DataSeeder] Creating admin user with CompanyId = 1");
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
                    CompanyId = 1 // 🏢 Use global company
                };

                _context.Users.Add(admin);
                await _context.SaveChangesAsync();
                Console.WriteLine("[DataSeeder] Admin user created successfully");

                adminUser = admin;
            }

            // ✅ Update admin user CompanyId to 1 if different
            if (adminUser.CompanyId != 1)
            {
                Console.WriteLine($"[DataSeeder] Updating admin user CompanyId from {adminUser.CompanyId} to 1");
                adminUser.CompanyId = 1;
                _context.Users.Update(adminUser);
                await _context.SaveChangesAsync();
            }

            // ✅ Ensure admin user has Administrateur role assigned (always use CompanyId = 1)
            if (adminUser != null)
            {
                // Try to get Administrateur role first, fallback to Admin for backward compatibility
                var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Administrateur" && r.CompanyId == 1);
                if (adminRole == null)
                {
                    adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Admin" && r.CompanyId == 1);
                }

                if (adminRole == null)
                {
                    Console.WriteLine("[DataSeeder] ERROR: Administrateur/Admin role not found!");
                    return;
                }

                var hasAdminRole = await _context.UserRoles
                    .AnyAsync(ur => ur.UserId == adminUser.Id && ur.RoleId == adminRole.Id && ur.IsActive);

                if (!hasAdminRole)
                {
                    Console.WriteLine($"[DataSeeder] Creating UserRole - UserId: {adminUser.Id}, RoleId: {adminRole.Id} ({adminRole.Name}), CompanyId: 1");

                    _context.UserRoles.Add(new UserRole
                    {
                        UserId = adminUser.Id,
                        RoleId = adminRole.Id,
                        IsActive = true,
                        AssignmentDate = DateTime.UtcNow,
                        Note = "Admin créé automatiquement",
                        AssignedById = null,
                        CompanyId = 1 // 🏢 Always use global company
                    });

                    await _context.SaveChangesAsync();
                    Console.WriteLine("[DataSeeder] UserRole created successfully");
                }
                else
                {
                    Console.WriteLine($"[DataSeeder] {adminRole.Name} role already assigned to user");
                }
            }

            // ✅ Ensure global statuses exist (only once for CompanyId = 1)
            await EnsureCompanyStatusesAsync(1);
        }

        // ✅ Seed default statuses if missing (only for CompanyId = 1)
        private async Task EnsureCompanyStatusesAsync(int companyId)
        {
            var wanted = new[] { "Draft", "Ready", "Shipping", "Completed", "Cancelled", "Returned", "Servie", "Non Servie" };

            var existing = await _context.Statuses
                .Where(s => s.CompanyId == companyId)
                .Select(s => s.Description)
                .ToListAsync();

            if (existing.Any())
            {
                Console.WriteLine($"[DataSeeder] Statuses already exist for CompanyId {companyId}: {string.Join(", ", existing)}");
                return;
            }

            Console.WriteLine($"[DataSeeder] Creating statuses for CompanyId {companyId}");

            foreach (var name in wanted)
            {
                _context.Statuses.Add(new Status
                {
                    Description = name,
                    Type = "Picklist", // Les statuts par défaut sont pour les picklists
                    CompanyId = companyId
                });
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"[DataSeeder] Created {wanted.Length} statuses for CompanyId {companyId}");
        }
    }
}
