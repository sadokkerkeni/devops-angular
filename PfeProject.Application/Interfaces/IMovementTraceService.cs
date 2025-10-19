
using PfeProject.Application.Models.ReturnLines;

namespace PfeProject.Application.Interfaces
{
    public interface IMovementTraceService
    {
        Task<IEnumerable<MovementTraceReadDto>> GetAllAsync(bool? isActive = true);
        Task<MovementTraceReadDto?> GetByIdAsync(int id);
        Task<MovementTraceReadDto> CreateAsync(MovementTraceCreateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<ReturnLineReadDto?> CreateReturnLineAndAddStockAsync(int movementTraceId, int userId);
    }
}
