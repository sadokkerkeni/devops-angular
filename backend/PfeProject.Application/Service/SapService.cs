using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Saps;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Linq;
using System;

namespace PfeProject.Application.Services
{
    public class SapService : ISapService
    {
        private readonly ISapRepository _repository;

        public SapService(ISapRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SapReadDto>> GetAllAsync(bool? isActive = true)
        {
            var saps = await _repository.GetAllAsync(isActive);
            return saps.Select(s => new SapReadDto
            {
                Id = s.Id,
                Article = s.Article,
                UsCode = s.UsCode,
                Quantite = s.Quantite,
                IsActive = s.IsActive
            });
        }

        public async Task<SapReadDto?> GetByIdAsync(int id)
        {
            var sap = await _repository.GetByIdAsync(id);
            if (sap == null)
                return null;

            return new SapReadDto
            {
                Id = sap.Id,
                Article = sap.Article,
                UsCode = sap.UsCode,
                Quantite = sap.Quantite,
                IsActive = sap.IsActive
            };
        }

        public async Task CreateAsync(SapCreateDto dto)
        {
            var sap = new Sap
            {
                Article = dto.Article,
                UsCode = dto.UsCode,
                Quantite = dto.Quantite,
                IsActive = true
            };

            await _repository.AddAsync(sap);
        }

        public async Task<bool> UpdateAsync(int id, SapUpdateDto dto)
        {
            var sap = await _repository.GetByIdAsync(id);
            if (sap == null)
                return false;

            sap.Article = dto.Article;
            sap.UsCode = dto.UsCode;
            sap.Quantite = dto.Quantite;

            await _repository.UpdateAsync(sap);
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

        public async Task<bool> AddStockAsync(string usCode, int quantityToAdd)
        {
            Console.WriteLine($"[SapService] Tentative d'ajout de stock pour US '{usCode}'. Quantité à ajouter: {quantityToAdd}");

            // 1. Récupérer l'enregistrement SAP par UsCode
            var sapEntity = await _repository.GetByUsCodeAsync(usCode);

            // 2. Vérifier si l'enregistrement existe
            if (sapEntity == null)
            {
                Console.WriteLine($"[SapService] Enregistrement SAP avec US '{usCode}' non trouvé.");
                return false; // Retourner false pour indiquer l'échec
            }

            // 3. Mettre à jour la quantité
            // On peut accéder directement à Quantite, car c'est un int
            int currentQuantity = sapEntity.Quantite; // Récupérer la quantité actuelle
            int newQuantity = currentQuantity + quantityToAdd;

            // S'assurer que la nouvelle quantité n'est pas négative (optionnel)
            if (newQuantity < 0) newQuantity = 0;

            sapEntity.Quantite = newQuantity; // Mettre à jour la quantité directement

            Console.WriteLine($"[SapService] Quantité mise à jour pour US '{usCode}': {currentQuantity} + {quantityToAdd} = {newQuantity}");

            // 4. Sauvegarder les modifications via le repository
            try
            {
                await _repository.UpdateAsync(sapEntity); // Utiliser la méthode existante
                Console.WriteLine($"[SapService] Stock mis à jour avec succès pour US '{usCode}'.");
                return true; // Succès
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[SapService] Erreur lors de la mise à jour du stock pour US '{usCode}': {ex.Message}");
                return false; // Échec
            }
        }

        // Company-aware methods
        public async Task<IEnumerable<SapReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var saps = await _repository.GetAllByCompanyAsync(companyId, isActive);
            return saps.Select(s => new SapReadDto
            {
                Id = s.Id,
                Article = s.Article,
                UsCode = s.UsCode,
                Quantite = s.Quantite,
                IsActive = s.IsActive
            });
        }

        public async Task<SapReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var sap = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (sap == null)
                return null;

            return new SapReadDto
            {
                Id = sap.Id,
                Article = sap.Article,
                UsCode = sap.UsCode,
                Quantite = sap.Quantite,
                IsActive = sap.IsActive
            };
        }

        public async Task<SapReadDto> CreateForCompanyAsync(SapCreateDto dto, int companyId)
        {
            var sap = new Sap
            {
                Article = dto.Article,
                UsCode = dto.UsCode,
                Quantite = dto.Quantite,
                IsActive = true,
                CompanyId = companyId
            };

            await _repository.AddAsync(sap);

            return new SapReadDto
            {
                Id = sap.Id,
                Article = sap.Article,
                UsCode = sap.UsCode,
                Quantite = sap.Quantite,
                IsActive = sap.IsActive
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, SapUpdateDto dto, int companyId)
        {
            var sap = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (sap == null)
                return false;

            sap.Article = dto.Article;
            sap.UsCode = dto.UsCode;
            sap.Quantite = dto.Quantite;

            await _repository.UpdateAsync(sap);
            return true;
        }

        public async Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId)
        {
            var exists = await _repository.ExistsByIdAndCompanyAsync(id, companyId);
            if (!exists)
                return false;

            await _repository.SetActiveStatusAsync(id, isActive);
            return true;
        }

        public async Task<bool> DeleteForCompanyAsync(int id, int companyId)
        {
            var exists = await _repository.ExistsByIdAndCompanyAsync(id, companyId);
            if (!exists)
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        public async Task<bool> AddStockForCompanyAsync(string usCode, int quantityToAdd, int companyId)
        {
            Console.WriteLine($"[SapService] Tentative d'ajout de stock pour Article/UsCode '{usCode}' dans l'entreprise {companyId}. Quantité à ajouter: {quantityToAdd}");

            // Get all SAP entries for the company
            var allSaps = await _repository.GetAllByCompanyAsync(companyId, true);

            // Try matching by UsCode first, then by Article (product code)
            var matchingSaps = allSaps.Where(s => s.UsCode == usCode || s.Article == usCode).ToList();

            if (!matchingSaps.Any())
            {
                Console.WriteLine($"[SapService] Enregistrement SAP avec UsCode ou Article '{usCode}' non trouvé pour l'entreprise {companyId}.");
                Console.WriteLine($"[SapService] SAP entries disponibles pour cette entreprise: {string.Join(", ", allSaps.Select(s => $"Article={s.Article}, UsCode={s.UsCode}"))}");
                return false;
            }

            // Update all matching SAP entries
            foreach (var sap in matchingSaps)
            {
                int currentQuantity = sap.Quantite;
                int newQuantity = currentQuantity + quantityToAdd;
                if (newQuantity < 0) newQuantity = 0;

                sap.Quantite = newQuantity;
                await _repository.UpdateAsync(sap);
                Console.WriteLine($"[SapService] Quantité mise à jour pour SAP ID {sap.Id} (Article='{sap.Article}', UsCode='{sap.UsCode}'): {currentQuantity} + {quantityToAdd} = {newQuantity}");
            }

            return true;
        }

        public async Task<bool> DeductStockByArticleCodeAsync(string articleCode, int quantityToDeduct, int companyId, int userId, int picklistId)
        {
            Console.WriteLine($"[SapService] Déduction de stock pour UsCode '{articleCode}' dans l'entreprise {companyId}. Quantité à déduire: {quantityToDeduct}");

            // Get all SAP entries for the company
            var allSaps = await _repository.GetAllByCompanyAsync(companyId, true);

            // ✅ FIXED: Find SAP entries matching the UsCode (case-insensitive, trimmed)
            var normalizedCode = articleCode?.Trim().ToLowerInvariant() ?? "";
            var matchingSaps = allSaps.Where(s => 
                !string.IsNullOrEmpty(s.UsCode) && 
                s.UsCode.Trim().ToLowerInvariant() == normalizedCode).ToList();

            if (!matchingSaps.Any())
            {
                Console.WriteLine($"[SapService] Aucune entrée SAP trouvée avec UsCode '{articleCode}' pour l'entreprise {companyId}.");
                return false;
            }

            // Calculate total available quantity
            int totalAvailable = matchingSaps.Sum(s => s.Quantite);

            if (totalAvailable < quantityToDeduct)
            {
                Console.WriteLine($"[SapService] Stock insuffisant. Disponible: {totalAvailable}, Demandé: {quantityToDeduct}");
                return false;
            }

            // Deduct from SAP entries (FIFO - first in, first out)
            int remainingToDeduct = quantityToDeduct;
            foreach (var sap in matchingSaps.OrderBy(s => s.Id)) // FIFO by ID
            {
                if (remainingToDeduct <= 0) break;

                int quantityBefore = sap.Quantite;
                int deductFromThis = Math.Min(sap.Quantite, remainingToDeduct);
                int quantityAfter = sap.Quantite - deductFromThis;

                sap.Quantite = quantityAfter;
                await _repository.UpdateAsync(sap);

                Console.WriteLine($"[SapService] SAP ID {sap.Id}: {quantityBefore} → {quantityAfter} (déduction: {deductFromThis})");

                // TODO: Create StockMovement record here when StockMovementService is added

                remainingToDeduct -= deductFromThis;
            }

            Console.WriteLine($"[SapService] Déduction terminée avec succès pour UsCode '{articleCode}'.");
            return true;
        }
    }
}
