using PfeProject.Domain.Entities;

namespace PfeProject.Domain.Interfaces
{
    public interface IArticleRepository
    {
        Task<IEnumerable<Article>> GetAllAsync(bool? isActive = true);
        Task<Article?> GetByIdAsync(int id);
        Task AddAsync(Article article);
        Task UpdateAsync(Article article);
        Task<bool> ExistsAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);

        // Company-based methods
        Task<IEnumerable<Article>> GetAllByCompanyAsync(int companyId, bool? isActive = true);
        Task<Article?> GetByIdAndCompanyAsync(int id, int companyId);
        Task<bool> SetActiveStatusForCompanyAsync(int id, bool isActive, int companyId);
    }
}
