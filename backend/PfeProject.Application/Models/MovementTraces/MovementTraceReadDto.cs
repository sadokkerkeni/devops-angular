namespace PfeProject.Application.Models.MovementTraces
{
    public class MovementTraceReadDto
    {
        public int Id { get; set; }
        public string UsNom { get; set; } = string.Empty;
        public int Quantite { get; set; } // Changed to int
        public DateTime DateMouvement { get; set; }
        public int UserId { get; set; }
        public int DetailPicklistId { get; set; }
        public string? DetailPicklistEmplacement { get; set; } // Nouvelle propriété
        public string? UserName { get; set; } // Nouvelle propriété

        public int ArticleId { get; set; }
        public bool IsActive { get; set; }
    }
}
