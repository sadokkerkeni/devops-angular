using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.DetailInventories;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class DetailInventoryService : IDetailInventoryService
    {
        private readonly IDetailInventoryRepository _repository;

        public DetailInventoryService(IDetailInventoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DetailInventoryReadDto>> GetAllAsync(bool? isActive = true)
        {
            var list = await _repository.GetAllAsync(isActive);
            return list.Select(d => new DetailInventoryReadDto
            {
                Id = d.Id,
                UsCode = d.UsCode,
                ArticleCode = d.ArticleCode,
                LocationId = d.LocationId,
                InventoryId = d.InventoryId,
                UserId = d.UserId,
                SapId = d.SapId
            });
        }

        public async Task<DetailInventoryReadDto?> GetByIdAsync(int id)
        {
            var d = await _repository.GetByIdAsync(id);
            if (d == null) return null;

            return new DetailInventoryReadDto
            {
                Id = d.Id,
                UsCode = d.UsCode,
                ArticleCode = d.ArticleCode,
                LocationId = d.LocationId,
                InventoryId = d.InventoryId,
                UserId = d.UserId,
                SapId = d.SapId
            };
        }

        public async Task<IEnumerable<DetailInventoryReadDto>> GetByInventoryIdAsync(int inventoryId, bool? isActive = true)
        {
            var list = await _repository.GetByInventoryIdAsync(inventoryId, isActive);
            return list.Select(d => new DetailInventoryReadDto
            {
                Id = d.Id,
                UsCode = d.UsCode,
                ArticleCode = d.ArticleCode,
                LocationId = d.LocationId,
                InventoryId = d.InventoryId,
                UserId = d.UserId,
                SapId = d.SapId
            });
        }

        public async Task CreateAsync(DetailInventoryCreateDto dto)
        {
            var d = new DetailInventory
            {
                UsCode = dto.UsCode,
                ArticleCode = dto.ArticleCode,
                LocationId = dto.LocationId,
                InventoryId = dto.InventoryId,
                UserId = dto.UserId,
                SapId = dto.SapId,
                IsActive = true
            };

            await _repository.AddAsync(d);
        }

        public async Task<bool> UpdateAsync(int id, DetailInventoryUpdateDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.ArticleCode = dto.ArticleCode;
            entity.LocationId = dto.LocationId;
            entity.SapId = dto.SapId;

            await _repository.UpdateAsync(entity);
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
