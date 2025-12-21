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
                Description = dto.Description,
                Type = dto.Type ?? "Picklist" // Valeur par défaut si non fourni
            };

            await _repository.AddAsync(s);

            return new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            };
        }

        // Company-aware methods
        public async Task<IEnumerable<StatusReadDto>> GetAllByCompanyAsync(int companyId)
        {
            var list = await _repository.GetAllByCompanyAsync(companyId);
            return list.Select(s => new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            });
        }

        public async Task<StatusReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var s = await _repository.GetByIdAndCompanyAsync(id, companyId);
            if (s == null) return null;

            return new StatusReadDto
            {
                Id = s.Id,
                Description = s.Description
            };
        }

        public async Task<StatusReadDto> CreateForCompanyAsync(StatusCreateDto dto, int companyId)
        {
            var s = new Status
            {
                Description = dto.Description,
                Type = dto.Type ?? "Picklist", // Valeur par défaut si non fourni
                CompanyId = companyId // 🏢 Set Company relationship
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
