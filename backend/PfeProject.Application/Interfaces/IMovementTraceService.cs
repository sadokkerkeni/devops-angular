
using PfeProject.Application.Models.MovementTraces;
using PfeProject.Application.Models.ReturnLines;

namespace PfeProject.Application.Interfaces
{
    public interface IMovementTraceService
    {
        // Legacy methods
        Task<IEnumerable<MovementTraceReadDto>> GetAllAsync(bool? isActive = true);
        Task<MovementTraceReadDto?> GetByIdAsync(int id);
        Task<MovementTraceReadDto> CreateAsync(MovementTraceCreateDto dto);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<ReturnLineReadDto?> CreateReturnLineAndAddStockAsync(int movementTraceId, int userId);

        // Company-aware methods
        Task<IEnumerable<MovementTraceReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<MovementTraceReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<MovementTraceReadDto> CreateForCompanyAsync(MovementTraceCreateDto dto, int companyId);
        Task<ReturnLineReadDto?> CreateReturnLineAndAddStockForCompanyAsync(int movementTraceId, int userId, int companyId);
    }
}
