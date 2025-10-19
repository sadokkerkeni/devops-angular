using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        private readonly ApplicationDbContext _context;

        public LocationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Location>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.Locations.AsQueryable();

            // (Optionnel : ajoute si tu ajoutes un champ IsActive)
            // if (isActive.HasValue)
            //     query = query.Where(l => l.IsActive == isActive.Value);

            return await query.Include(l => l.Warehouse).ToListAsync();
        }

        public async Task<Location?> GetByIdAsync(int id)
        {
            return await _context.Locations
                .Include(l => l.Warehouse)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task AddAsync(Location location)
        {
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Location location)
        {
            _context.Locations.Update(location);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Locations.AnyAsync(l => l.Id == id);
        }
        public async Task SetActiveStatusAsync(int id, bool isActive)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location != null)
            {
                location.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }


    }
}



