using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Picklists;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class PicklistService : IPicklistService
    {
        private readonly IPicklistRepository _repository;
        private readonly ISapService _sapService;
        private readonly IDetailPicklistService _detailPicklistService;

        public PicklistService(IPicklistRepository repository, ISapService sapService, IDetailPicklistService detailPicklistService)
        {
            _repository = repository;
            _sapService = sapService;
            _detailPicklistService = detailPicklistService;
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

        public async Task<bool> SetStatusAsync(int id, int statusId)
        {
            var picklist = await _repository.GetByIdAsync(id);
            if (picklist == null) return false;

            picklist.StatusId = statusId;
            await _repository.UpdateAsync(picklist);
            return true;
        }

        public async Task<IEnumerable<PicklistReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var list = await _repository.GetAllByCompanyAsync(companyId, isActive);

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

        public async Task<PicklistReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var p = await _repository.GetByIdAndCompanyAsync(id, companyId);
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

        public async Task<PicklistReadDto> CreateForCompanyAsync(PicklistCreateDto dto, int companyId)
        {
            Console.WriteLine($"[PicklistService] Création d'une picklist pour CompanyId {companyId}: Name={dto.Name}, Type={dto.Type}, Quantity={dto.Quantity}");
            
            var p = new Picklist
            {
                Name = dto.Name,
                Quantity = dto.Quantity,
                Type = dto.Type,
                LineId = dto.LineId,
                WarehouseId = dto.WarehouseId,
                StatusId = dto.StatusId,
                IsActive = true,
                CompanyId = companyId  // 🏢 Set Company relationship
            };

            await _repository.AddAsync(p);
            Console.WriteLine($"[PicklistService] ✅ Picklist créée avec succès, ID: {p.Id}");

            // Recharger la picklist avec ses relations pour obtenir le Status
            var createdPicklist = await _repository.GetByIdAndCompanyAsync(p.Id, companyId);
            if (createdPicklist == null)
            {
                Console.WriteLine($"[PicklistService] ⚠️ Erreur: Picklist ID {p.Id} non trouvée après création");
                throw new Exception($"Picklist créée mais non trouvée lors du rechargement (ID: {p.Id})");
            }

            return new PicklistReadDto
            {
                Id = createdPicklist.Id,
                Name = createdPicklist.Name,
                Quantity = createdPicklist.Quantity,
                Type = createdPicklist.Type,
                CreatedAt = createdPicklist.CreatedAt,
                LineId = createdPicklist.LineId,
                WarehouseId = createdPicklist.WarehouseId,
                Status = createdPicklist.Status == null ? null : new StatusDto
                {
                    Id = createdPicklist.Status.Id,
                    Description = createdPicklist.Status.Description
                },
                IsActive = createdPicklist.IsActive
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, PicklistUpdateDto dto, int companyId)
        {
            var existing = await _repository.GetByIdAndCompanyAsync(id, companyId);
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

        public async Task<bool> DeductStockOnCompletionAsync(int picklistId, int companyId, int userId)
        {
            Console.WriteLine($"[PicklistService] Déduction de stock pour Picklist ID {picklistId}");

            // 1. Get picklist details
            var details = await _detailPicklistService.GetByPicklistIdAndCompanyAsync(picklistId, companyId);

            if (details == null || !details.Any())
            {
                Console.WriteLine($"[PicklistService] Aucun détail trouvé pour Picklist ID {picklistId}");
                return false;
            }

            // 2. Loop through each detail and deduct stock
            foreach (var detail in details)
            {
                if (detail.Article == null || string.IsNullOrEmpty(detail.Article.CodeProduit))
                {
                    Console.WriteLine($"[PicklistService] Détail ID {detail.Id}: Article ou CodeProduit manquant");
                    continue;
                }

                var articleCode = detail.Article.CodeProduit;
                var quantityToDeduct = detail.Quantite;

                Console.WriteLine($"[PicklistService] Déduction pour Article '{articleCode}': {quantityToDeduct} unités");

                var success = await _sapService.DeductStockByArticleCodeAsync(
                    articleCode,
                    quantityToDeduct,
                    companyId,
                    userId,
                    picklistId
                );

                if (!success)
                {
                    Console.WriteLine($"[PicklistService] Échec de déduction pour Article '{articleCode}'");
                    // TODO: Consider rollback strategy if partial deduction fails
                    return false;
                }
            }

            Console.WriteLine($"[PicklistService] Déduction terminée avec succès pour Picklist ID {picklistId}");
            return true;
        }
    }
}
