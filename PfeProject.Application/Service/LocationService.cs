// LocationService.cs
using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Locations;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class LocationService : ILocationService
    {
        private readonly ILocationRepository _repository;

        public LocationService(ILocationRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<LocationReadDto>> GetAllAsync(bool? isActive = true)
        {
            var locations = await _repository.GetAllAsync(isActive);
            return locations.Select(l => new LocationReadDto
            {
                Id = l.Id,
                Code = l.Code,
                Description = l.Description,
                WarehouseId = l.WarehouseId,
                WarehouseName = l.Warehouse?.Name ?? string.Empty,
                IsActive = l.IsActive
            });
        }

        public async Task<LocationReadDto?> GetByIdAsync(int id)
        {
            var location = await _repository.GetByIdAsync(id);
            if (location == null || !location.IsActive)
                return null;

            return new LocationReadDto
            {
                Id = location.Id,
                Code = location.Code,
                Description = location.Description,
                WarehouseId = location.WarehouseId,
                WarehouseName = location.Warehouse?.Name ?? string.Empty,
                IsActive = location.IsActive
            };
        }

        public async Task CreateAsync(LocationCreateDto dto)
        {
            var location = new Location
            {
                Code = dto.Code,
                Description = dto.Description,
                WarehouseId = dto.WarehouseId,
                IsActive = true
            };

            await _repository.AddAsync(location);
        }

        public async Task<bool> UpdateAsync(int id, LocationUpdateDto dto)
        {
            var location = await _repository.GetByIdAsync(id);
            if (location == null || !location.IsActive)
                return false;

            location.Code = dto.Code;
            location.Description = dto.Description;
            location.WarehouseId = dto.WarehouseId;

            await _repository.UpdateAsync(location);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            await _repository.SetActiveStatusAsync(id, isActive);
            return true;
        }
    }
}
