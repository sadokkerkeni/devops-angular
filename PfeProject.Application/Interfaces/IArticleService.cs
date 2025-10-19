using PfeProject.Application.Models.Articles;

namespace PfeProject.Application.Interfaces
{
    public interface IArticleService
    {
        // Company-based methods
        Task<IEnumerable<ArticleReadDto>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<ArticleReadDto?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<ArticleReadDto> CreateForCompanyAsync(ArticleCreateDto dto, int companyId);
        Task<bool> UpdateForCompanyAsync(int id, ArticleUpdateDto dto, int companyId);
        Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId);
    }
}
