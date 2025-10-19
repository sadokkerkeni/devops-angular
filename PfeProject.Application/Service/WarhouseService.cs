using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IWarehouseRepository _repository;

        public WarehouseService(IWarehouseRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<WarehouseReadDto>> GetAllAsync(bool? isActive = true)
        {
            var warehouses = await _repository.GetAllAsync(isActive);

            return warehouses.Select(w => new WarehouseReadDto
            {
                Id = w.Id,
                Name = w.Name,
                Description = w.Description,
                IsActive = w.IsActive
            });
        }

        public async Task<WarehouseReadDto?> GetByIdAsync(int id)
        {
            var warehouse = await _repository.GetByIdAsync(id);
            if (warehouse == null || !warehouse.IsActive)
                return null;

            return new WarehouseReadDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Description = warehouse.Description,
                IsActive = warehouse.IsActive
            };
        }

        public async Task CreateAsync(WarehouseCreateDto dto)
        {
            var warehouse = new Warehouse
            {
                Name = dto.Name,
                Description = dto.Description,
                IsActive = true
            };

            await _repository.AddAsync(warehouse);
        }

        public async Task<bool> UpdateAsync(int id, WarehouseUpdateDto dto)
        {
            var warehouse = await _repository.GetByIdAsync(id);
            if (warehouse == null || !warehouse.IsActive)
                return false;

            warehouse.Name = dto.Name;
            warehouse.Description = dto.Description;

            await _repository.UpdateAsync(warehouse);
            return true;
        }
    }
}
