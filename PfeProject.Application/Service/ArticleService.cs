using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Articles;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;

namespace PfeProject.Application.Services
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _repo;

        public ArticleService(IArticleRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<ArticleReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true)
        {
            var list = await _repo.GetAllByCompanyAsync(companyId, isActive);
            return list.Select(a => new ArticleReadDto
            {
                Id = a.Id,
                CodeProduit = a.CodeProduit,
                Designation = a.Designation,
                DateAjout = a.DateAjout,
                IsActive = a.IsActive
            });
        }

        public async Task<ArticleReadDto?> GetByIdAndCompanyAsync(int id, int companyId)
        {
            var a = await _repo.GetByIdAndCompanyAsync(id, companyId);
            if (a == null) return null;
            return new ArticleReadDto
            {
                Id = a.Id,
                CodeProduit = a.CodeProduit,
                Designation = a.Designation,
                DateAjout = a.DateAjout,
                IsActive = a.IsActive
            };
        }

        public async Task<ArticleReadDto> CreateForCompanyAsync(ArticleCreateDto dto, int companyId)
        {
            var article = new Article
            {
                CodeProduit = dto.CodeProduit,
                Designation = dto.Designation,
                IsActive = true,
                DateAjout = DateTime.UtcNow,
                CompanyId = companyId
            };
            await _repo.AddAsync(article);

            return new ArticleReadDto
            {
                Id = article.Id,
                CodeProduit = article.CodeProduit,
                Designation = article.Designation,
                DateAjout = article.DateAjout,
                IsActive = article.IsActive
            };
        }

        public async Task<bool> UpdateForCompanyAsync(int id, ArticleUpdateDto dto, int companyId)
        {
            var article = await _repo.GetByIdAndCompanyAsync(id, companyId);
            if (article == null) return false;

            article.CodeProduit = dto.CodeProduit;
            article.Designation = dto.Designation;
            await _repo.UpdateAsync(article);
            return true;
        }

        public async Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId)
        {
            return await _repo.SetActiveStatusForCompanyAsync(id, isActive, companyId);
        }
    }
}
