using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;

namespace PfeProject.Infrastructure.Repositories
{
    public class SapRepository : ISapRepository
    {
        private readonly ApplicationDbContext _context;

        public SapRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Sap>> GetAllAsync(bool? isActive = true)
        {
            var query = _context.Saps.AsQueryable();

            if (isActive.HasValue)
                query = query.Where(s => s.IsActive == isActive.Value);

            return await query.ToListAsync();
        }

        public async Task<Sap?> GetByIdAsync(int id)
        {
            return await _context.Saps.FindAsync(id);
        }

        public async Task AddAsync(Sap sap)
        {
            _context.Saps.Add(sap);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Sap sap)
        {
            _context.Saps.Update(sap);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Saps.AnyAsync(s => s.Id == id);
        }

        public async Task SetActiveStatusAsync(int id, bool isActive)
        {
            var sap = await _context.Saps.FindAsync(id);
            if (sap != null)
            {
                sap.IsActive = isActive;
                await _context.SaveChangesAsync();
            }
        }
        public async Task<Sap?> GetByUsCodeAsync(string usCode)
        {
            // Utiliser Entity Framework pour trouver l'entité par UsCode
            // Assurez-vous que 'UsCode' est le nom correct de la propriété dans votre entité Sap.
            //return await _context.Saps.FirstOrDefaultAsync(s => s.UsCode == usCode);
            // Si vous voulez inclure des propriétés de navigation :
            return await _context.Saps
                //.Include(s => s.Article) // Si nécessaire
                .FirstOrDefaultAsync(s => s.UsCode == usCode);
        }
    }
}
