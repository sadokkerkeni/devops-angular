using PfeProject.Application.Models.Saps;

namespace PfeProject.Application.Interfaces
{
    public interface ISapService
    {
        Task<IEnumerable<SapReadDto>> GetAllAsync(bool? isActive = true);
        Task<SapReadDto?> GetByIdAsync(int id);
        Task CreateAsync(SapCreateDto dto);
        Task<bool> UpdateAsync(int id, SapUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<bool> AddStockAsync(string usCode, int quantityToAdd);
    }
}
