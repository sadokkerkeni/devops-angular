namespace PfeProject.Application.Models.DetailPicklists
{
    public class DetailPicklistReadDto
    {
        public int Id { get; set; }
        public string Emplacement { get; set; } = string.Empty;
        public int Quantite { get; set; } // Changed to int
        public ArticleDto? Article { get; set; }
        public PfeProject.Application.Models.Statuses.StatusReadDto? Status { get; set; }
        public int PicklistId { get; set; }
        public bool IsActive { get; set; }
    }
    public class ArticleDto
    {
        public int Id { get; set; }
        public string Designation { get; set; } = string.Empty;
        public string CodeProduit { get; set; } = string.Empty;
        // Add more fields if needed
    }
}


