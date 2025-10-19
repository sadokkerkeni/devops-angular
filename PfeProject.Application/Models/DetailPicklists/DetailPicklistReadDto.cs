public class DetailPicklistReadDto
{
    public int Id { get; set; }
    public string Emplacement { get; set; }
    public string Quantite { get; set; }
    public ArticleDto Article { get; set; }
    public StatusDto Status { get; set; }
    public int PicklistId { get; set; }
    public bool IsActive { get; set; }
}
public class ArticleDto
{
    public int Id { get; set; }
    public string Designation { get; set; }
    public string CodeProduit { get; set; }
    // Add more fields if needed
}


