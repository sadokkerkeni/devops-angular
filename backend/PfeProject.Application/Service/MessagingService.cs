using PfeProject.Application.Interfaces;
using PfeProject.Application.Models.Messages;
using PfeProject.Domain.Entities;
using PfeProject.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PfeProject.Application.Services
{
    public class MessagingService : IMessagingService
    {
        private readonly IConversationRepository _conversationRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;

        public MessagingService(
            IConversationRepository conversationRepository,
            IMessageRepository messageRepository,
            IUserRepository userRepository)
        {
            _conversationRepository = conversationRepository;
            _messageRepository = messageRepository;
            _userRepository = userRepository;
        }

        public async Task<ConversationReadDto> GetOrCreateConversationAsync(int userId, int otherUserId, int companyId)
        {
            // Vérifier que les deux utilisateurs existent et appartiennent à la même entreprise
            var user1 = await _userRepository.GetByIdAndCompanyAsync(userId, companyId);
            var user2 = await _userRepository.GetByIdAndCompanyAsync(otherUserId, companyId);

            if (user1 == null || user2 == null)
                throw new Exception("Un ou plusieurs utilisateurs introuvables");

            // Chercher une conversation existante
            var conversation = await _conversationRepository.GetByUsersAsync(userId, otherUserId, companyId);

            if (conversation == null)
            {
                // Créer une nouvelle conversation
                conversation = new Conversation
                {
                    User1Id = userId < otherUserId ? userId : otherUserId,
                    User2Id = userId < otherUserId ? otherUserId : userId,
                    CompanyId = companyId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                conversation = await _conversationRepository.CreateAsync(conversation);
            }

            // Charger les utilisateurs pour le DTO
            conversation = await _conversationRepository.GetByIdAsync(conversation.Id);

            return MapToConversationReadDto(conversation!, userId);
        }

        public async Task<IEnumerable<ConversationReadDto>> GetUserConversationsAsync(int userId, int companyId)
        {
            var conversations = await _conversationRepository.GetUserConversationsAsync(userId, companyId);
            return conversations.Select(c => MapToConversationReadDto(c, userId));
        }

        public async Task<ConversationReadDto?> GetConversationByIdAsync(int conversationId, int userId, int companyId)
        {
            var conversation = await _conversationRepository.GetByIdAndCompanyAsync(conversationId, companyId);
            if (conversation == null) return null;

            // Vérifier que l'utilisateur fait partie de la conversation
            if (conversation.User1Id != userId && conversation.User2Id != userId)
                throw new UnauthorizedAccessException("Vous n'avez pas accès à cette conversation");

            conversation = await _conversationRepository.GetByIdAsync(conversationId);
            return MapToConversationReadDto(conversation!, userId);
        }

        public async Task<MessageReadDto> SendMessageAsync(MessageCreateDto dto, int senderId, int companyId)
        {
            // Vérifier que la conversation existe et que l'utilisateur y a accès
            var conversation = await _conversationRepository.GetByIdAndCompanyAsync(dto.ConversationId, companyId);
            if (conversation == null)
                throw new Exception("Conversation introuvable");

            if (conversation.User1Id != senderId && conversation.User2Id != senderId)
                throw new UnauthorizedAccessException("Vous n'avez pas accès à cette conversation");

            var message = new Message
            {
                ConversationId = dto.ConversationId,
                SenderId = senderId,
                Content = dto.Content,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                IsActive = true
            };

            message = await _messageRepository.CreateAsync(message);

            // Mettre à jour la date de mise à jour de la conversation
            conversation.UpdatedAt = DateTime.UtcNow;
            await _conversationRepository.UpdateAsync(conversation);

            // Charger le sender pour le DTO
            var sender = await _userRepository.GetUserByIdAsync(senderId);

            return new MessageReadDto
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderId = message.SenderId,
                SenderName = $"{sender?.FirstName} {sender?.LastName}",
                SenderEmail = sender?.Email ?? string.Empty,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                ReadAt = message.ReadAt
            };
        }

        public async Task<IEnumerable<MessageReadDto>> GetConversationMessagesAsync(int conversationId, int userId, int companyId)
        {
            // Vérifier que la conversation existe et que l'utilisateur y a accès
            var conversation = await _conversationRepository.GetByIdAndCompanyAsync(conversationId, companyId);
            if (conversation == null)
                throw new Exception("Conversation introuvable");

            if (conversation.User1Id != userId && conversation.User2Id != userId)
                throw new UnauthorizedAccessException("Vous n'avez pas accès à cette conversation");

            var messages = await _messageRepository.GetConversationMessagesAsync(conversationId, companyId);

            return messages.Select(m => new MessageReadDto
            {
                Id = m.Id,
                ConversationId = m.ConversationId,
                SenderId = m.SenderId,
                SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                SenderEmail = m.Sender.Email,
                Content = m.Content,
                SentAt = m.SentAt,
                IsRead = m.IsRead,
                ReadAt = m.ReadAt
            });
        }

        public async Task MarkMessageAsReadAsync(int messageId, int userId)
        {
            await _messageRepository.MarkAsReadAsync(messageId, userId);
        }

        public async Task<int> GetUnreadCountAsync(int userId, int companyId)
        {
            return await _messageRepository.GetUnreadCountAsync(userId, companyId);
        }

        public async Task<IEnumerable<UserDto>> GetAvailableUsersAsync(int userId, int companyId)
        {
            var users = await _userRepository.GetAllByCompanyAsync(companyId);
            return users
                .Where(u => u.Id != userId && u.State)
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Matricule = u.Matricule
                });
        }

        private ConversationReadDto MapToConversationReadDto(Conversation conversation, int currentUserId)
        {
            var lastMessage = conversation.Messages?.OrderByDescending(m => m.SentAt).FirstOrDefault();
            var unreadCount = conversation.Messages?.Count(m => m.SenderId != currentUserId && !m.IsRead) ?? 0;

            return new ConversationReadDto
            {
                Id = conversation.Id,
                User1Id = conversation.User1Id,
                User1Name = $"{conversation.User1.FirstName} {conversation.User1.LastName}",
                User1Email = conversation.User1.Email,
                User2Id = conversation.User2Id,
                User2Name = $"{conversation.User2.FirstName} {conversation.User2.LastName}",
                User2Email = conversation.User2.Email,
                CreatedAt = conversation.CreatedAt,
                UpdatedAt = conversation.UpdatedAt,
                LastMessage = lastMessage != null ? new MessageReadDto
                {
                    Id = lastMessage.Id,
                    ConversationId = lastMessage.ConversationId,
                    SenderId = lastMessage.SenderId,
                    SenderName = $"{lastMessage.Sender.FirstName} {lastMessage.Sender.LastName}",
                    SenderEmail = lastMessage.Sender.Email,
                    Content = lastMessage.Content,
                    SentAt = lastMessage.SentAt,
                    IsRead = lastMessage.IsRead,
                    ReadAt = lastMessage.ReadAt
                } : null,
                UnreadCount = unreadCount
            };
        }
    }
}

