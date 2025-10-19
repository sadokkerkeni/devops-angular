//using Microsoft.EntityFrameworkCore;
//using PfeProject.Domain.Entities;
//using PfeProject.Domain.Interfaces;
//using PfeProject.Infrastructure.Persistence;
//using System.Collections.Generic;
//using System.Linq;
//using System.Threading.Tasks;

//namespace PfeProject.Infrastructure.Repositories
//{
//    public class StockRepository : IStockRepository
//    {
//        private readonly ApplicationDbContext _context;

//        public StockRepository(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<UnitStock> GetUsByCodeAsync(string usCode)
//        {
//            return await _context.UnitStocks
//                                 .Include(us => us.Location)
//                                 .FirstOrDefaultAsync(us => us.Code == usCode);
//        }

//        public async Task<UnitStock> GetUsByIdAsync(int id)
//        {
//            return await _context.UnitStocks
//                                 .Include(us => us.Location)
//                                 .FirstOrDefaultAsync(us => us.Id == id);
//        }

//        public async Task<List<UnitStock>> GetAllStocksAsync()
//        {
//            return await _context.UnitStocks
//                                 .Include(us => us.Location)
//                                 .ToListAsync();
//        }

//        public async Task AssignUsToLocationAsync(UnitStock us)
//        {
//            _context.UnitStocks.Update(us);
//            await _context.SaveChangesAsync();
//        }

//        public async Task CreateUnitStockAsync(UnitStock unitStock)
//        {
//            await _context.UnitStocks.AddAsync(unitStock);
//            await _context.SaveChangesAsync();
//        }

//        public async Task DeleteUnitStockAsync(UnitStock unitStock)
//        {
//            _context.UnitStocks.Remove(unitStock);
//            await _context.SaveChangesAsync();
//        }

//        public async Task<Location> GetLocationByCodeAsync(string locationCode)
//        {
//            return await _context.Locations
//                                 .Include(l => l.UnitStocks)
//                                 .FirstOrDefaultAsync(l => l.Code == locationCode);
//        }

//        public async Task<Location> GetLocationByIdAsync(int id)
//        {
//            return await _context.Locations
//                                 .Include(l => l.UnitStocks)
//                                 .FirstOrDefaultAsync(l => l.Id == id);
//        }

//        public async Task<List<Location>> GetAllLocationsAsync()
//        {
//            return await _context.Locations
//                                 .Include(l => l.UnitStocks)
//                                 .ToListAsync();
//        }

//        public async Task CreateLocationAsync(Location location)
//        {
//            await _context.Locations.AddAsync(location);
//            await _context.SaveChangesAsync();
//        }

//        public async Task DeleteLocationAsync(Location location)
//        {
//            _context.Locations.Remove(location);
//            await _context.SaveChangesAsync();
//        }
//    }
//}
