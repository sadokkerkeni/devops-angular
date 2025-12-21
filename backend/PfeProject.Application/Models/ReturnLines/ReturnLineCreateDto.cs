
public class ReturnLineCreateDto
{
    public string UsCode { get; set; } = string.Empty;
    public int Quantite { get; set; } // Changed to int
    public int ArticleId { get; set; }
    public int UserId { get; set; }
    public int StatusId { get; set; }
    public int? PicklistId { get; set; } // Optional link to original picklist
}
