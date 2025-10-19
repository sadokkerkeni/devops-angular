
using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class ReturnLineRepository : IReturnLineRepository
    {
        private readonly ApplicationDbContext _context;

        public ReturnLineRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ReturnLine>> GetAllAsync()
        {
            return await _context.ReturnLines
                .Include(r => r.User)
                .Include(r => r.Article)
                .Include(r => r.Status)
                .ToListAsync();
        }

        public async Task<ReturnLine?> GetByIdAsync(int id)
        {
            return await _context.ReturnLines
                .Include(r => r.User)
                .Include(r => r.Article)
                .Include(r => r.Status)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<ReturnLine> CreateAsync(ReturnLine returnLine)
        {
            _context.ReturnLines.Add(returnLine);
            await _context.SaveChangesAsync();
            return returnLine;
        }

        public async Task<bool> UpdateAsync(ReturnLine returnLine)
        {
            _context.ReturnLines.Update(returnLine);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.ReturnLines.FindAsync(id);
            if (entity == null)
                return false;

            _context.ReturnLines.Remove(entity);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
