namespace PfeProject.Application.Models.DetailPicklists
{
    public class DetailPicklistCreateDto
    {
        public string Emplacement { get; set; } = string.Empty;
        public int Quantite { get; set; } // Changed to int

        public int? ArticleId { get; set; }  // Optional - for backward compatibility
        public int? SapEntryId { get; set; } // NEW: SAP entry ID for dropdown selection
        public int PicklistId { get; set; }
        public int StatusId { get; set; }
    }
}
