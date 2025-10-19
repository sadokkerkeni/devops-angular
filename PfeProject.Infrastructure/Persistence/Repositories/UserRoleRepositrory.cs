using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class UserRoleRepository : IUserRoleRepository
{
    private readonly ApplicationDbContext _context;

    public UserRoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserRole> GetByIdAsync(int userId, int roleId)
    {
        return await _context.UserRoles.FindAsync(userId, roleId);
    }

    public async Task<IReadOnlyList<UserRole>> GetAllAsync()
    {
        return await _context.UserRoles.ToListAsync();
    }

    public async Task AddAsync(UserRole userRole)
    {
        _context.UserRoles.Add(userRole);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(UserRole userRole)
    {
        _context.UserRoles.Update(userRole);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int userId, int roleId)
    {
        var userRole = await _context.UserRoles.FindAsync(userId, roleId);
        if (userRole != null)
        {
            _context.UserRoles.Remove(userRole);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int userId, int roleId)
    {
        return await _context.UserRoles.AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId);
    }

    public async Task<IReadOnlyList<Role>> GetRolesForUserAsync(int userId)
    {
        return await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<User>> GetUsersForRoleAsync(int roleId)
    {
        return await _context.UserRoles
            .Where(ur => ur.RoleId == roleId)
            .Include(ur => ur.User)
            .Select(ur => ur.User)
            .ToListAsync();
    }
}

