using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Picklists;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class PicklistService : IPicklistService
    {
        private readonly IPicklistRepository _repository;

        public PicklistService(IPicklistRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<PicklistReadDto>> GetAllAsync(bool? isActive = true)
        {
            var list = await _repository.GetAllAsync(isActive);

            return list.Select(p => new PicklistReadDto
            {
                Id = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
                Type = p.Type,
                CreatedAt = p.CreatedAt,
                LineId = p.LineId,
                WarehouseId = p.WarehouseId,
                IsActive = p.IsActive,
                Status = p.Status == null ? null : new StatusDto
                {
                    Id = p.Status.Id,
                    Description = p.Status.Description
                }
            });
        }

        public async Task<PicklistReadDto?> GetByIdAsync(int id)
        {
            var p = await _repository.GetByIdAsync(id);
            if (p == null) return null;

            return new PicklistReadDto
            {
                Id = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
                Type = p.Type,
                CreatedAt = p.CreatedAt,
                LineId = p.LineId,
                WarehouseId = p.WarehouseId,
                Status = p.Status == null ? null : new StatusDto
                {
                    Id = p.Status.Id,
                    Description = p.Status.Description
                },
                IsActive = p.IsActive
            };
        }

        public async Task<PicklistReadDto> CreateAsync(PicklistCreateDto dto)
        {
            var p = new Picklist
            {
                Name = dto.Name,
                Quantity = dto.Quantity,
                Type = dto.Type,
                LineId = dto.LineId,
                WarehouseId = dto.WarehouseId,
                StatusId = dto.StatusId,
                IsActive = true
            };

            await _repository.AddAsync(p);

            return new PicklistReadDto
            {
                Id = p.Id,
                Name = p.Name,
                Quantity = p.Quantity,
                Type = p.Type,
                CreatedAt = p.CreatedAt,
                LineId = p.LineId,
                WarehouseId = p.WarehouseId,
               Status = p.Status == null ? null : new StatusDto
                {
                    Id = p.Status.Id,
                    Description = p.Status.Description
                },
                IsActive = p.IsActive
            };
        }

        public async Task<bool> UpdateAsync(int id, PicklistUpdateDto dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            existing.Name = dto.Name;
            existing.Quantity = dto.Quantity;
            existing.Type = dto.Type;
            existing.LineId = dto.LineId;
            existing.WarehouseId = dto.WarehouseId;
            existing.StatusId = dto.StatusId;

            await _repository.UpdateAsync(existing);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            return await _repository.SetActiveStatusAsync(id, isActive);
        }

        // New: set status directly by statusId (transitions validated lightly here)
        public async Task<bool> SetStatusAsync(int id, int statusId)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;
            existing.StatusId = statusId;
            await _repository.UpdateAsync(existing);
            return true;
        }
    }
}
