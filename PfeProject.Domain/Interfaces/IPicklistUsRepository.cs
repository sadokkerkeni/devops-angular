using PfeProject.Domain.Entities;

public interface IPicklistUsRepository
{
    Task<IEnumerable<PicklistUs>> GetFilteredAsync(int? statusId, int? userId, int? detailPicklistId, bool? isActive, string? nom);
    Task<PicklistUs?> GetByIdAsync(int id);
    Task<PicklistUs> AddAsync(PicklistUs entity);
    Task UpdateAsync(PicklistUs entity);
    Task<bool> DeactivateAsync(int id);
    Task<bool> ActivateAsync(int id);
}
