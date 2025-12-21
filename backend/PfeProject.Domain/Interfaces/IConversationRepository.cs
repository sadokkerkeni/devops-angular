using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByIdAsync(int id);
        Task<Conversation?> GetByUsersAsync(int user1Id, int user2Id, int companyId);
        Task<Conversation> CreateAsync(Conversation conversation);
        Task UpdateAsync(Conversation conversation);
        Task<IReadOnlyList<Conversation>> GetUserConversationsAsync(int userId, int companyId);
        Task<Conversation?> GetByIdAndCompanyAsync(int id, int companyId);
    }
}

