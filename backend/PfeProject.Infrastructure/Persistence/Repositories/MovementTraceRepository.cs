using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class MovementTraceRepository : IMovementTraceRepository
    {
        private readonly ApplicationDbContext _context;

        public MovementTraceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MovementTrace>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.MovementTraces
                .Include(mt => mt.User)
                .Include(mt => mt.DetailPicklist)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(mt => mt.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<MovementTrace?> GetByIdAsync(int id)
        {
            return await _context.MovementTraces
                .Include(mt => mt.User)
                .Include(mt => mt.DetailPicklist)
                .FirstOrDefaultAsync(mt => mt.Id == id);
        }

        public async Task AddAsync(MovementTrace entity)
        {
            _context.MovementTraces.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.MovementTraces.AnyAsync(mt => mt.Id == id);
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var entity = await _context.MovementTraces.FindAsync(id);
            if (entity == null) return false;

            entity.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }

        // Company-aware methods
        public async Task<IEnumerable<MovementTrace>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var query = _context.MovementTraces
                .Include(mt => mt.User)
                .Include(mt => mt.DetailPicklist)
                .Where(mt => mt.CompanyId == companyId); // 🏢 Filter by CompanyId

            if (isActive.HasValue)
                query = query.Where(mt => mt.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<MovementTrace?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            return await _context.MovementTraces
                .Include(mt => mt.User)
                .Include(mt => mt.DetailPicklist)
                .FirstOrDefaultAsync(mt => mt.Id == id && mt.CompanyId == companyId); // 🏢 Filter by CompanyId
        }
    }
}
