namespace PfeProject.Application.Models.Messages
{
    public class MessageCreateDto
    {
        public int ConversationId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}

