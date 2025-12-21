namespace PfeProject.Application.Models.DetailInventories
{
    public class DetailInventoryUpdateDto
    {
        public string ArticleCode { get; set; } = string.Empty;
        public int LocationId { get; set; }
        public int SapId { get; set; }
    }
}
