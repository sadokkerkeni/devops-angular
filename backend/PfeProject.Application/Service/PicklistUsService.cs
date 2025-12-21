using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.PicklistUSs;
using PfeProject.Application.Models.MovementTraces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

public class PicklistUsService : IPicklistUsService
{
    private readonly IPicklistUsRepository _repository;
    private readonly IMovementTraceService _movementTraceService;
    private readonly IDetailPicklistRepository _detailPicklistRepository;

    public PicklistUsService(
        IPicklistUsRepository repository,
        IMovementTraceService movementTraceService,
        IDetailPicklistRepository detailPicklistRepository)
    {
        _repository = repository;
        _movementTraceService = movementTraceService;
        _detailPicklistRepository = detailPicklistRepository;
    }

    public async Task<IEnumerable<PicklistUsReadDto>> GetFilteredAsync(PicklistUsFilterDto filter)
    {
        var list = await _repository.GetFilteredAsync(
            filter.StatusId,
            filter.UserId,
            filter.DetailPicklistId,
            filter.IsActive,
            filter.Nom
        );

        return list.Select(MapToReadDto);
    }

    public async Task<PicklistUsReadDto?> GetByIdAsync(int id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity is null ? null : MapToReadDto(entity);
    }

    public async Task<PicklistUsReadDto> CreateAsync(PicklistUsCreateDto dto)
    {
        var entity = new PicklistUs
        {
            Nom = dto.Nom,
            Quantite = dto.Quantite,
            UserId = dto.UserId,
            DetailPicklistId = dto.DetailPicklistId,
            StatusId = dto.StatusId,
            Date = DateTime.UtcNow, // ✅ Fix: Use UTC for PostgreSQL
            IsActive = true
        };

        var created = await _repository.AddAsync(entity);
        return MapToReadDto(created);
    }

    public async Task<bool> UpdateAsync(int id, PicklistUsUpdateDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null || !entity.IsActive) return false;

        entity.Nom = dto.Nom;
        entity.Quantite = dto.Quantite;
        entity.UserId = dto.UserId;
        entity.DetailPicklistId = dto.DetailPicklistId;
        entity.StatusId = dto.StatusId;

        await _repository.UpdateAsync(entity);
        return true;
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        return await _repository.DeactivateAsync(id);
    }

    public async Task<bool> ActivateAsync(int id)
    {
        return await _repository.ActivateAsync(id);
    }

    private PicklistUsReadDto MapToReadDto(PicklistUs entity)
    {
        return new PicklistUsReadDto
        {
            Id = entity.Id,
            Nom = entity.Nom,
            Quantite = entity.Quantite,
            Date = entity.Date,
            UserId = entity.UserId,
            UserFullName = $"{entity.User?.FirstName} {entity.User?.LastName}", // ✅ Corrigé ici
            DetailPicklistId = entity.DetailPicklistId,
            StatusId = entity.StatusId,
            StatusLabel = entity.Status?.Description ?? string.Empty,
            IsActive = entity.IsActive
        };
    }

    // Company-aware methods
    public async Task<IEnumerable<PicklistUsReadDto>> GetFilteredByCompanyAsync(PicklistUsFilterDto filter, int companyId)
    {
        var list = await _repository.GetFilteredByCompanyAsync(
            filter.StatusId,
            filter.UserId,
            filter.DetailPicklistId,
            filter.IsActive,
            filter.Nom,
            companyId
        );

        return list.Select(MapToReadDto);
    }

    public async Task<PicklistUsReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
    {
        var entity = await _repository.GetByIdAndCompanyAsync(id, companyId);
        return entity is null ? null : MapToReadDto(entity);
    }

    public async Task<PicklistUsReadDto> CreateForCompanyAsync(PicklistUsCreateDto dto, int companyId)
    {
        Console.WriteLine($"[PicklistUsService] Création d'un PicklistUs pour CompanyId {companyId}: Nom={dto.Nom}, DetailPicklistId={dto.DetailPicklistId}, UserId={dto.UserId}");
        
        var entity = new PicklistUs
        {
            Nom = dto.Nom,
            Quantite = dto.Quantite,
            UserId = dto.UserId,
            DetailPicklistId = dto.DetailPicklistId,
            StatusId = dto.StatusId,
            Date = DateTime.UtcNow, // ✅ Fix: Use UTC for PostgreSQL
            IsActive = true,
            CompanyId = companyId // 🏢 Set Company relationship
        };

        var created = await _repository.AddAsync(entity);
        Console.WriteLine($"[PicklistUsService] ✅ PicklistUs créé avec succès, ID: {created.Id}");

        // 🔄 AUTOMATISATION : Créer automatiquement un MovementTrace lors du scan (création d'un PicklistUs)
        try
        {
            Console.WriteLine($"[PicklistUsService] Tentative de création automatique du MovementTrace pour PicklistUs ID {created.Id}");
            await CreateMovementTraceAutomatically(created, companyId);
        }
        catch (Exception ex)
        {
            // Log l'erreur mais ne bloque pas la création du PicklistUs
            Console.WriteLine($"[PicklistUsService] ❌ Erreur lors de la création automatique du MovementTrace: {ex.Message}");
            Console.WriteLine($"[PicklistUsService] StackTrace: {ex.StackTrace}");
        }

        return MapToReadDto(created);
    }

    /// <summary>
    /// Crée automatiquement un MovementTrace lors de la création d'un PicklistUs (scan d'article)
    /// </summary>
    private async Task CreateMovementTraceAutomatically(PicklistUs picklistUs, int companyId)
    {
        Console.WriteLine($"[PicklistUsService] CreateMovementTraceAutomatically: PicklistUs ID={picklistUs.Id}, DetailPicklistId={picklistUs.DetailPicklistId}, CompanyId={companyId}");
        
        // Récupérer le DetailPicklist avec l'Article pour obtenir le code produit
        var detailPicklist = await _detailPicklistRepository.GetByIdAsync(picklistUs.DetailPicklistId);
        if (detailPicklist == null)
        {
            Console.WriteLine($"[PicklistUsService] ❌ DetailPicklist {picklistUs.DetailPicklistId} non trouvé pour créer le MovementTrace");
            return;
        }

        Console.WriteLine($"[PicklistUsService] DetailPicklist trouvé: ID={detailPicklist.Id}, ArticleId={detailPicklist.ArticleId}, Article={(detailPicklist.Article != null ? detailPicklist.Article.CodeProduit : "null")}");

        // Utiliser le Nom du PicklistUs comme UsNom, ou le code produit de l'article
        var usNom = picklistUs.Nom;
        if (string.IsNullOrEmpty(usNom) && detailPicklist.Article != null)
        {
            usNom = detailPicklist.Article.CodeProduit ?? $"US-{picklistUs.Id}";
            Console.WriteLine($"[PicklistUsService] UsNom déterminé depuis Article.CodeProduit: {usNom}");
        }
        else if (string.IsNullOrEmpty(usNom))
        {
            usNom = $"US-{picklistUs.Id}";
            Console.WriteLine($"[PicklistUsService] UsNom généré par défaut: {usNom}");
        }
        else
        {
            Console.WriteLine($"[PicklistUsService] UsNom utilisé depuis PicklistUs.Nom: {usNom}");
        }

        var quantite = int.TryParse(picklistUs.Quantite, out int qty) ? qty : 1;
        Console.WriteLine($"[PicklistUsService] Quantité parsée: {quantite} (original: {picklistUs.Quantite})");

        var movementTraceDto = new MovementTraceCreateDto
        {
            UsNom = usNom,
            Quantite = quantite,
            UserId = picklistUs.UserId,
            DetailPicklistId = picklistUs.DetailPicklistId
        };

        Console.WriteLine($"[PicklistUsService] Création du MovementTrace avec: UsNom={movementTraceDto.UsNom}, Quantite={movementTraceDto.Quantite}, UserId={movementTraceDto.UserId}, DetailPicklistId={movementTraceDto.DetailPicklistId}");
        
        try
        {
            var createdMovementTrace = await _movementTraceService.CreateForCompanyAsync(movementTraceDto, companyId);
            Console.WriteLine($"[PicklistUsService] ✅ MovementTrace créé automatiquement avec succès! ID: {createdMovementTrace.Id}, UsNom: {usNom}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[PicklistUsService] ❌ Exception lors de la création du MovementTrace: {ex.Message}");
            Console.WriteLine($"[PicklistUsService] StackTrace: {ex.StackTrace}");
            throw; // Re-throw pour que l'appelant puisse gérer l'erreur
        }
    }

    public async Task<bool> UpdateForCompanyAsync(int id, PicklistUsUpdateDto dto, int companyId)
    {
        var entity = await _repository.GetByIdAndCompanyAsync(id, companyId);
        if (entity == null || !entity.IsActive) return false;

        entity.Nom = dto.Nom;
        entity.Quantite = dto.Quantite;
        entity.UserId = dto.UserId;
        entity.DetailPicklistId = dto.DetailPicklistId;
        entity.StatusId = dto.StatusId;

        await _repository.UpdateAsync(entity);
        return true;
    }
}
