using PfeProject.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Domain.Interfaces
{
    public interface IMessageRepository
    {
        Task<Message?> GetByIdAsync(int id);
        Task<Message> CreateAsync(Message message);
        Task UpdateAsync(Message message);
        Task<IReadOnlyList<Message>> GetConversationMessagesAsync(int conversationId, int companyId);
        Task MarkAsReadAsync(int messageId, int userId);
        Task<int> GetUnreadCountAsync(int userId, int companyId);
        Task<IReadOnlyList<Message>> GetUnreadMessagesAsync(int userId, int companyId);
    }
}

