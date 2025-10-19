using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Inventories;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IInventoryRepository _repository;

        public InventoryService(IInventoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<InventoryReadDto>> GetAllAsync(bool? isActive = true)
        {
            var inventories = await _repository.GetAllAsync(isActive);
            return inventories.Select(i => new InventoryReadDto
            {
                Id = i.Id,
                Name = i.Name,
                Status = i.Status,
                DateInventaire = i.DateInventaire,
                IsActive = i.IsActive
            });
        }

        public async Task<InventoryReadDto?> GetByIdAsync(int id)
        {
            var inventory = await _repository.GetByIdAsync(id);
            if (inventory == null || !inventory.IsActive)
                return null;

            return new InventoryReadDto
            {
                Id = inventory.Id,
                Name = inventory.Name,
                Status = inventory.Status,
                DateInventaire = inventory.DateInventaire,
                IsActive = inventory.IsActive
            };
        }

        public async Task CreateAsync(InventoryCreateDto dto)
        {
            var inventory = new Inventory
            {
                Name = dto.Name,
                Status = dto.Status,
                DateInventaire = DateTime.UtcNow,
                IsActive = true
            };

            await _repository.AddAsync(inventory);
        }

        public async Task<bool> UpdateAsync(int id, InventoryUpdateDto dto)
        {
            var inventory = await _repository.GetByIdAsync(id);
            if (inventory == null || !inventory.IsActive)
                return false;

            inventory.Name = dto.Name;
            inventory.Status = dto.Status;
            await _repository.UpdateAsync(inventory);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists)
                return false;

            await _repository.SetActiveStatusAsync(id, isActive);
            return true;
        }
    }
}
