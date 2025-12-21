public class ReturnLineUpdateDto
{
    public string UsCode { get; set; } = string.Empty;
    public int Quantite { get; set; } // Changed to int
    public int? StatusId { get; set; }
    public int? ArticleId { get; set; }
}
