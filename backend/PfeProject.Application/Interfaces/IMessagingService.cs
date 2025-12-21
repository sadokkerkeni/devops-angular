using PfeProject.Application.Models.Messages;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PfeProject.Application.Interfaces
{
    public interface IMessagingService
    {
        Task<ConversationReadDto> GetOrCreateConversationAsync(int userId, int otherUserId, int companyId);
        Task<IEnumerable<ConversationReadDto>> GetUserConversationsAsync(int userId, int companyId);
        Task<ConversationReadDto?> GetConversationByIdAsync(int conversationId, int userId, int companyId);
        Task<MessageReadDto> SendMessageAsync(MessageCreateDto dto, int senderId, int companyId);
        Task<IEnumerable<MessageReadDto>> GetConversationMessagesAsync(int conversationId, int userId, int companyId);
        Task MarkMessageAsReadAsync(int messageId, int userId);
        Task<int> GetUnreadCountAsync(int userId, int companyId);
        Task<IEnumerable<UserDto>> GetAvailableUsersAsync(int userId, int companyId);
    }
}

