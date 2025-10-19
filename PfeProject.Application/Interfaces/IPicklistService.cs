using PfeProject.Application.Models.Picklists;

namespace PfeProject.Application.Interfaces
{
    public interface IPicklistService
    {
        Task<IEnumerable<PicklistReadDto>> GetAllAsync(bool? isActive = true);
        Task<PicklistReadDto?> GetByIdAsync(int id);
        Task<PicklistReadDto> CreateAsync(PicklistCreateDto dto);
        Task<bool> UpdateAsync(int id, PicklistUpdateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<bool> SetStatusAsync(int id, int statusId);
    }
}
