namespace PfeProject.Application.Interfaces
{
    public interface IWarehouseService
    {
        Task<IEnumerable<WarehouseReadDto>> GetAllAsync(bool? isActive = true);
        Task<WarehouseReadDto?> GetByIdAsync(int id);
        Task CreateAsync(WarehouseCreateDto dto);
        Task<bool> UpdateAsync(int id, WarehouseUpdateDto dto);
    }
}
