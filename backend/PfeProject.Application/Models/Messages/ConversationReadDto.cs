using System;
using System.Collections.Generic;

namespace PfeProject.Application.Models.Messages
{
    public class ConversationReadDto
    {
        public int Id { get; set; }
        public int User1Id { get; set; }
        public string User1Name { get; set; } = string.Empty;
        public string User1Email { get; set; } = string.Empty;
        public int User2Id { get; set; }
        public string User2Name { get; set; } = string.Empty;
        public string User2Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public MessageReadDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
    }
}

