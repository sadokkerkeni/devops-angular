using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class StatusRepository : IStatusRepository
    {
        private readonly ApplicationDbContext _context;

        public StatusRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Status>> GetAllAsync()
        {
            return await _context.Statuses.ToListAsync();
        }

        public async Task<Status?> GetByIdAsync(int id)
        {
            return await _context.Statuses.FindAsync(id);
        }

        public async Task AddAsync(Status status)
        {
            _context.Statuses.Add(status);
            await _context.SaveChangesAsync();
        }
    }
}
