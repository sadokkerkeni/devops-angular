using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class LineRepository : ILineRepository
    {
        private readonly ApplicationDbContext _context;

        public LineRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Line>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.Lines.AsQueryable();

            if (isActive.HasValue)
                query = query.Where(l => l.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<Line?> GetByIdAsync(int id)
        {
            return await _context.Lines.FindAsync(id);
        }

        public async Task AddAsync(Line line)
        {
            _context.Lines.Add(line);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Line line)
        {
            _context.Lines.Update(line);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Lines.AnyAsync(l => l.Id == id);
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var line = await _context.Lines.FindAsync(id);
            if (line == null) return false;

            line.IsActive = isActive;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
