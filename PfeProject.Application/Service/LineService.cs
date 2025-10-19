using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Lines;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class LineService : ILineService
    {
        private readonly ILineRepository _repository;

        public LineService(ILineRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<LineReadDto>> GetAllAsync(bool? isActive = true)
        {
            var lines = await _repository.GetAllAsync(isActive);
            return lines.Select(l => new LineReadDto
            {
                Id = l.Id,
                Description = l.Description,
                IsActive = l.IsActive
            });
        }

        public async Task<LineReadDto?> GetByIdAsync(int id)
        {
            var l = await _repository.GetByIdAsync(id);
            if (l == null) return null;

            return new LineReadDto
            {
                Id = l.Id,
                Description = l.Description,
                IsActive = l.IsActive
            };
        }

        public async Task<LineCreateDto> CreateAsync(LineCreateDto dto)
        {
            var l = new Line
            {
                Description = dto.Description,
                IsActive = true
            };

            await _repository.AddAsync(l);

            return new LineCreateDto
            {
               
                Description = l.Description
            };
        }

        public async Task<bool> UpdateAsync(int id, LineUpdateDto dto)
        {
            var line = await _repository.GetByIdAsync(id);
            if (line == null) return false;

            line.Description = dto.Description;
            await _repository.UpdateAsync(line);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            return await _repository.SetActiveStatusAsync(id, isActive);
        }
    }
}
