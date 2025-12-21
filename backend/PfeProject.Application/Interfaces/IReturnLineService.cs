using PfeProject.Application.Models.ReturnLines;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IReturnLineService
    {
        // Legacy methods
        Task<ReturnLineReadDto> CreateAsync(ReturnLineCreateDto dto);
        Task<IEnumerable<ReturnLineReadDto>> GetAllAsync();
        Task<ReturnLineReadDto?> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, ReturnLineUpdateDto dto);
        Task<bool> DeleteAsync(int id);

        // Company-aware methods
        Task<ReturnLineReadDto> CreateForCompanyAsync(ReturnLineCreateDto dto, int companyId);
        Task<IEnumerable<ReturnLineReadDto>> GetAllByCompanyAsync(int companyId);
        Task<IEnumerable<ReturnLineReadDto>> GetInProgressByCompanyAsync(int companyId); // 🔄 Filter by status != 'Terminé'
        Task<ReturnLineReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, ReturnLineUpdateDto dto, int companyId);
    }
}
