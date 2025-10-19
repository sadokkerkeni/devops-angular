using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.ReturnLines;
using PfeProject.Application.Service;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Repositories;

namespace PfeProject.Application.Services
{
    public class MovementTraceService : IMovementTraceService
    {
        private readonly IMovementTraceRepository _repository;
        private readonly IReturnLineService _returnLineService; // Injecter le service ReturnLine
        private readonly ISapService _sapService;

        public MovementTraceService(IMovementTraceRepository repository, IReturnLineService returnservice,ISapService sapservice)
        {
            _repository = repository;
            _returnLineService = returnservice;
            _sapService = sapservice;
        }

        public async Task<IEnumerable<MovementTraceReadDto>> GetAllAsync(bool? isActive = true)
        {
            var list = await _repository.GetAllAsync(isActive);
            return list.Select(mt => new MovementTraceReadDto
            {
                Id = mt.Id,
                UsNom = mt.UsNom,
                Quantite = mt.Quantite,
                DateMouvement = mt.DateMouvement,
                UserId = mt.UserId,
                DetailPicklistId = mt.DetailPicklistId,
                DetailPicklistEmplacement = mt.DetailPicklist?.Emplacement,
                UserName= mt.User.FirstName + " " + mt.User.LastName,
                ArticleId = mt.DetailPicklist?.ArticleId ?? 0,
                IsActive = mt.IsActive
            });
        }

        public async Task<MovementTraceReadDto?> GetByIdAsync(int id)
        {
            var mt = await _repository.GetByIdAsync(id);
            if (mt == null) return null;

            return new MovementTraceReadDto
            {
                Id = mt.Id,
                UsNom = mt.UsNom,
                Quantite = mt.Quantite,
                DateMouvement = mt.DateMouvement,
                UserId = mt.UserId,
                DetailPicklistId = mt.DetailPicklistId,
                ArticleId = mt.DetailPicklist?.ArticleId ?? 0,
                IsActive = mt.IsActive
            };
        }

        public async Task<MovementTraceReadDto> CreateAsync(MovementTraceCreateDto dto)
        {
            var mt = new MovementTrace
            {
                UsNom = dto.UsNom,
                Quantite = dto.Quantite,
                UserId = dto.UserId,
                DetailPicklistId = dto.DetailPicklistId,

                IsActive = true
            };

            await _repository.AddAsync(mt);

            return new MovementTraceReadDto
            {
                Id = mt.Id,
                UsNom = mt.UsNom,
                Quantite = mt.Quantite,
                DateMouvement = mt.DateMouvement,
                UserId = mt.UserId,
                DetailPicklistId = mt.DetailPicklistId,
                ArticleId = mt.DetailPicklist?.ArticleId ?? 0,
                IsActive = mt.IsActive
            };
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            return await _repository.SetActiveStatusAsync(id, isActive);
        }

        public async Task<ReturnLineReadDto?> CreateReturnLineAndAddStockAsync(int movementTraceId, int userId)
        {
            Console.WriteLine($"[MovementTraceService] Création de ReturnLine et ajout de stock pour MovementTrace ID {movementTraceId} par l'utilisateur ID {userId}.");

            // 1. Récupérer le MovementTrace avec ses relations (DetailPicklist, Article)
            var movementTrace = await _repository.GetByIdAsync(movementTraceId);
            if (movementTrace == null)
            {
                Console.WriteLine($"[MovementTraceService] MovementTrace ID {movementTraceId} non trouvé.");
                return null;
            }

            // 2. Vérifier si DetailPicklist et Article sont chargés
            if (movementTrace.DetailPicklist == null)
            {
                Console.WriteLine($"[MovementTraceService] DetailPicklist non chargé pour MovementTrace ID {movementTraceId}.");
                // Vous pouvez choisir de charger séparément ou de retourner null
                // Pour cet exemple, on continue mais avec prudence
            }

            var articleId = movementTrace.DetailPicklist?.ArticleId ?? 0;
            if (articleId <= 0)
            {
                Console.WriteLine($"[MovementTraceService] ArticleId invalide pour MovementTrace ID {movementTraceId}.");
                return null;
            }

            // 3. Créer le ReturnLineCreateDto
            var returnLineCreateDto = new ReturnLineCreateDto
            {
                UsCode = movementTrace.UsNom ?? $"TRACE-{movementTraceId}",
                Quantite = movementTrace.Quantite ?? "1",
                ArticleId = articleId,
                UserId = userId, // ID de l'utilisateur passé en paramètre
                StatusId = 1 // Statut initial, ex: 1 = "En Attente"
            };

            // 4. Créer le ReturnLine via le ReturnLineService
            Console.WriteLine($"[MovementTraceService] Appel de ReturnLineService.CreateAsync avec DTO: {returnLineCreateDto}");
            var createdReturnLine = await _returnLineService.CreateAsync(returnLineCreateDto);
            if (createdReturnLine == null)
            {
                Console.WriteLine($"[MovementTraceService] Échec de la création du ReturnLine pour MovementTrace ID {movementTraceId}.");
                return null;
            }
            Console.WriteLine($"[MovementTraceService] ReturnLine ID {createdReturnLine.Id} créé avec succès.");

            // 5. Mettre à jour le stock SAP
            // Convertir la quantité en int (avec gestion d'erreur)
            int quantityToAdd = 1; // Valeur par défaut
            if (!string.IsNullOrWhiteSpace(movementTrace.Quantite) && !int.TryParse(movementTrace.Quantite, out quantityToAdd))
            {
                Console.WriteLine($"[MovementTraceService] Conversion de Quantite '{movementTrace.Quantite}' en int échouée pour MovementTrace ID {movementTraceId}. Utilisation de 1 par défaut.");
                quantityToAdd = 1;
            }

            Console.WriteLine($"[MovementTraceService] Appel de SapService.AddStockAsync pour US '{movementTrace.UsNom}' avec quantité {quantityToAdd}.");
            var stockUpdated = await _sapService.AddStockAsync(movementTrace.UsNom, quantityToAdd);
            if (!stockUpdated)
            {
                Console.WriteLine($"[MovementTraceService] Échec de la mise à jour du stock SAP pour US '{movementTrace.UsNom}'.");
                // Optionnel : Décider si on annule la création du ReturnLine ou si on la laisse
                // Pour l'instant, on retourne le ReturnLine créé mais avec un avertissement
                // Vous pouvez choisir de lever une exception ou de retourner null ici
                Console.WriteLine($"[MovementTraceService] ATTENTION : ReturnLine créé mais stock non mis à jour.");
            }
            else
            {
                Console.WriteLine($"[MovementTraceService] Stock SAP mis à jour avec succès pour US '{movementTrace.UsNom}'.");
            }

            // 6. Retourner le ReturnLineReadDto créé
            return createdReturnLine;
        }
    }
}
