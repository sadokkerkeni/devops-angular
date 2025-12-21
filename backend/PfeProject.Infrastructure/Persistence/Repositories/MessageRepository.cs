using Microsoft.EntityFrameworkCore;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using PfeProject.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Infrastructure.Persistence.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly ApplicationDbContext _context;

        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Message?> GetByIdAsync(int id)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Conversation)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<Message> CreateAsync(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task UpdateAsync(Message message)
        {
            _context.Messages.Update(message);
            await _context.SaveChangesAsync();
        }

        public async Task<IReadOnlyList<Message>> GetConversationMessagesAsync(int conversationId, int companyId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ConversationId == conversationId &&
                           m.Conversation.CompanyId == companyId &&
                           m.IsActive)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(int messageId, int userId)
        {
            var message = await _context.Messages
                .Include(m => m.Conversation)
                .FirstOrDefaultAsync(m => m.Id == messageId);

            if (message != null && message.SenderId != userId)
            {
                message.IsRead = true;
                message.ReadAt = System.DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int> GetUnreadCountAsync(int userId, int companyId)
        {
            return await _context.Messages
                .CountAsync(m => m.Conversation.CompanyId == companyId &&
                                (m.Conversation.User1Id == userId || m.Conversation.User2Id == userId) &&
                                m.SenderId != userId &&
                                !m.IsRead &&
                                m.IsActive);
        }

        public async Task<IReadOnlyList<Message>> GetUnreadMessagesAsync(int userId, int companyId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Conversation)
                .Where(m => m.Conversation.CompanyId == companyId &&
                           (m.Conversation.User1Id == userId || m.Conversation.User2Id == userId) &&
                           m.SenderId != userId &&
                           !m.IsRead &&
                           m.IsActive)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
        }
    }
}

