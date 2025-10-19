using PfeProject.Application.Models.ReturnLines;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IReturnLineService
    {
        Task<ReturnLineReadDto> CreateAsync(ReturnLineCreateDto dto);
        Task<IEnumerable<ReturnLineReadDto>> GetAllAsync();
        Task<ReturnLineReadDto> GetByIdAsync(int id);
        Task<bool> UpdateAsync(int id, ReturnLineUpdateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
