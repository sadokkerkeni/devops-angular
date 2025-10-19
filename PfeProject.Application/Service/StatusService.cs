using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Statuses;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class StatusService : IStatusService
    {
        private readonly IStatusRepository _repository;

        public StatusService(IStatusRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<StatusReadDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(s => new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            });
        }

        public async Task<StatusReadDto?> GetByIdAsync(int id)
        {
            var s = await _repository.GetByIdAsync(id);
            if (s == null) return null;

            return new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            };
        }

        public async Task<StatusReadDto> CreateAsync(StatusCreateDto dto)
        {
            var s = new Status
            {
                Description = dto.Description
            };

            await _repository.AddAsync(s);

            return new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            };
        }
    }
}
