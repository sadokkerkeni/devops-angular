using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

public class PicklistUsService : IPicklistUsService
{
    private readonly IPicklistUsRepository _repository;

    public PicklistUsService(IPicklistUsRepository repository)
    {
        _repository = repository;
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
            Date = DateTime.Now,
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
            StatusLabel = entity.Status?.Description,
            IsActive = entity.IsActive
        };
    }
}
