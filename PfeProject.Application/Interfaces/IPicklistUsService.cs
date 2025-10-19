
public interface IPicklistUsService
{
    Task<IEnumerable<PicklistUsReadDto>> GetFilteredAsync(PicklistUsFilterDto filter);
    Task<PicklistUsReadDto?> GetByIdAsync(int id);
    Task<PicklistUsReadDto> CreateAsync(PicklistUsCreateDto dto);
    Task<bool> UpdateAsync(int id, PicklistUsUpdateDto dto);
    Task<bool> DeactivateAsync(int id);
    Task<bool> ActivateAsync(int id);
}
