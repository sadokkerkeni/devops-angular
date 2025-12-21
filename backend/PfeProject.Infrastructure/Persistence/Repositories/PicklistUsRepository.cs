using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;


public class PicklistUsRepository : IPicklistUsRepository
{
    private readonly ApplicationDbContext _context;

    public PicklistUsRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PicklistUs>> GetFilteredAsync(int? statusId, int? userId, int? detailPicklistId, bool? isActive, string? nom)
    {
        var query = _context.PicklistUsList
            .Include(p => p.User)
            .Include(p => p.Status)
            .AsQueryable();

        if (statusId.HasValue)
            query = query.Where(p => p.StatusId == statusId);

        if (userId.HasValue)
            query = query.Where(p => p.UserId == userId);

        if (detailPicklistId.HasValue)
            query = query.Where(p => p.DetailPicklistId == detailPicklistId);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive);

        if (!string.IsNullOrWhiteSpace(nom))
            query = query.Where(p => p.Nom.ToLower().Contains(nom.ToLower()));

        return await query.ToListAsync();
    }

    public async Task<PicklistUs?> GetByIdAsync(int id)
    {
        return await _context.PicklistUsList
            .Include(p => p.User)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PicklistUs> AddAsync(PicklistUs entity)
    {
        _context.PicklistUsList.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(PicklistUs entity)
    {
        _context.PicklistUsList.Update(entity);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var entity = await _context.PicklistUsList.FindAsync(id);
        if (entity == null || !entity.IsActive) return false;

        entity.IsActive = false;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ActivateAsync(int id)
    {
        var entity = await _context.PicklistUsList.FindAsync(id);
        if (entity == null || entity.IsActive) return false;

        entity.IsActive = true;
        await _context.SaveChangesAsync();
        return true;
    }

    // Company-aware methods
    public async Task<IEnumerable<PicklistUs>> GetFilteredByCompanyAsync(int? statusId, int? userId, int? detailPicklistId, bool? isActive, string? nom, int companyId)
    {
        var query = _context.PicklistUsList
            .Include(p => p.User)
            .Include(p => p.Status)
            .Where(p => p.CompanyId == companyId) // 🏢 Filter by CompanyId
            .AsQueryable();

        if (statusId.HasValue)
            query = query.Where(p => p.StatusId == statusId);

        if (userId.HasValue)
            query = query.Where(p => p.UserId == userId);

        if (detailPicklistId.HasValue)
            query = query.Where(p => p.DetailPicklistId == detailPicklistId);

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive);

        if (!string.IsNullOrWhiteSpace(nom))
            query = query.Where(p => p.Nom.ToLower().Contains(nom.ToLower()));

        return await query.ToListAsync();
    }

    public async Task<PicklistUs?> GetByIdAndCompanyAsync(int id, int companyId)
    {
        return await _context.PicklistUsList
            .Include(p => p.User)
            .Include(p => p.Status)
            .FirstOrDefaultAsync(p => p.Id == id && p.CompanyId == companyId); // 🏢 Filter by CompanyId
    }
}
