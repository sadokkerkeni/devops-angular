using PfeProject.Application.Interfaces;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class DetailPicklistService : IDetailPicklistService
    {
        private readonly IDetailPicklistRepository _repository;

        public DetailPicklistService(IDetailPicklistRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<DetailPicklistReadDto>> GetAllAsync(bool? isActive = true)
        {
            var list = await _repository.GetAllAsync(isActive);
            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,
               
                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation
                },

                Status = d.Status == null ? null : new StatusDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            });
        }

        public async Task<DetailPicklistReadDto?> GetByIdAsync(int id)
        {
            var d = await _repository.GetByIdAsync(id);
            if (d == null) return null;

            return new DetailPicklistReadDto
            {
                Id = d.Id,
               
                PicklistId = d.PicklistId,
                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation
                },

                Status = d.Status == null ? null : new StatusDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description
                },
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive
            };
        }

        public async Task<DetailPicklistReadDto> CreateAsync(DetailPicklistCreateDto dto)
        {
            var entity = new DetailPicklist
            {
                ArticleId = dto.ArticleId,
                PicklistId = dto.PicklistId,
                StatusId = dto.StatusId,
                Emplacement = dto.Emplacement,
                Quantite = dto.Quantite,
                IsActive = true
            };

            await _repository.AddAsync(entity);

            return new DetailPicklistReadDto
            {
                Id = entity.Id,
                
                PicklistId = entity.PicklistId,
                Article = entity.Article == null ? null : new ArticleDto
                {
                    Id = entity.Article.Id,
                    Designation = entity.Article.Designation
                },

                Status = entity.Status == null ? null : new StatusDto
                {
                    Id = entity.Status.Id,
                    Description = entity.Status.Description
                },
                Emplacement = entity.Emplacement,
                Quantite = entity.Quantite,
                IsActive = entity.IsActive
            };
        }

        public async Task<bool> UpdateAsync(int id, DetailPicklistUpdateDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.Emplacement = dto.Emplacement;
            entity.Quantite = dto.Quantite;
            entity.StatusId = dto.StatusId;

            await _repository.UpdateAsync(entity);
            return true;
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            var exists = await _repository.ExistsAsync(id);
            if (!exists) return false;

            if (isActive)
                return await _repository.ActivateAsync(id);
            else
                return await _repository.DeactivateAsync(id);
        }
        public async Task<IEnumerable<DetailPicklistReadDto>> GetByPicklistIdAsync(int picklistId)
        {
            var list = await _repository.GetByPicklistIdAsync(picklistId);

            return list.Select(d => new DetailPicklistReadDto
            {
                Id = d.Id,
                PicklistId = d.PicklistId,
                Emplacement = d.Emplacement,
                Quantite = d.Quantite,
                IsActive = d.IsActive,

                Article = d.Article == null ? null : new ArticleDto
                {
                    Id = d.Article.Id,
                    Designation = d.Article.Designation,
                    CodeProduit = d.Article.CodeProduit
                },

                Status = d.Status == null ? null : new StatusDto
                {
                    Id = d.Status.Id,
                    Description = d.Status.Description
                }
            });
        }


    }
}
