namespace PfeProject.Application.Models.DetailPicklists
{
    public class DetailPicklistUpdateDto
    {
        public string Emplacement { get; set; } = string.Empty;
        public int Quantite { get; set; } // Changed to int

        public int ArticleId { get; set; }
        public int PicklistId { get; set; }
        public int StatusId { get; set; }
    }
}
