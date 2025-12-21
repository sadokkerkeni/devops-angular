namespace PfeProject.Application.Models.MovementTraces
{
    public class MovementTraceCreateDto
    {
        public string UsNom { get; set; } = string.Empty;
        public int Quantite { get; set; } // Changed to int
        public int UserId { get; set; }
        public int DetailPicklistId { get; set; }
    }
}
