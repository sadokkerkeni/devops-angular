using System;
using System.Collections.Generic;

namespace PfeProject.Domain.Entities
{
    public class Conversation
    {
        public int Id { get; set; }
        public int User1Id { get; set; }  // Premier utilisateur
        public int User2Id { get; set; }  // Deuxième utilisateur
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual User User1 { get; set; }
        public virtual User User2 { get; set; }
        public virtual ICollection<Message> Messages { get; set; } = new HashSet<Message>();

        // 🏢 Company relationship (pour isoler les conversations par entreprise)
        public int CompanyId { get; set; }
        public virtual Company Company { get; set; }
    }
}

