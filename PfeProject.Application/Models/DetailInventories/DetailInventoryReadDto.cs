namespace PfeProject.Application.Models.DetailInventories
{
    public class DetailInventoryReadDto
    {
        public int Id { get; set; }
        public string UsCode { get; set; }
        public string ArticleCode { get; set; }

        public int LocationId { get; set; }
        public int InventoryId { get; set; }
        public int UserId { get; set; }
        public int SapId { get; set; }
    }
}
