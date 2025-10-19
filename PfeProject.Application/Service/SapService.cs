using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Saps;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

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


    }
}
