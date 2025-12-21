using System;

namespace PfeProject.Domain.Entities
{
    public class Message
    {
        public int Id { get; set; }
        public int ConversationId { get; set; }
        public int SenderId { get; set; }  // Utilisateur qui envoie le message
        public string Content { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual Conversation Conversation { get; set; }
        public virtual User Sender { get; set; }
    }
}

