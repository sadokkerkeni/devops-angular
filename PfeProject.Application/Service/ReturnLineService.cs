using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.ReturnLines;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Application.Service
{
    public class ReturnLineService : IReturnLineService
    {
        private readonly IReturnLineRepository _repository;

        public ReturnLineService(IReturnLineRepository repository)
        {
            _repository = repository;
        }

        public async Task<ReturnLineReadDto> CreateAsync(ReturnLineCreateDto createDto)
        {
            var returnLine = new ReturnLine
            {
                UsCode = createDto.UsCode,
                Quantite = createDto.Quantite,
                UserId = createDto.UserId,
                ArticleId = createDto.ArticleId,
                StatusId = createDto.StatusId
            };

            var added = await _repository.CreateAsync(returnLine); // use CreateAsync

            return new ReturnLineReadDto
            {
                Id = added.Id,
                UsCode = added.UsCode,
                Quantite = added.Quantite,
                DateRetour = added.DateRetour,
                ArticleId = added.ArticleId,
                StatusId = added.StatusId,
                UserId = added.UserId
            };
        }

        public async Task<IEnumerable<ReturnLineReadDto>> GetAllAsync()
        {
            var results = await _repository.GetAllAsync();

            return results.Select(r => new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                ArticleCode = r.Article.CodeProduit,
                StatusId = r.StatusId,
                StatusName=r.Status.Description,
                UserId = r.UserId,
                UserName = r.User.FirstName + " " + r.User.LastName
            });
        }

        public async Task<ReturnLineReadDto> GetByIdAsync(int id)
        {
            var r = await _repository.GetByIdAsync(id);
            if (r == null) return null;

            return new ReturnLineReadDto
            {
                Id = r.Id,
                UsCode = r.UsCode,
                Quantite = r.Quantite,
                DateRetour = r.DateRetour,
                ArticleId = r.ArticleId,
                StatusId = r.StatusId,
                UserId = r.UserId
            };
        }

        public async Task<bool> UpdateAsync(int id, ReturnLineUpdateDto updateDto)
        {
            var returnLine = await _repository.GetByIdAsync(id);
            if (returnLine == null) return false;

            returnLine.UsCode = updateDto.UsCode;
            returnLine.Quantite = updateDto.Quantite;
            if (updateDto.ArticleId.HasValue)
                returnLine.ArticleId = updateDto.ArticleId.Value;
            if (updateDto.StatusId.HasValue)
                returnLine.StatusId = updateDto.StatusId.Value;

            return await _repository.UpdateAsync(returnLine);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
