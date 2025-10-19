
namespace PfeProject.Application.Models.ReturnLines
{
    public class ReturnLineReadDto
    {
        public int Id { get; set; }
        public string UsCode { get; set; }
        public string Quantite { get; set; }
        public DateTime DateRetour { get; set; }
        public int ArticleId { get; set; }
        public string? ArticleCode { get; set; } // Nouvelle propriété
        public int UserId { get; set; }
        public string? UserName { get; set; } // Nouvelle propriété

        public int StatusId { get; set; }
        public string? StatusName { get; set; }
    }
}
